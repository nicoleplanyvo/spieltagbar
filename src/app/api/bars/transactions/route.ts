import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Zahlungshistorie für Bar-Owner (Promo-Buchungen)
export async function GET(req: Request) {
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
    const status = searchParams.get("status"); // BEZAHLT, AUSSTEHEND
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      promoDeal: { barId: bar.id },
    };

    if (status) {
      where.bezahlStatus = status;
    }

    const [buchungen, total] = await Promise.all([
      prisma.promoBuchung.findMany({
        where,
        include: {
          promoDeal: {
            select: {
              id: true,
              titel: true,
              preis: true,
              spielTag: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.promoBuchung.count({ where }),
    ]);

    // Zusammenfassung berechnen
    const bezahlteBuchungen = await prisma.promoBuchung.findMany({
      where: {
        promoDeal: { barId: bar.id },
        bezahlStatus: "BEZAHLT",
      },
    });

    const zusammenfassung = {
      gesamtUmsatz: bezahlteBuchungen.reduce((sum, b) => sum + b.gesamtPreis, 0),
      barAnteil: bezahlteBuchungen.reduce((sum, b) => sum + b.barAnteil, 0),
      provision: bezahlteBuchungen.reduce((sum, b) => sum + b.provision, 0),
      anzahlBuchungen: bezahlteBuchungen.length,
      ausstehend: await prisma.promoBuchung.count({
        where: {
          promoDeal: { barId: bar.id },
          auszahlStatus: "AUSSTEHEND",
          bezahlStatus: "BEZAHLT",
        },
      }),
    };

    return NextResponse.json({
      buchungen,
      total,
      limit,
      offset,
      zusammenfassung,
    });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
