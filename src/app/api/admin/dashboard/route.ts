import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Plattform-weite KPIs (Admin-only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    // Admin-Check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Parallele Abfragen für Performance
    const [
      totalUsers,
      totalBars,
      totalSpiele,
      totalReservierungen,
      totalBewertungen,
      totalPromoDeals,
      usersThisMonth,
      usersLastMonth,
      barsThisMonth,
      reservierungenThisMonth,
      reservierungenLastMonth,
      usersByRole,
      barsByStadt,
      promoBuchungenBezahlt,
      recentUsers,
      recentBars,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.bar.count(),
      prisma.spiel.count(),
      prisma.reservierung.count(),
      prisma.bewertung.count(),
      prisma.promoDeal.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.bar.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.reservierung.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.reservierung.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
      prisma.bar.groupBy({ by: ["stadt"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
      prisma.promoBuchung.aggregate({
        where: { bezahlStatus: "BEZAHLT" },
        _sum: { gesamtPreis: true, provision: true, barAnteil: true },
        _count: { id: true },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.bar.findMany({
        select: { id: true, name: true, stadt: true, bewertungen: true, premiumTier: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Reservierungs-Status-Verteilung
    const reservierungsStatus = await prisma.reservierung.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return NextResponse.json({
      uebersicht: {
        users: totalUsers,
        bars: totalBars,
        spiele: totalSpiele,
        reservierungen: totalReservierungen,
        bewertungen: totalBewertungen,
        promoDeals: totalPromoDeals,
      },
      trends: {
        neueUsersDiesenMonat: usersThisMonth,
        neueUsersLetztenMonat: usersLastMonth,
        neueBarsDiesenMonat: barsThisMonth,
        reservierungenDiesenMonat: reservierungenThisMonth,
        reservierungenLetztenMonat: reservierungenLastMonth,
      },
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count.id,
      })),
      barsByStadt: barsByStadt.map((s) => ({
        stadt: s.stadt,
        count: s._count.id,
      })),
      reservierungsStatus: reservierungsStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      umsatz: {
        gesamt: promoBuchungenBezahlt._sum.gesamtPreis || 0,
        provision: promoBuchungenBezahlt._sum.provision || 0,
        barAnteile: promoBuchungenBezahlt._sum.barAnteil || 0,
        anzahlBuchungen: promoBuchungenBezahlt._count.id,
      },
      neueste: {
        users: recentUsers,
        bars: recentBars,
      },
    });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
