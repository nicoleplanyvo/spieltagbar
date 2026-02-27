import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const includeAll = req.nextUrl.searchParams.get("includeAll") === "true";
    const liga = req.nextUrl.searchParams.get("liga");
    const search = req.nextUrl.searchParams.get("search");

    const where: Record<string, unknown> = {};

    // Standard: Spiele der letzten 4 Tage + zukünftige. includeAll=true zeigt alles.
    if (!includeAll) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 4);
      cutoff.setHours(0, 0, 0, 0);
      where.anpfiff = { gte: cutoff };
    }

    // Liga-Filter
    if (liga) {
      where.liga = liga;
    }

    // Team-Suche
    if (search) {
      where.OR = [
        { heimTeam: { contains: search } },
        { gastTeam: { contains: search } },
        { liga: { contains: search } },
      ];
    }

    const spiele = await prisma.spiel.findMany({
      where,
      include: {
        bars: {
          include: { bar: { select: { id: true, name: true, stadt: true } } },
        },
      },
      orderBy: { anpfiff: "asc" },
    });

    const serialized = spiele.map((s) => ({
      id: s.id,
      heimTeam: s.heimTeam,
      gastTeam: s.gastTeam,
      liga: s.liga,
      saison: s.saison,
      spieltag: s.spieltag,
      anpfiff: s.anpfiff.toISOString(),
      tvSender: s.tvSender,
      status: s.status,
      ergebnis: s.ergebnis,
      bars: s.bars.map((bs) => ({
        id: bs.id,
        barId: bs.bar.id,
        barName: bs.bar.name,
        barStadt: bs.bar.stadt,
      })),
    }));

    return NextResponse.json(serialized);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
