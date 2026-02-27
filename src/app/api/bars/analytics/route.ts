import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Dashboard-KPIs für Bar-Owner
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const bar = await prisma.bar.findUnique({
      where: { ownerId: session.user.id! },
    });

    if (!bar) {
      return NextResponse.json({ error: "Keine Bar gefunden." }, { status: 404 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Alle Reservierungen laden
    const alleReservierungen = await prisma.reservierung.findMany({
      where: { barId: bar.id },
    });

    const reservierungenDiesenMonat = alleReservierungen.filter(
      (r) => r.createdAt >= startOfMonth
    );
    const reservierungenLetztenMonat = alleReservierungen.filter(
      (r) => r.createdAt >= startOfLastMonth && r.createdAt < startOfMonth
    );

    // Status-Verteilung
    const statusCounts = {
      ausstehend: alleReservierungen.filter((r) => r.status === "AUSSTEHEND").length,
      bestaetigt: alleReservierungen.filter((r) => r.status === "BESTAETIGT").length,
      abgelehnt: alleReservierungen.filter((r) => r.status === "ABGELEHNT").length,
      storniert: alleReservierungen.filter((r) => r.status === "STORNIERT").length,
      noShow: alleReservierungen.filter((r) => r.status === "NO_SHOW").length,
    };

    // No-Show-Rate
    const bestaetigteUndNoShow = statusCounts.bestaetigt + statusCounts.noShow;
    const noShowRate = bestaetigteUndNoShow > 0
      ? Math.round((statusCounts.noShow / bestaetigteUndNoShow) * 100)
      : 0;

    // Gesamtpersonen (bestätigt)
    const gesamtGaeste = alleReservierungen
      .filter((r) => r.status === "BESTAETIGT")
      .reduce((sum, r) => sum + r.personen, 0);

    // Durchschnittliche Gruppengröße
    const bestaetigteRes = alleReservierungen.filter((r) => r.status === "BESTAETIGT");
    const durchschnittlicheGruppe = bestaetigteRes.length > 0
      ? Math.round((gesamtGaeste / bestaetigteRes.length) * 10) / 10
      : 0;

    // Kapazitätsrate (basierend auf bestätigten Reservierungen vs Kapazität)
    const naechsteSpiele = await prisma.barSpiel.findMany({
      where: {
        barId: bar.id,
        spiel: { anpfiff: { gte: now } },
      },
      include: { spiel: true },
    });

    // Top-Teams (aus zugewiesenen Spielen)
    const teamCounts: Record<string, number> = {};
    const alleBarSpiele = await prisma.barSpiel.findMany({
      where: { barId: bar.id },
      include: { spiel: true },
    });

    alleBarSpiele.forEach((bs) => {
      teamCounts[bs.spiel.heimTeam] = (teamCounts[bs.spiel.heimTeam] || 0) + 1;
      teamCounts[bs.spiel.gastTeam] = (teamCounts[bs.spiel.gastTeam] || 0) + 1;
    });

    const topTeams = Object.entries(teamCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([team, count]) => ({ team, count }));

    // Promo-Deals Statistik
    const promoDeals = await prisma.promoDeal.findMany({
      where: { barId: bar.id },
      include: { buchungen: true },
    });

    const promoStats = {
      aktiveDeals: promoDeals.filter((d) => d.aktiv).length,
      gesamtBuchungen: promoDeals.reduce((sum, d) => sum + d.buchungen.length, 0),
      gesamtUmsatz: promoDeals.reduce(
        (sum, d) => sum + d.buchungen
          .filter((b) => b.bezahlStatus === "BEZAHLT")
          .reduce((s, b) => s + b.barAnteil, 0),
        0
      ),
    };

    // Bewertungen
    const bewertungsStats = {
      durchschnitt: bar.bewertungen,
      anzahl: bar.bewertungAnzahl,
    };

    return NextResponse.json({
      reservierungen: {
        gesamt: alleReservierungen.length,
        diesenMonat: reservierungenDiesenMonat.length,
        letztenMonat: reservierungenLetztenMonat.length,
        trend: reservierungenDiesenMonat.length - reservierungenLetztenMonat.length,
        status: statusCounts,
        noShowRate,
        gesamtGaeste,
        durchschnittlicheGruppe,
      },
      spiele: {
        naechste: naechsteSpiele.length,
        gesamt: alleBarSpiele.length,
        topTeams,
      },
      promos: promoStats,
      bewertungen: bewertungsStats,
      kapazitaet: bar.kapazitaet,
    });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
