import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Eigene Favoriten-Bars laden
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const favoriten = await prisma.favorit.findMany({
      where: { userId: session.user.id! },
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
            hatLeinwand: true,
            hatBeamer: true,
            biergarten: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favoriten);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// POST: Bar als Favorit hinzufügen
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const { barId } = await req.json();

    if (!barId) {
      return NextResponse.json({ error: "barId ist erforderlich." }, { status: 400 });
    }

    // Prüfen ob Bar existiert
    const bar = await prisma.bar.findUnique({ where: { id: barId } });
    if (!bar) {
      return NextResponse.json({ error: "Bar nicht gefunden." }, { status: 404 });
    }

    // Bereits favorisiert?
    const existing = await prisma.favorit.findUnique({
      where: {
        userId_barId: {
          userId: session.user.id!,
          barId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Bereits als Favorit gespeichert." }, { status: 409 });
    }

    const favorit = await prisma.favorit.create({
      data: {
        userId: session.user.id!,
        barId,
      },
    });

    return NextResponse.json(favorit, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// DELETE: Bar aus Favoriten entfernen
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const barId = searchParams.get("barId");

    if (!barId) {
      return NextResponse.json({ error: "barId ist erforderlich." }, { status: 400 });
    }

    const existing = await prisma.favorit.findUnique({
      where: {
        userId_barId: {
          userId: session.user.id!,
          barId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Favorit nicht gefunden." }, { status: 404 });
    }

    await prisma.favorit.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
