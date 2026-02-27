import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BarDashboardClient } from "@/components/dashboard/BarDashboardClient";
import { BarErstellenForm } from "@/components/dashboard/BarErstellenForm";

export default async function BarDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== "BAR_OWNER") {
    redirect("/dashboard");
  }

  const bar = await prisma.bar.findUnique({
    where: { ownerId: user.id },
    include: {
      fotos: { orderBy: { sortOrder: "asc" } },
      spiele: {
        include: { spiel: true },
        where: {
          spiel: { anpfiff: { gte: new Date() } },
        },
      },
      reservierungen: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { datum: "desc" },
      },
      promoDeals: {
        orderBy: { createdAt: "desc" },
        include: { buchungen: true },
      },
    },
  });

  if (!bar) {
    return <BarErstellenForm />;
  }

  // KPIs berechnen
  const alleRes = bar.reservierungen;
  const totalRes = alleRes.length;
  const bestaetigteRes = alleRes.filter((r) => r.status === "BESTAETIGT");
  const noShowRes = alleRes.filter((r) => r.status === "NO_SHOW");
  const stornierteRes = alleRes.filter((r) => r.status === "STORNIERT");

  const noShowRate = bestaetigteRes.length + noShowRes.length > 0
    ? (noShowRes.length / (bestaetigteRes.length + noShowRes.length)) * 100
    : 0;

  const bestaetigungsRate = totalRes > 0
    ? (bestaetigteRes.length / totalRes) * 100
    : 0;

  const stornierungsRate = totalRes > 0
    ? (stornierteRes.length / totalRes) * 100
    : 0;

  // Durchschnittliche Gruppengröße
  const durchschnGruppe = totalRes > 0
    ? alleRes.reduce((sum, r) => sum + r.personen, 0) / totalRes
    : 0;

  // Bestätigte Gäste total
  const totalGaeste = bestaetigteRes.reduce((sum, r) => sum + r.personen, 0);

  // Kapazitätsauslastung (bestätigte Gäste der letzten 30 Tage vs. verfügbare Kapazität * Spieltage)
  const vor30Tagen = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const letzteSpiele = await prisma.barSpiel.count({
    where: { barId: bar.id, spiel: { anpfiff: { gte: vor30Tagen, lt: new Date() } } },
  });
  const letzteResGaeste = alleRes
    .filter((r) => r.status === "BESTAETIGT" && new Date(r.datum) >= vor30Tagen)
    .reduce((sum, r) => sum + r.personen, 0);
  const theoretischeKapazitaet = letzteSpiele * bar.kapazitaet;
  const kapazitaetsRate = theoretischeKapazitaet > 0
    ? (letzteResGaeste / theoretischeKapazitaet) * 100
    : 0;

  // Reservierungen pro Spieltag (letzte 30 Tage)
  const resProSpieltag = letzteSpiele > 0
    ? alleRes.filter((r) => new Date(r.datum) >= vor30Tagen).length / letzteSpiele
    : 0;

  // Top-Teams: Welche Vereine ziehen die meisten Gäste?
  const vergangeneBarSpiele = await prisma.barSpiel.findMany({
    where: { barId: bar.id, spiel: { anpfiff: { lt: new Date() } } },
    include: { spiel: { select: { heimTeam: true, gastTeam: true, liga: true, anpfiff: true } } },
  });

  const teamGaeste: Record<string, { gaeste: number; spiele: number }> = {};
  for (const bs of vergangeneBarSpiele) {
    const spielDatum = bs.spiel.anpfiff.toDateString();
    // Gäste an diesem Spieltag (bestätigte Reservierungen)
    const gaeste = alleRes
      .filter((r) => (r.status === "BESTAETIGT" || r.status === "NO_SHOW") && new Date(r.datum).toDateString() === spielDatum)
      .reduce((sum, r) => sum + r.personen, 0);

    for (const team of [bs.spiel.heimTeam, bs.spiel.gastTeam]) {
      if (!teamGaeste[team]) teamGaeste[team] = { gaeste: 0, spiele: 0 };
      teamGaeste[team].gaeste += gaeste;
      teamGaeste[team].spiele += 1;
    }
  }

  const topTeams = Object.entries(teamGaeste)
    .map(([team, data]) => ({
      team,
      gaeste: data.gaeste,
      spiele: data.spiele,
      durchschnitt: data.spiele > 0 ? Math.round((data.gaeste / data.spiele) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.gaeste - a.gaeste)
    .slice(0, 5);

  // Promo-Umsatz
  const promoUmsatz = bar.promoDeals.reduce((sum, p) =>
    sum + p.buchungen.reduce((s, b) => s + b.gesamtPreis, 0), 0);
  const promoBuchungenTotal = bar.promoDeals.reduce((sum, p) =>
    sum + p.buchungen.length, 0);
  const umsatzProBuchung = promoBuchungenTotal > 0
    ? promoUmsatz / promoBuchungenTotal
    : 0;

  const kpis = {
    totalReservierungen: totalRes,
    bestaetigteReservierungen: bestaetigteRes.length,
    noShowRate: Math.round(noShowRate * 10) / 10,
    bestaetigungsRate: Math.round(bestaetigungsRate * 10) / 10,
    stornierungsRate: Math.round(stornierungsRate * 10) / 10,
    durchschnGruppe: Math.round(durchschnGruppe * 10) / 10,
    totalGaeste,
    kapazitaetsRate: Math.round(kapazitaetsRate * 10) / 10,
    resProSpieltag: Math.round(resProSpieltag * 10) / 10,
    promoUmsatz: Math.round(promoUmsatz * 100) / 100,
    umsatzProBuchung: Math.round(umsatzProBuchung * 100) / 100,
    kapazitaet: bar.kapazitaet,
    letzteSpieleTage: letzteSpiele,
    noShowCount: noShowRes.length,
    topTeams,
  };

  // Serialisieren (Date -> string) für Client-Komponente
  const barData = {
    id: bar.id,
    name: bar.name,
    slug: bar.slug,
    beschreibung: bar.beschreibung,
    adresse: bar.adresse,
    stadt: bar.stadt,
    plz: bar.plz,
    telefon: bar.telefon,
    website: bar.website,
    bildUrl: bar.bildUrl,
    hatReservierung: bar.hatReservierung,
    hatLeinwand: bar.hatLeinwand,
    hatBeamer: bar.hatBeamer,
    biergarten: bar.biergarten,
    oeffnungszeiten: bar.oeffnungszeiten,
    bewertungen: bar.bewertungen,
    premiumTier: bar.premiumTier,
    kapazitaet: bar.kapazitaet,
    fotos: bar.fotos.map((f) => ({
      id: f.id,
      url: f.url,
      alt: f.alt,
      sortOrder: f.sortOrder,
    })),
    spiele: bar.spiele.map((bs) => ({
      id: bs.id,
      spielId: bs.spielId,
      hatTon: bs.hatTon,
      plaetze: bs.plaetze,
      spiel: {
        id: bs.spiel.id,
        heimTeam: bs.spiel.heimTeam,
        gastTeam: bs.spiel.gastTeam,
        liga: bs.spiel.liga,
        anpfiff: bs.spiel.anpfiff.toISOString(),
        tvSender: bs.spiel.tvSender,
      },
    })),
    reservierungen: bar.reservierungen.slice(0, 30).map((r) => ({
      id: r.id,
      datum: r.datum.toISOString(),
      personen: r.personen,
      status: r.status,
      notiz: r.notiz,
      gastName: r.gastName,
      gastTelefon: r.gastTelefon,
      quelle: r.quelle,
      user: r.user ? { name: r.user.name, email: r.user.email } : null,
    })),
    promoDeals: bar.promoDeals.map((p) => ({
      id: p.id,
      titel: p.titel,
      beschreibung: p.beschreibung,
      preis: p.preis,
      originalPreis: p.originalPreis,
      maxPlaetze: p.maxPlaetze,
      gebuchtePlaetze: p.gebuchtePlaetze,
      spielTag: p.spielTag?.toISOString() || null,
      gueltigVon: p.gueltigVon.toISOString(),
      gueltigBis: p.gueltigBis.toISOString(),
      aktiv: p.aktiv,
    })),
  };

  return <BarDashboardClient bar={barData} kpis={kpis} />;
}
