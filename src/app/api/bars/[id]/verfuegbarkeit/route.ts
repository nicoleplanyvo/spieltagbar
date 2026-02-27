import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Echtzeit-Verfügbarkeit einer Bar für ein bestimmtes Datum
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: barId } = await params;
    const { searchParams } = new URL(req.url);
    const datum = searchParams.get("datum");

    if (!datum) {
      return NextResponse.json(
        { error: "Datum ist erforderlich (?datum=2025-06-15)." },
        { status: 400 }
      );
    }

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      select: { id: true, name: true, kapazitaet: true, hatReservierung: true },
    });

    if (!bar) {
      return NextResponse.json({ error: "Bar nicht gefunden." }, { status: 404 });
    }

    if (!bar.hatReservierung) {
      return NextResponse.json({
        barId: bar.id,
        barName: bar.name,
        hatReservierung: false,
        message: "Diese Bar nimmt keine Reservierungen an.",
      });
    }

    // Datum-Range für den Tag berechnen
    const tag = new Date(datum);
    const tagStart = new Date(tag.getFullYear(), tag.getMonth(), tag.getDate());
    const tagEnde = new Date(tag.getFullYear(), tag.getMonth(), tag.getDate() + 1);

    // Bestätigte + ausstehende Reservierungen für diesen Tag
    const reservierungen = await prisma.reservierung.findMany({
      where: {
        barId,
        datum: { gte: tagStart, lt: tagEnde },
        status: { in: ["AUSSTEHEND", "BESTAETIGT"] },
      },
      select: {
        personen: true,
        status: true,
        datum: true,
      },
    });

    const reserviertePersonen = reservierungen.reduce(
      (sum, r) => sum + r.personen,
      0
    );

    const bestaetigtePersonen = reservierungen
      .filter((r) => r.status === "BESTAETIGT")
      .reduce((sum, r) => sum + r.personen, 0);

    const austehendePersonen = reservierungen
      .filter((r) => r.status === "AUSSTEHEND")
      .reduce((sum, r) => sum + r.personen, 0);

    // Spiele an diesem Tag bei dieser Bar
    const spiele = await prisma.barSpiel.findMany({
      where: {
        barId,
        spiel: {
          anpfiff: { gte: tagStart, lt: tagEnde },
        },
      },
      include: {
        spiel: {
          select: {
            id: true,
            heimTeam: true,
            gastTeam: true,
            anpfiff: true,
            liga: true,
            status: true,
          },
        },
      },
    });

    // Effektive Kapazität (BarSpiel-spezifisch oder Bar-Default)
    const spielKapazitaeten = spiele.map((bs) => ({
      spielId: bs.spiel.id,
      heimTeam: bs.spiel.heimTeam,
      gastTeam: bs.spiel.gastTeam,
      anpfiff: bs.spiel.anpfiff,
      kapazitaet: bs.plaetze || bar.kapazitaet,
    }));

    const verfuegbar = bar.kapazitaet - reserviertePersonen;

    return NextResponse.json({
      barId: bar.id,
      barName: bar.name,
      hatReservierung: true,
      datum: datum,
      kapazitaet: bar.kapazitaet,
      reserviertePersonen,
      bestaetigtePersonen,
      austehendePersonen,
      verfuegbarePlaetze: Math.max(0, verfuegbar),
      auslastung: Math.round((reserviertePersonen / bar.kapazitaet) * 100),
      ausgebucht: verfuegbar <= 0,
      anzahlReservierungen: reservierungen.length,
      spiele: spielKapazitaeten,
    });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
