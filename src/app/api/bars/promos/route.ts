import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Promo-Deal erstellen
export async function POST(req: Request) {
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

    const { titel, beschreibung, preis, originalPreis, maxPlaetze, spielTag, gueltigVon, gueltigBis } = await req.json();

    if (!titel || !preis || !maxPlaetze || !gueltigVon || !gueltigBis) {
      return NextResponse.json(
        { error: "Titel, Preis, Plätze und Gültigkeitszeitraum sind erforderlich." },
        { status: 400 }
      );
    }

    const deal = await prisma.promoDeal.create({
      data: {
        barId: bar.id,
        titel,
        beschreibung: beschreibung || null,
        preis: parseFloat(preis),
        originalPreis: originalPreis ? parseFloat(originalPreis) : null,
        maxPlaetze: parseInt(maxPlaetze),
        spielTag: spielTag ? new Date(spielTag) : null,
        gueltigVon: new Date(gueltigVon),
        gueltigBis: new Date(gueltigBis),
        aktiv: true,
      },
    });

    return NextResponse.json(deal);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// Promo-Deal aktualisieren
export async function PATCH(req: Request) {
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

    const { id, aktiv, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID ist erforderlich." }, { status: 400 });
    }

    const deal = await prisma.promoDeal.findFirst({
      where: { id, barId: bar.id },
    });

    if (!deal) {
      return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (aktiv !== undefined) data.aktiv = aktiv;
    if (updates.titel) data.titel = updates.titel;
    if (updates.preis) data.preis = parseFloat(updates.preis);
    if (updates.maxPlaetze) data.maxPlaetze = parseInt(updates.maxPlaetze);

    const updated = await prisma.promoDeal.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// Promo-Deals der eigenen Bar abrufen
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

    const deals = await prisma.promoDeal.findMany({
      where: { barId: bar.id },
      include: {
        buchungen: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deals);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
