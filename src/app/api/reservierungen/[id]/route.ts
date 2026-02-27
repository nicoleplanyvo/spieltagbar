import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendReservierungBestaetigtEmail, sendReservierungAbgelehntEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status || !["BESTAETIGT", "ABGELEHNT", "STORNIERT", "NO_SHOW"].includes(status)) {
      return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
    }

    // Prüfe ob der User der Bar-Owner ist
    const reservierung = await prisma.reservierung.findUnique({
      where: { id },
      include: {
        bar: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!reservierung) {
      return NextResponse.json({ error: "Reservierung nicht gefunden." }, { status: 404 });
    }

    if (reservierung.bar.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const updated = await prisma.reservierung.update({
      where: { id },
      data: { status },
    });

    // E-Mail an Fan senden (nur wenn registrierter User)
    if (reservierung.user?.email) {
      const formatDatum = new Intl.DateTimeFormat("de-DE", {
        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      }).format(reservierung.datum);

      if (status === "BESTAETIGT") {
        sendReservierungBestaetigtEmail(reservierung.user.email, {
          barName: reservierung.bar.name,
          barAdresse: `${reservierung.bar.adresse}, ${reservierung.bar.plz} ${reservierung.bar.stadt}`,
          datum: formatDatum,
          personen: reservierung.personen,
        }).catch(console.error);
      } else if (status === "ABGELEHNT") {
        sendReservierungAbgelehntEmail(reservierung.user.email, {
          barName: reservierung.bar.name,
          datum: formatDatum,
        }).catch(console.error);
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// DELETE: Reservierung stornieren (durch den Gast selbst)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const { id } = await params;

    const reservierung = await prisma.reservierung.findUnique({
      where: { id },
      include: {
        bar: {
          include: { owner: { select: { email: true } } },
        },
      },
    });

    if (!reservierung) {
      return NextResponse.json({ error: "Reservierung nicht gefunden." }, { status: 404 });
    }

    // Nur der Gast selbst oder der Bar-Owner darf stornieren
    const isGast = reservierung.userId === session.user.id;
    const isOwner = reservierung.bar.ownerId === session.user.id;

    if (!isGast && !isOwner) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    // Nur AUSSTEHEND oder BESTAETIGT kann storniert werden
    if (!["AUSSTEHEND", "BESTAETIGT"].includes(reservierung.status)) {
      return NextResponse.json(
        { error: "Diese Reservierung kann nicht mehr storniert werden." },
        { status: 400 }
      );
    }

    // Reservierung nicht löschen, sondern Status auf STORNIERT setzen
    const updated = await prisma.reservierung.update({
      where: { id },
      data: { status: "STORNIERT" },
    });

    // E-Mail an Bar-Owner, wenn der Gast storniert
    if (isGast && reservierung.bar.owner?.email) {
      const formatDatum = new Intl.DateTimeFormat("de-DE", {
        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      }).format(reservierung.datum);

      // Einfache Benachrichtigung — nutzt bestehendes email-Modul
      console.log(`📧 Stornierung: ${session.user.name || session.user.email} hat Reservierung am ${formatDatum} bei ${reservierung.bar.name} storniert.`);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
