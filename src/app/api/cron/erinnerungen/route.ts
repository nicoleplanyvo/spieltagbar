import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendReservierungErinnerungEmail,
  sendSpieltagReminderEmail,
} from "@/lib/email";

/**
 * Cron-Job: Reservierungserinnerungen + Spieltag-Reminder versenden
 *
 * Taeglich um 10:00 Uhr ausfuehren:
 * curl -s https://spieltagbar.de/api/cron/erinnerungen?secret=DEIN_CRON_SECRET
 *
 * Sendet:
 * 1. Reservierungserinnerung an Fans mit Reservierung fuer morgen
 * 2. Spieltag-Reminder an Fans die heute ein Spiel in ihrer Bar haben
 */
export async function GET(req: Request) {
  // Cron-Secret pruefen
  const cronSecret =
    req.headers.get("x-cron-secret") ||
    new URL(req.url).searchParams.get("secret");

  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const now = new Date();
    const results = {
      reservierungErinnerungen: 0,
      spieltagReminder: 0,
      errors: [] as string[],
    };

    // === 1. Reservierungserinnerungen (fuer morgen) ===
    const morgenStart = new Date(now);
    morgenStart.setDate(morgenStart.getDate() + 1);
    morgenStart.setHours(0, 0, 0, 0);

    const morgenEnde = new Date(morgenStart);
    morgenEnde.setHours(23, 59, 59, 999);

    // Alle bestaetigten Reservierungen fuer morgen
    const reservierungenMorgen = await prisma.reservierung.findMany({
      where: {
        datum: { gte: morgenStart, lte: morgenEnde },
        status: "BESTAETIGT",
        userId: { not: null },
      },
      include: {
        user: { select: { email: true, name: true } },
        bar: { select: { name: true, adresse: true, stadt: true, slug: true } },
      },
    });

    const datumFormat = new Intl.DateTimeFormat("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    for (const res of reservierungenMorgen) {
      if (!res.user?.email) continue;

      try {
        await sendReservierungErinnerungEmail(res.user.email, {
          name: res.user.name || "Fussballfan",
          barName: res.bar.name,
          barAdresse: `${res.bar.adresse}, ${res.bar.stadt}`,
          datum: datumFormat.format(res.datum),
          personen: res.personen,
          barSlug: res.bar.slug,
        });
        results.reservierungErinnerungen++;
      } catch (err) {
        results.errors.push(`Erinnerung an ${res.user.email}: ${err}`);
      }
    }

    // === 2. Spieltag-Reminder (fuer heute) ===
    const heuteStart = new Date(now);
    heuteStart.setHours(0, 0, 0, 0);

    const heuteEnde = new Date(heuteStart);
    heuteEnde.setHours(23, 59, 59, 999);

    // Alle bestaetigten Reservierungen fuer heute, mit zugehoerigen Spielen
    const reservierungenHeute = await prisma.reservierung.findMany({
      where: {
        datum: { gte: heuteStart, lte: heuteEnde },
        status: "BESTAETIGT",
        userId: { not: null },
      },
      include: {
        user: { select: { email: true, name: true } },
        bar: {
          select: {
            name: true,
            slug: true,
            spiele: {
              where: {
                spiel: {
                  anpfiff: { gte: heuteStart, lte: heuteEnde },
                },
              },
              include: {
                spiel: {
                  select: { heimTeam: true, gastTeam: true, anpfiff: true },
                },
              },
            },
          },
        },
      },
    });

    // Gruppiere per User (ein User kann mehrere Reservierungen haben)
    const userSpiele = new Map<
      string,
      {
        email: string;
        name: string;
        spiele: Array<{
          heimTeam: string;
          gastTeam: string;
          anpfiff: string;
          barName: string;
          barSlug: string;
        }>;
      }
    >();

    const zeitFormat = new Intl.DateTimeFormat("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    for (const res of reservierungenHeute) {
      if (!res.user?.email || res.bar.spiele.length === 0) continue;

      const key = res.user.email;
      if (!userSpiele.has(key)) {
        userSpiele.set(key, {
          email: res.user.email,
          name: res.user.name || "Fussballfan",
          spiele: [],
        });
      }

      const entry = userSpiele.get(key)!;
      for (const bs of res.bar.spiele) {
        // Duplikate vermeiden
        const exists = entry.spiele.some(
          (s) =>
            s.heimTeam === bs.spiel.heimTeam &&
            s.gastTeam === bs.spiel.gastTeam
        );
        if (!exists) {
          entry.spiele.push({
            heimTeam: bs.spiel.heimTeam,
            gastTeam: bs.spiel.gastTeam,
            anpfiff: zeitFormat.format(bs.spiel.anpfiff) + " Uhr",
            barName: res.bar.name,
            barSlug: res.bar.slug,
          });
        }
      }
    }

    for (const [, userData] of userSpiele) {
      if (userData.spiele.length === 0) continue;

      try {
        await sendSpieltagReminderEmail(userData.email, {
          name: userData.name,
          spiele: userData.spiele,
        });
        results.spieltagReminder++;
      } catch (err) {
        results.errors.push(`Spieltag-Reminder an ${userData.email}: ${err}`);
      }
    }

    console.log(
      `📧 Erinnerungen: ${results.reservierungErinnerungen} Reservierungs-Erinnerungen, ` +
        `${results.spieltagReminder} Spieltag-Reminder, ${results.errors.length} Fehler`
    );

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Cron Erinnerungen Fehler:", error);
    return NextResponse.json(
      { error: "Erinnerungen fehlgeschlagen." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
