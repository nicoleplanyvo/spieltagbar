import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// GET: Liste aller Nutzer (mit Suche, Filter, Pagination)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !(await isAdmin(session.user.id!))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              reservierungen: true,
              bewertungen: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, limit, offset });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// PATCH: Rolle eines Nutzers ändern
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !(await isAdmin(session.user.id!))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "userId und role erforderlich." }, { status: 400 });
    }

    const validRoles = ["FAN", "BAR_OWNER", "ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Ungültige Rolle." }, { status: 400 });
    }

    // Sich selbst nicht degradieren
    if (userId === session.user.id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Du kannst deine eigene Admin-Rolle nicht entfernen." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
