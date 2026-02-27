import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST: Manuelle Reservierung durch Barbesitzer (z.B. Telefon)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const bar = await prisma.bar.findUnique({
      where: { ownerId: session.user.id },
    });

    if (!bar) {
      return NextResponse.json({ error: "Keine Bar gefunden." }, { status: 403 });
    }

    const { gastName, gastTelefon, datum, personen, notiz } = await req.json();

    if (!gastName || !datum || !personen) {
      return NextResponse.json(
        { error: "Name, Datum und Personenzahl sind erforderlich." },
        { status: 400 }
      );
    }

    const reservierung = await prisma.reservierung.create({
      data: {
        barId: bar.id,
        datum: new Date(datum),
        personen: parseInt(personen),
        gastName,
        gastTelefon: gastTelefon || null,
        notiz: notiz || null,
        quelle: "TELEFON",
        status: "BESTAETIGT",
      },
    });

    return NextResponse.json({
      ...reservierung,
      datum: reservierung.datum.toISOString(),
      createdAt: reservierung.createdAt.toISOString(),
      updatedAt: reservierung.updatedAt.toISOString(),
      user: null,
    });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
