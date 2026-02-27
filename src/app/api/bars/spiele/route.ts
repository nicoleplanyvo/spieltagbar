import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Spiel zu einer Bar hinzufügen
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

    const { spielId, hatTon, plaetze } = await req.json();

    if (!spielId) {
      return NextResponse.json({ error: "Spiel-ID ist erforderlich." }, { status: 400 });
    }

    // Prüfe ob Spiel existiert
    const spiel = await prisma.spiel.findUnique({ where: { id: spielId } });
    if (!spiel) {
      return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });
    }

    // Prüfe ob schon verknüpft
    const existing = await prisma.barSpiel.findUnique({
      where: { barId_spielId: { barId: bar.id, spielId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Spiel bereits hinzugefügt." }, { status: 400 });
    }

    const barSpiel = await prisma.barSpiel.create({
      data: {
        barId: bar.id,
        spielId,
        hatTon: hatTon ?? true,
        plaetze: plaetze ? parseInt(plaetze) : null,
      },
      include: { spiel: true },
    });

    return NextResponse.json(barSpiel);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// BarSpiel aktualisieren (Kapazität ändern)
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

    const { barSpielId, plaetze, hatTon } = await req.json();

    if (!barSpielId) {
      return NextResponse.json({ error: "BarSpiel-ID ist erforderlich." }, { status: 400 });
    }

    const barSpiel = await prisma.barSpiel.findFirst({
      where: { id: barSpielId, barId: bar.id },
    });

    if (!barSpiel) {
      return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    }

    const updated = await prisma.barSpiel.update({
      where: { id: barSpielId },
      data: {
        ...(plaetze !== undefined && { plaetze: plaetze ? parseInt(plaetze) : null }),
        ...(hatTon !== undefined && { hatTon }),
      },
      include: { spiel: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// BarSpiel entfernen
export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const barSpielId = searchParams.get("id");

    if (!barSpielId) {
      return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });
    }

    const barSpiel = await prisma.barSpiel.findFirst({
      where: { id: barSpielId, barId: bar.id },
    });

    if (!barSpiel) {
      return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    }

    await prisma.barSpiel.delete({ where: { id: barSpielId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
