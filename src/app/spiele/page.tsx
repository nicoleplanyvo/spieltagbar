import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SpieleClient } from "@/components/spiele/SpieleClient";

export const metadata: Metadata = {
  title: "Spielplan",
  description: "Aktueller Fußball-Spielplan — Bundesliga, Champions League, Europa League und mehr. Finde die besten Bars zu jedem Spiel.",
};

async function getSpiele() {
  return prisma.spiel.findMany({
    include: {
      bars: {
        include: { bar: { select: { id: true, name: true, stadt: true } } },
      },
    },
    orderBy: { anpfiff: "asc" },
  });
}

async function getLigen() {
  const ligen = await prisma.spiel.groupBy({
    by: ["liga"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  return ligen.map((l) => ({ name: l.liga, count: l._count.id }));
}

export default async function SpielePage() {
  const [spiele, ligen] = await Promise.all([getSpiele(), getLigen()]);

  // Serialisieren für Client
  const spieleData = spiele.map((s) => ({
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

  return <SpieleClient spiele={spieleData} ligen={ligen} />;
}
