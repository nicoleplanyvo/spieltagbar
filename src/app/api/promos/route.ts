import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Öffentliche Promo-Deals durchsuchen (für Fans)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const barId = searchParams.get("barId");
    const stadt = searchParams.get("stadt");
    const q = searchParams.get("q");
    const aktiv = searchParams.get("aktiv");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      aktiv: true,
      gueltigBis: { gte: new Date() },
    };

    // Nur inaktive auch zeigen wenn explizit angefragt (z.B. für Admin)
    if (aktiv === "all") {
      delete where.aktiv;
    }

    if (barId) {
      where.barId = barId;
    }

    if (stadt) {
      where.bar = { stadt: { contains: stadt } };
    }

    if (q) {
      where.OR = [
        { titel: { contains: q } },
        { beschreibung: { contains: q } },
        { bar: { name: { contains: q } } },
      ];
    }

    const deals = await prisma.promoDeal.findMany({
      where,
      include: {
        bar: {
          select: {
            id: true,
            name: true,
            slug: true,
            stadt: true,
            adresse: true,
            plz: true,
            bildUrl: true,
            bewertungen: true,
            bewertungAnzahl: true,
          },
        },
      },
      orderBy: [{ gueltigBis: "asc" }],
    });

    // Verfügbare Plätze berechnen
    const result = deals.map((deal) => ({
      ...deal,
      verfuegbarePlaetze: deal.maxPlaetze - deal.gebuchtePlaetze,
      ausverkauft: deal.gebuchtePlaetze >= deal.maxPlaetze,
      ersparnis: deal.originalPreis
        ? Math.round(((deal.originalPreis - deal.preis) / deal.originalPreis) * 100)
        : null,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
