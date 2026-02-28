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

// GET: Liste aller Bars (mit Suche, Filter)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !(await isAdmin(session.user.id!))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search");
    const stadt = searchParams.get("stadt");
    const premiumTier = searchParams.get("premiumTier");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (stadt) {
      where.stadt = stadt;
    }

    if (premiumTier) {
      where.premiumTier = premiumTier;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { stadt: { contains: search } },
      ];
    }

    const [bars, total] = await Promise.all([
      prisma.bar.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          stadt: true,
          adresse: true,
          bewertungen: true,
          bewertungAnzahl: true,
          premiumTier: true,
          kapazitaet: true,
          createdAt: true,
          owner: { select: { id: true, name: true, email: true } },
          _count: {
            select: {
              reservierungen: true,
              spiele: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.bar.count({ where }),
    ]);

    return NextResponse.json({ bars, total, limit, offset });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// PATCH: Premium-Tier einer Bar ändern
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !(await isAdmin(session.user.id!))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await req.json();
    const { barId, premiumTier } = body;

    if (!barId || !premiumTier) {
      return NextResponse.json({ error: "barId und premiumTier erforderlich." }, { status: 400 });
    }

    const validTiers = ["BASIC", "PREMIUM", "TOP"];
    if (!validTiers.includes(premiumTier)) {
      return NextResponse.json({ error: "Ungültiger Premium-Tier." }, { status: 400 });
    }

    const updated = await prisma.bar.update({
      where: { id: barId },
      data: { premiumTier },
      select: { id: true, name: true, premiumTier: true },
    });

    return NextResponse.json({ success: true, bar: updated });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
