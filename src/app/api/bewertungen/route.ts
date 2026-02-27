import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Bewertungen für eine Bar laden
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const barId = searchParams.get("barId");

    if (!barId) {
      return NextResponse.json({ error: "barId erforderlich." }, { status: 400 });
    }

    const bewertungen = await prisma.bewertung.findMany({
      where: { barId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bewertungen);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// POST: Neue Bewertung abgeben oder bestehende aktualisieren
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const { barId, sterne, kommentar } = await req.json();

    if (!barId || !sterne) {
      return NextResponse.json(
        { error: "Bar und Sterne-Bewertung sind erforderlich." },
        { status: 400 }
      );
    }

    if (sterne < 1 || sterne > 5) {
      return NextResponse.json(
        { error: "Bewertung muss zwischen 1 und 5 Sternen liegen." },
        { status: 400 }
      );
    }

    // Prüfen ob der User der Bar-Owner ist
    const bar = await prisma.bar.findUnique({ where: { id: barId } });
    if (!bar) {
      return NextResponse.json({ error: "Bar nicht gefunden." }, { status: 404 });
    }
    if (bar.ownerId === session.user.id) {
      return NextResponse.json(
        { error: "Du kannst deine eigene Bar nicht bewerten." },
        { status: 400 }
      );
    }

    // Upsert: Erstellen oder aktualisieren
    const bewertung = await prisma.bewertung.upsert({
      where: {
        userId_barId: {
          userId: session.user.id!,
          barId,
        },
      },
      update: {
        sterne,
        kommentar: kommentar || null,
      },
      create: {
        userId: session.user.id!,
        barId,
        sterne,
        kommentar: kommentar || null,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Durchschnitt und Anzahl neu berechnen
    const stats = await prisma.bewertung.aggregate({
      where: { barId },
      _avg: { sterne: true },
      _count: { sterne: true },
    });

    await prisma.bar.update({
      where: { id: barId },
      data: {
        bewertungen: stats._avg.sterne || 0,
        bewertungAnzahl: stats._count.sterne || 0,
      },
    });

    return NextResponse.json(bewertung);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
