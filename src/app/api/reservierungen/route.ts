import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendNeueReservierungEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert." },
        { status: 401 }
      );
    }

    const { barId, datum, personen, notiz } = await req.json();

    if (!barId || !datum || !personen) {
      return NextResponse.json(
        { error: "Bar, Datum und Personenzahl sind erforderlich." },
        { status: 400 }
      );
    }

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: { select: { email: true } } },
    });
    if (!bar) {
      return NextResponse.json(
        { error: "Bar nicht gefunden." },
        { status: 404 }
      );
    }

    const reservierung = await prisma.reservierung.create({
      data: {
        userId: session.user.id!,
        barId,
        datum: new Date(datum),
        personen: parseInt(personen),
        notiz: notiz || null,
        status: "AUSSTEHEND",
      },
    });

    // E-Mail an Bar-Owner senden
    const formatDatum = new Intl.DateTimeFormat("de-DE", {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(datum));

    sendNeueReservierungEmail(bar.owner.email, {
      barName: bar.name,
      gastName: session.user.name || session.user.email || "Unbekannt",
      datum: formatDatum,
      personen: parseInt(personen),
      notiz: notiz || undefined,
    }).catch(console.error);

    return NextResponse.json(reservierung);
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
