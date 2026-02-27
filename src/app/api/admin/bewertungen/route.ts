import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Hilfsfunktion: Admin-Check
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// GET: Alle Bewertungen mit Filter (Admin-only)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(await isAdmin(session.user.id!))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const barId = searchParams.get("barId");
    const userId = searchParams.get("userId");
    const minSterne = searchParams.get("minSterne");
    const maxSterne = searchParams.get("maxSterne");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (barId) where.barId = barId;
    if (userId) where.userId = userId;
    if (minSterne) where.sterne = { ...where.sterne, gte: parseInt(minSterne) };
    if (maxSterne) where.sterne = { ...where.sterne, lte: parseInt(maxSterne) };

    const [bewertungen, total] = await Promise.all([
      prisma.bewertung.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          bar: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.bewertung.count({ where }),
    ]);

    return NextResponse.json({ bewertungen, total, limit, offset });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// DELETE: Bewertung löschen (Admin-only, z.B. Spam-Entfernung)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(await isAdmin(session.user.id!))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Bewertungs-ID erforderlich." }, { status: 400 });
    }

    const bewertung = await prisma.bewertung.findUnique({
      where: { id },
    });

    if (!bewertung) {
      return NextResponse.json({ error: "Bewertung nicht gefunden." }, { status: 404 });
    }

    // Löschen
    await prisma.bewertung.delete({ where: { id } });

    // Durchschnitt und Anzahl der Bar neu berechnen
    const stats = await prisma.bewertung.aggregate({
      where: { barId: bewertung.barId },
      _avg: { sterne: true },
      _count: { sterne: true },
    });

    await prisma.bar.update({
      where: { id: bewertung.barId },
      data: {
        bewertungen: stats._avg.sterne || 0,
        bewertungAnzahl: stats._count.sterne || 0,
      },
    });

    return NextResponse.json({ success: true, message: "Bewertung gelöscht." });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
