import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ===== Demo-Account E-Mails =====
const DEMO_EMAILS = [
  "max@example.com",
  "lisa@example.com",
  "tom@sportsbar.de",
  "sarah@bierhaus.de",
  "jan@stadioneck.de",
  "nina@rheinblick.de",
  "paul@fanzone.de",
  "marie@domblick.de",
  "admin@spieltagbar.de",
];

// Demo-Bar Slugs
const DEMO_BAR_SLUGS = [
  "toms-sports-bar",
  "bierhaus-am-dom",
  "stadion-eck",
  "rheinblick-lounge",
  "fan-zone-essen",
  "domblick-sportskneipe",
];

async function main() {
  console.log("Seeding database...");
  console.log("  ⚡ Echte Accounts und deren Daten bleiben erhalten!\n");

  // ===== 1. NUR Demo-Daten löschen (echte Accounts bleiben!) =====
  console.log("Lösche alte Demo-Daten...");

  // Demo-User IDs holen
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: DEMO_EMAILS } },
    select: { id: true, email: true },
  });
  const demoUserIds = demoUsers.map((u) => u.id);

  // Demo-Bar IDs holen
  const demoBars = await prisma.bar.findMany({
    where: { slug: { in: DEMO_BAR_SLUGS } },
    select: { id: true, slug: true },
  });
  const demoBarIds = demoBars.map((b) => b.id);

  // Demo-PromoDeal IDs für PromoBuchungen
  const demoPromoDeals = await prisma.promoDeal.findMany({
    where: { barId: { in: demoBarIds } },
    select: { id: true },
  });
  const demoPromoDealIds = demoPromoDeals.map((p) => p.id);

  // Demo-Daten in richtiger Reihenfolge löschen (Foreign Keys beachten)
  if (demoPromoDealIds.length > 0) {
    await prisma.promoBuchung.deleteMany({
      where: { promoDealId: { in: demoPromoDealIds } },
    });
  }
  if (demoBarIds.length > 0) {
    await prisma.promoDeal.deleteMany({ where: { barId: { in: demoBarIds } } });
  }
  // Demo-Reservierungen: von Demo-Usern ODER in Demo-Bars
  if (demoUserIds.length > 0 || demoBarIds.length > 0) {
    await prisma.reservierung.deleteMany({
      where: {
        OR: [
          ...(demoUserIds.length > 0 ? [{ userId: { in: demoUserIds } }] : []),
          ...(demoBarIds.length > 0 ? [{ barId: { in: demoBarIds } }] : []),
        ],
      },
    });
  }
  if (demoBarIds.length > 0) {
    await prisma.barSpiel.deleteMany({ where: { barId: { in: demoBarIds } } });
  }
  if (demoUserIds.length > 0) {
    await prisma.bewertung.deleteMany({ where: { userId: { in: demoUserIds } } });
  }
  if (demoBarIds.length > 0) {
    await prisma.bar.deleteMany({ where: { id: { in: demoBarIds } } });
  }
  if (demoUserIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });
  }

  // Demo-Spiele löschen (externalId mit "demo_" Prefix)
  await prisma.spiel.deleteMany({
    where: { externalId: { startsWith: "demo_" } },
  });

  console.log("  ✓ Alte Demo-Daten gelöscht\n");

  // Echte Accounts zählen
  const echteUserCount = await prisma.user.count();
  const echteBarCount = await prisma.bar.count();
  if (echteUserCount > 0 || echteBarCount > 0) {
    console.log(`  ℹ ${echteUserCount} echte User und ${echteBarCount} echte Bars bleiben erhalten.\n`);
  }

  // ===== 2. Demo-User erstellen =====
  console.log("Erstelle Demo-Accounts...");
  const hashedPassword = await bcrypt.hash("test1234", 10);

  const fan1 = await prisma.user.create({
    data: {
      name: "Max Müller [DEMO]",
      email: "max@example.com",
      password: hashedPassword,
      role: "FAN",
      favoriteTeam: "Borussia Dortmund",
      city: "Düsseldorf",
    },
  });

  const fan2 = await prisma.user.create({
    data: {
      name: "Lisa Schmidt [DEMO]",
      email: "lisa@example.com",
      password: hashedPassword,
      role: "FAN",
      favoriteTeam: "1. FC Köln",
      city: "Köln",
    },
  });

  const barOwner1 = await prisma.user.create({
    data: {
      name: "Tom Weber [DEMO]",
      email: "tom@sportsbar.de",
      password: hashedPassword,
      role: "BAR_OWNER",
      city: "Düsseldorf",
    },
  });

  const barOwner2 = await prisma.user.create({
    data: {
      name: "Sarah Becker [DEMO]",
      email: "sarah@bierhaus.de",
      password: hashedPassword,
      role: "BAR_OWNER",
      city: "Köln",
    },
  });

  const barOwner3 = await prisma.user.create({
    data: {
      name: "Jan Hoffmann [DEMO]",
      email: "jan@stadioneck.de",
      password: hashedPassword,
      role: "BAR_OWNER",
      city: "Dortmund",
    },
  });

  const barOwner4 = await prisma.user.create({
    data: {
      name: "Nina Krause [DEMO]",
      email: "nina@rheinblick.de",
      password: hashedPassword,
      role: "BAR_OWNER",
      city: "Düsseldorf",
    },
  });

  const barOwner5 = await prisma.user.create({
    data: {
      name: "Paul Fischer [DEMO]",
      email: "paul@fanzone.de",
      password: hashedPassword,
      role: "BAR_OWNER",
      city: "Essen",
    },
  });

  const barOwner6 = await prisma.user.create({
    data: {
      name: "Marie Schulz [DEMO]",
      email: "marie@domblick.de",
      password: hashedPassword,
      role: "BAR_OWNER",
      city: "Köln",
    },
  });

  await prisma.user.create({
    data: {
      name: "Admin [DEMO]",
      email: "admin@spieltagbar.de",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("  ✓ 9 Demo-Accounts erstellt");

  // ===== 3. Demo-Bars erstellen =====
  console.log("Erstelle Demo-Bars...");

  const bar1 = await prisma.bar.create({
    data: {
      name: "Toms Sports Bar [DEMO]",
      slug: "toms-sports-bar",
      beschreibung:
        "Die beste Sports-Bar in der Düsseldorfer Altstadt. 6 Bildschirme, Craft-Bier und die beste Stadion-Atmosphäre der Stadt.",
      adresse: "Bolkerstraße 42",
      stadt: "Düsseldorf",
      plz: "40213",
      latitude: 51.2277,
      longitude: 6.7735,
      telefon: "0211-1234567",
      website: "https://toms-sportsbar.de",
      bildUrl: "/images/bars/toms-sports-bar.jpg",
      kapazitaet: 80,
      hatReservierung: true,
      hatLeinwand: true,
      hatBeamer: true,
      biergarten: false,
      oeffnungszeiten: JSON.stringify({
        mo: "16:00-01:00",
        di: "16:00-01:00",
        mi: "16:00-01:00",
        do: "16:00-01:00",
        fr: "14:00-03:00",
        sa: "12:00-03:00",
        so: "12:00-00:00",
      }),
      ownerId: barOwner1.id,
      bewertungen: 4.7,
      premiumTier: "PREMIUM",
    },
  });

  const bar2 = await prisma.bar.create({
    data: {
      name: "Bierhaus am Dom [DEMO]",
      slug: "bierhaus-am-dom",
      beschreibung:
        "Gemütliches Bierhaus mit Blick auf den Kölner Dom. Perfekt für FC-Spiele mit original Kölsch vom Fass.",
      adresse: "Am Hof 12",
      stadt: "Köln",
      plz: "50667",
      latitude: 50.9413,
      longitude: 6.958,
      telefon: "0221-9876543",
      website: "https://bierhaus-dom.de",
      bildUrl: "/images/bars/bierhaus-dom.jpg",
      kapazitaet: 120,
      hatReservierung: true,
      hatLeinwand: true,
      hatBeamer: false,
      biergarten: true,
      oeffnungszeiten: JSON.stringify({
        mo: "11:00-00:00",
        di: "11:00-00:00",
        mi: "11:00-00:00",
        do: "11:00-00:00",
        fr: "11:00-02:00",
        sa: "10:00-02:00",
        so: "10:00-00:00",
      }),
      ownerId: barOwner2.id,
      bewertungen: 4.5,
      premiumTier: "TOP",
    },
  });

  const bar3 = await prisma.bar.create({
    data: {
      name: "Stadion-Eck [DEMO]",
      slug: "stadion-eck",
      beschreibung:
        "Direkt am Signal Iduna Park. BVB-Atmosphäre pur! 4 Großbildschirme und Schwarz-Gelbe Deko an jeder Wand.",
      adresse: "Strobelallee 15",
      stadt: "Dortmund",
      plz: "44139",
      latitude: 51.4926,
      longitude: 7.4518,
      telefon: "0231-5551234",
      website: "https://stadion-eck.de",
      bildUrl: "/images/bars/stadion-eck.jpg",
      kapazitaet: 100,
      hatReservierung: true,
      hatLeinwand: true,
      hatBeamer: true,
      biergarten: true,
      oeffnungszeiten: JSON.stringify({
        mo: "geschlossen",
        di: "17:00-00:00",
        mi: "17:00-00:00",
        do: "17:00-00:00",
        fr: "15:00-02:00",
        sa: "12:00-02:00",
        so: "12:00-00:00",
      }),
      ownerId: barOwner3.id,
      bewertungen: 4.8,
      premiumTier: "PREMIUM",
    },
  });

  const bar4 = await prisma.bar.create({
    data: {
      name: "Rheinblick Lounge [DEMO]",
      slug: "rheinblick-lounge",
      beschreibung:
        "Stylische Lounge direkt am Rhein. Premium-Erlebnis mit Cocktails, ausgewähltem Bier und perfektem Sound.",
      adresse: "Rheinuferpromenade 8",
      stadt: "Düsseldorf",
      plz: "40213",
      latitude: 51.2266,
      longitude: 6.7726,
      telefon: "0211-7778899",
      bildUrl: "/images/bars/rheinblick.jpg",
      kapazitaet: 60,
      hatReservierung: true,
      hatLeinwand: true,
      hatBeamer: false,
      biergarten: true,
      oeffnungszeiten: JSON.stringify({
        mo: "geschlossen",
        di: "geschlossen",
        mi: "17:00-01:00",
        do: "17:00-01:00",
        fr: "16:00-03:00",
        sa: "14:00-03:00",
        so: "14:00-00:00",
      }),
      ownerId: barOwner4.id,
      bewertungen: 4.3,
      premiumTier: "BASIC",
    },
  });

  const bar5 = await prisma.bar.create({
    data: {
      name: "Fan Zone Essen [DEMO]",
      slug: "fan-zone-essen",
      beschreibung:
        "Das Fußball-Wohnzimmer im Ruhrgebiet. Hier trifft sich die ganze Nachbarschaft zum gemeinsamen Jubeln.",
      adresse: "Rüttenscheider Str. 88",
      stadt: "Essen",
      plz: "45130",
      latitude: 51.4344,
      longitude: 7.0066,
      telefon: "0201-3334455",
      bildUrl: "/images/bars/fan-zone.jpg",
      kapazitaet: 70,
      hatReservierung: true,
      hatLeinwand: true,
      hatBeamer: true,
      biergarten: false,
      oeffnungszeiten: JSON.stringify({
        mo: "17:00-00:00",
        di: "17:00-00:00",
        mi: "17:00-00:00",
        do: "17:00-00:00",
        fr: "15:00-02:00",
        sa: "12:00-02:00",
        so: "12:00-00:00",
      }),
      ownerId: barOwner5.id,
      bewertungen: 4.6,
      premiumTier: "BASIC",
    },
  });

  const bar6 = await prisma.bar.create({
    data: {
      name: "Domblick Sportskneipe [DEMO]",
      slug: "domblick-sportskneipe",
      beschreibung:
        "Traditionelle Sportskneipe mit modernem Twist. Frisches Kölsch, leckere Flammkuchen und alle Spiele live.",
      adresse: "Eigelstein 33",
      stadt: "Köln",
      plz: "50668",
      latitude: 50.9454,
      longitude: 6.9575,
      telefon: "0221-6667788",
      bildUrl: "/images/bars/domblick.jpg",
      kapazitaet: 90,
      hatReservierung: true,
      hatLeinwand: true,
      hatBeamer: true,
      biergarten: false,
      oeffnungszeiten: JSON.stringify({
        mo: "16:00-00:00",
        di: "16:00-00:00",
        mi: "16:00-00:00",
        do: "16:00-00:00",
        fr: "14:00-02:00",
        sa: "12:00-02:00",
        so: "11:00-00:00",
      }),
      ownerId: barOwner6.id,
      bewertungen: 4.4,
      premiumTier: "PREMIUM",
    },
  });

  console.log("  ✓ 6 Demo-Bars erstellt");

  // ===== 4. Spielpläne aus OpenLigaDB importieren (für ALLE - nicht nur Demo) =====
  console.log("\nImportiere Spielpläne aus OpenLigaDB...");

  const OPENLIGA_LIGEN = [
    { shortcut: "bl1", name: "Bundesliga", saison: "2025" },
    { shortcut: "bl2", name: "2. Bundesliga", saison: "2025" },
    { shortcut: "bl3", name: "3. Liga", saison: "2025" },
    { shortcut: "dfb2025", name: "DFB-Pokal", saison: "2025" },
  ];

  let importedGesamt = 0;

  for (const liga of OPENLIGA_LIGEN) {
    try {
      const url = `https://api.openligadb.de/getmatchdata/${liga.shortcut}/${liga.saison}`;
      console.log(`  Lade ${liga.name} (${liga.saison})...`);
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`  ⚠ Fehler bei ${liga.name}: HTTP ${response.status}`);
        continue;
      }
      const matches = await response.json();
      let count = 0;
      for (const match of matches) {
        const externalId = `openliga_${match.matchID}`;
        const status = match.matchIsFinished ? "BEENDET" : "GEPLANT";
        const endResult = match.matchResults?.find((r: { resultTypeID: number }) => r.resultTypeID === 2);
        const ergebnis = endResult ? `${endResult.pointsTeam1}:${endResult.pointsTeam2}` : null;
        try {
          await prisma.spiel.upsert({
            where: { externalId },
            update: {
              anpfiff: new Date(match.matchDateTime),
              status,
              ergebnis,
              heimTeam: match.team1.teamName,
              gastTeam: match.team2.teamName,
              spieltag: match.group?.groupOrderID || null,
            },
            create: {
              externalId,
              heimTeam: match.team1.teamName,
              gastTeam: match.team2.teamName,
              liga: liga.name,
              saison: liga.saison,
              spieltag: match.group?.groupOrderID || null,
              anpfiff: new Date(match.matchDateTime),
              status,
              ergebnis,
            },
          });
          count++;
        } catch {
          // Einzelne Fehler ignorieren
        }
      }
      console.log(`  ✓ ${liga.name}: ${count} Spiele importiert`);
      importedGesamt += count;
    } catch (e) {
      console.log(`  ⚠ Netzwerkfehler bei ${liga.name}: ${e instanceof Error ? e.message : "Unbekannt"}`);
    }
  }

  // ===== 5. Internationale Demo-Spiele hinzufügen =====
  console.log("Erstelle internationale Demo-Spielpläne...");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let intlCount = 0;

  const makeDate = (dayOffset: number, hour: number, minute = 0) =>
    new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000 + minute * 60 * 1000);

  const internationalGames = [
    // Champions League
    { heimTeam: "Real Madrid", gastTeam: "FC Bayern München", liga: "Champions League", anpfiff: makeDate(3, 21), tvSender: "DAZN", spieltag: 8 },
    { heimTeam: "Manchester City", gastTeam: "Paris Saint-Germain", liga: "Champions League", anpfiff: makeDate(3, 21), tvSender: "Amazon Prime", spieltag: 8 },
    { heimTeam: "FC Barcelona", gastTeam: "Borussia Dortmund", liga: "Champions League", anpfiff: makeDate(4, 21), tvSender: "DAZN", spieltag: 8 },
    { heimTeam: "Inter Mailand", gastTeam: "Atlético Madrid", liga: "Champions League", anpfiff: makeDate(4, 21), tvSender: "DAZN", spieltag: 8 },
    { heimTeam: "Liverpool FC", gastTeam: "Bayer Leverkusen", liga: "Champions League", anpfiff: makeDate(10, 21), tvSender: "DAZN", spieltag: 9 },
    { heimTeam: "Arsenal FC", gastTeam: "RB Leipzig", liga: "Champions League", anpfiff: makeDate(10, 21), tvSender: "Amazon Prime", spieltag: 9 },
    // Europa League
    { heimTeam: "AS Roma", gastTeam: "Eintracht Frankfurt", liga: "Europa League", anpfiff: makeDate(5, 18, 45), tvSender: "RTL+", spieltag: 7 },
    { heimTeam: "Real Sociedad", gastTeam: "SC Freiburg", liga: "Europa League", anpfiff: makeDate(5, 21), tvSender: "RTL+", spieltag: 7 },
    { heimTeam: "Lazio Rom", gastTeam: "1899 Hoffenheim", liga: "Europa League", anpfiff: makeDate(12, 21), tvSender: "RTL+", spieltag: 8 },
    // Conference League
    { heimTeam: "1. FC Heidenheim", gastTeam: "Chelsea FC", liga: "Conference League", anpfiff: makeDate(5, 18, 45), tvSender: "RTL+", spieltag: 6 },
    // Premier League
    { heimTeam: "Liverpool FC", gastTeam: "Arsenal FC", liga: "Premier League", anpfiff: makeDate(2, 17, 30), tvSender: "Sky", spieltag: 26 },
    { heimTeam: "Manchester City", gastTeam: "Chelsea FC", liga: "Premier League", anpfiff: makeDate(2, 15), tvSender: "Sky", spieltag: 26 },
    { heimTeam: "Manchester United", gastTeam: "Tottenham Hotspur", liga: "Premier League", anpfiff: makeDate(9, 15), tvSender: "Sky", spieltag: 27 },
    { heimTeam: "Newcastle United", gastTeam: "Aston Villa", liga: "Premier League", anpfiff: makeDate(9, 17, 30), tvSender: "Sky", spieltag: 27 },
    // La Liga
    { heimTeam: "Real Madrid", gastTeam: "FC Barcelona", liga: "La Liga", anpfiff: makeDate(6, 21), tvSender: "DAZN", spieltag: 25 },
    { heimTeam: "Atlético Madrid", gastTeam: "Real Sociedad", liga: "La Liga", anpfiff: makeDate(6, 18, 30), tvSender: "DAZN", spieltag: 25 },
    { heimTeam: "FC Sevilla", gastTeam: "Real Betis", liga: "La Liga", anpfiff: makeDate(13, 21), tvSender: "DAZN", spieltag: 26 },
    // Serie A
    { heimTeam: "AC Mailand", gastTeam: "Juventus Turin", liga: "Serie A", anpfiff: makeDate(2, 20, 45), tvSender: "DAZN", spieltag: 26 },
    { heimTeam: "Inter Mailand", gastTeam: "SSC Neapel", liga: "Serie A", anpfiff: makeDate(9, 20, 45), tvSender: "DAZN", spieltag: 27 },
    { heimTeam: "AS Roma", gastTeam: "Lazio Rom", liga: "Serie A", anpfiff: makeDate(9, 18), tvSender: "DAZN", spieltag: 27 },
    // Ligue 1
    { heimTeam: "Paris Saint-Germain", gastTeam: "Olympique Marseille", liga: "Ligue 1", anpfiff: makeDate(7, 21), tvSender: "DAZN", spieltag: 25 },
    { heimTeam: "AS Monaco", gastTeam: "Olympique Lyon", liga: "Ligue 1", anpfiff: makeDate(7, 19), tvSender: "DAZN", spieltag: 25 },
    // Eredivisie
    { heimTeam: "Ajax Amsterdam", gastTeam: "PSV Eindhoven", liga: "Eredivisie", anpfiff: makeDate(1, 18, 45), tvSender: "Sportdigital", spieltag: 24 },
    { heimTeam: "Feyenoord Rotterdam", gastTeam: "AZ Alkmaar", liga: "Eredivisie", anpfiff: makeDate(8, 20), tvSender: "Sportdigital", spieltag: 25 },
    // Österr. Bundesliga
    { heimTeam: "RB Salzburg", gastTeam: "Rapid Wien", liga: "Österr. Bundesliga", anpfiff: makeDate(1, 17), tvSender: "Sky AT", spieltag: 22 },
    { heimTeam: "Sturm Graz", gastTeam: "Austria Wien", liga: "Österr. Bundesliga", anpfiff: makeDate(8, 17), tvSender: "Sky AT", spieltag: 23 },
    // Schweizer Super League
    { heimTeam: "BSC Young Boys", gastTeam: "FC Basel", liga: "Schweizer Super League", anpfiff: makeDate(1, 16, 30), tvSender: "blue Sport", spieltag: 23 },
    { heimTeam: "FC Zürich", gastTeam: "FC Luzern", liga: "Schweizer Super League", anpfiff: makeDate(8, 16, 30), tvSender: "blue Sport", spieltag: 24 },
    // Nations League
    { heimTeam: "Deutschland", gastTeam: "Frankreich", liga: "Nations League", anpfiff: makeDate(14, 20, 45), tvSender: "RTL", spieltag: 1 },
    { heimTeam: "Spanien", gastTeam: "Italien", liga: "Nations League", anpfiff: makeDate(14, 20, 45), tvSender: "DAZN", spieltag: 1 },
    // Vergangene Spiele für Statistiken
    { heimTeam: "FC Bayern München", gastTeam: "Real Madrid", liga: "Champions League", anpfiff: makeDate(-7, 21), tvSender: "DAZN", spieltag: 7, ergebnis: "2:1", status: "BEENDET" },
    { heimTeam: "Borussia Dortmund", gastTeam: "PSV Eindhoven", liga: "Champions League", anpfiff: makeDate(-7, 21), tvSender: "Amazon Prime", spieltag: 7, ergebnis: "3:0", status: "BEENDET" },
    { heimTeam: "Arsenal FC", gastTeam: "Liverpool FC", liga: "Premier League", anpfiff: makeDate(-3, 17, 30), tvSender: "Sky", spieltag: 25, ergebnis: "1:1", status: "BEENDET" },
    { heimTeam: "FC Barcelona", gastTeam: "Atlético Madrid", liga: "La Liga", anpfiff: makeDate(-5, 21), tvSender: "DAZN", spieltag: 24, ergebnis: "2:0", status: "BEENDET" },
    { heimTeam: "Juventus Turin", gastTeam: "Inter Mailand", liga: "Serie A", anpfiff: makeDate(-4, 20, 45), tvSender: "DAZN", spieltag: 25, ergebnis: "0:1", status: "BEENDET" },
    { heimTeam: "Ajax Amsterdam", gastTeam: "Feyenoord Rotterdam", liga: "Eredivisie", anpfiff: makeDate(-6, 14, 30), tvSender: "Sportdigital", spieltag: 23, ergebnis: "2:2", status: "BEENDET" },
  ];

  for (const game of internationalGames) {
    const externalId = `demo_intl_${game.liga.replace(/\s/g, "_")}_${game.heimTeam.replace(/\s/g, "_")}_v_${game.gastTeam.replace(/\s/g, "_")}`;
    try {
      await prisma.spiel.upsert({
        where: { externalId },
        update: {
          anpfiff: game.anpfiff,
          status: game.status || "GEPLANT",
          ergebnis: game.ergebnis || null,
        },
        create: {
          externalId,
          heimTeam: game.heimTeam,
          gastTeam: game.gastTeam,
          liga: game.liga,
          spieltag: game.spieltag,
          anpfiff: game.anpfiff,
          tvSender: game.tvSender,
          status: game.status || "GEPLANT",
          ergebnis: game.ergebnis || null,
        },
      });
      intlCount++;
    } catch {
      // Einzelne Fehler ignorieren
    }
  }
  console.log(`  ✓ ${intlCount} internationale Demo-Spiele erstellt`);

  // Fallback-Spiele falls OpenLigaDB nicht erreichbar und keine Spiele in DB
  const spieleCount = await prisma.spiel.count();
  if (spieleCount === 0) {
    console.log("  OpenLigaDB nicht erreichbar - erstelle Fallback-Spiele...");

    await prisma.spiel.createMany({
      data: [
        { heimTeam: "Borussia Dortmund", gastTeam: "FC Bayern München", liga: "Bundesliga", anpfiff: makeDate(0, 18, 30), tvSender: "Sky", status: "GEPLANT" },
        { heimTeam: "1. FC Köln", gastTeam: "Fortuna Düsseldorf", liga: "2. Bundesliga", anpfiff: makeDate(0, 20, 30), tvSender: "Sky", status: "GEPLANT" },
        { heimTeam: "Bayer Leverkusen", gastTeam: "RB Leipzig", liga: "Bundesliga", anpfiff: makeDate(1, 15, 30), tvSender: "DAZN", status: "GEPLANT" },
        { heimTeam: "Schalke 04", gastTeam: "Hamburger SV", liga: "2. Bundesliga", anpfiff: makeDate(1, 13), tvSender: "Sky", status: "GEPLANT" },
        { heimTeam: "Real Madrid", gastTeam: "Borussia Dortmund", liga: "Champions League", anpfiff: makeDate(2, 21), tvSender: "DAZN", status: "GEPLANT" },
        { heimTeam: "FC Bayern München", gastTeam: "Manchester City", liga: "Champions League", anpfiff: makeDate(2, 21), tvSender: "Amazon Prime", status: "GEPLANT" },
      ],
    });
    importedGesamt = 6;
  }

  // ===== 6. Demo-Bars mit Spielen verknüpfen (nur Demo-Bars!) =====
  console.log("\nVerknüpfe Demo-Bars mit Spielen...");

  const naechsteSpiele = await prisma.spiel.findMany({
    where: { anpfiff: { gte: new Date() } },
    orderBy: { anpfiff: "asc" },
    take: 10,
  });

  const spiel1 = naechsteSpiele[0];
  const spiel2 = naechsteSpiele[1];
  const spiel3 = naechsteSpiele[2];
  const spiel4 = naechsteSpiele[3];
  const spiel5 = naechsteSpiele[4];
  const spiel6 = naechsteSpiele[5];

  const barSpielLinks = [
    spiel1 && { barId: bar1.id, spielId: spiel1.id, hatTon: true, plaetze: 30 },
    spiel2 && { barId: bar1.id, spielId: spiel2.id, hatTon: true, plaetze: 20 },
    spiel5 && { barId: bar1.id, spielId: spiel5.id, hatTon: true, plaetze: 25 },
    spiel2 && { barId: bar2.id, spielId: spiel2.id, hatTon: true, plaetze: 50 },
    spiel3 && { barId: bar2.id, spielId: spiel3.id, hatTon: true, plaetze: 40 },
    spiel6 && { barId: bar2.id, spielId: spiel6.id, hatTon: true, plaetze: 45 },
    spiel1 && { barId: bar3.id, spielId: spiel1.id, hatTon: true, plaetze: 40 },
    spiel5 && { barId: bar3.id, spielId: spiel5.id, hatTon: true, plaetze: 35 },
    spiel1 && { barId: bar4.id, spielId: spiel1.id, hatTon: true, plaetze: 20 },
    spiel2 && { barId: bar4.id, spielId: spiel2.id, hatTon: false, plaetze: 15 },
    spiel1 && { barId: bar5.id, spielId: spiel1.id, hatTon: true, plaetze: 25 },
    spiel4 && { barId: bar5.id, spielId: spiel4.id, hatTon: true, plaetze: 30 },
    spiel6 && { barId: bar5.id, spielId: spiel6.id, hatTon: true, plaetze: 20 },
    spiel2 && { barId: bar6.id, spielId: spiel2.id, hatTon: true, plaetze: 35 },
    spiel3 && { barId: bar6.id, spielId: spiel3.id, hatTon: true, plaetze: 30 },
    spiel5 && { barId: bar6.id, spielId: spiel5.id, hatTon: true, plaetze: 25 },
  ].filter(Boolean) as { barId: string; spielId: string; hatTon: boolean; plaetze: number }[];

  for (const link of barSpielLinks) {
    await prisma.barSpiel.create({ data: link });
  }
  console.log(`  ✓ ${barSpielLinks.length} Demo Bar-Spiel Verknüpfungen`);

  // ===== 7. Demo-Reservierungen (nur für Demo-User in Demo-Bars) =====
  console.log("Erstelle Demo-Reservierungen...");

  if (spiel1) {
    await prisma.reservierung.create({
      data: {
        userId: fan1.id,
        barId: bar1.id,
        datum: spiel1.anpfiff,
        personen: 4,
        status: "BESTAETIGT",
        notiz: "Platz nah am Bildschirm bitte!",
      },
    });
  }

  if (spiel2) {
    await prisma.reservierung.create({
      data: {
        userId: fan2.id,
        barId: bar2.id,
        datum: spiel2.anpfiff,
        personen: 6,
        status: "AUSSTEHEND",
        notiz: "Wir kommen direkt nach der Arbeit.",
      },
    });
  }

  // ===== 8. Demo-PromoDeals (nur für Demo-Bars) =====
  console.log("Erstelle Demo-PromoDeals...");

  if (spiel1) {
    await prisma.promoDeal.create({
      data: {
        barId: bar1.id,
        titel: "Topspiel - VIP Paket [DEMO]",
        beschreibung: "Reservierter Platz direkt vor der Leinwand, 1 Pitcher Bier und Nachos inklusive. Das ultimative Spieltag-Erlebnis!",
        preis: 19.90,
        originalPreis: 29.90,
        maxPlaetze: 20,
        gebuchtePlaetze: 5,
        spielTag: spiel1.anpfiff,
        gueltigVon: new Date(),
        gueltigBis: spiel1.anpfiff,
        aktiv: true,
      },
    });
  }

  if (spiel2) {
    await prisma.promoDeal.create({
      data: {
        barId: bar2.id,
        titel: "Spieltag Derby Paket [DEMO]",
        beschreibung: "2 Kölsch, Flammkuchen und ein Platz am Stammtisch. Feier das Derby mit echten Fans!",
        preis: 14.90,
        maxPlaetze: 30,
        gebuchtePlaetze: 12,
        spielTag: spiel2.anpfiff,
        gueltigVon: new Date(),
        gueltigBis: spiel2.anpfiff,
        aktiv: true,
      },
    });
  }

  if (spiel5) {
    await prisma.promoDeal.create({
      data: {
        barId: bar3.id,
        titel: "Champions League Nacht [DEMO]",
        beschreibung: "Großbild-Erlebnis mit Surround Sound, Willkommens-Shot und Happy Hour bis zum Anpfiff.",
        preis: 24.90,
        originalPreis: 34.90,
        maxPlaetze: 40,
        gebuchtePlaetze: 8,
        spielTag: spiel5.anpfiff,
        gueltigVon: new Date(),
        gueltigBis: spiel5.anpfiff,
        aktiv: true,
      },
    });
  }

  // ===== Zusammenfassung =====
  const finalSpieleCount = await prisma.spiel.count();
  const naechsteSpieleCount = await prisma.spiel.count({
    where: { anpfiff: { gte: new Date() } },
  });
  const totalUsers = await prisma.user.count();
  const totalBars = await prisma.bar.count();
  const demoUserCountFinal = await prisma.user.count({
    where: { email: { in: DEMO_EMAILS } },
  });
  const echteUserCountFinal = totalUsers - demoUserCountFinal;

  console.log("\n✅ Seed erfolgreich abgeschlossen!");
  console.log(`  - ${totalUsers} User (${demoUserCountFinal} Demo, ${echteUserCountFinal} echt)`);
  console.log(`  - ${totalBars} Bars (6 Demo, ${totalBars - 6} echt)`);
  console.log(`  - ${finalSpieleCount} Spiele (${naechsteSpieleCount} kommende)`);
  console.log(`  - ${barSpielLinks.length} Demo Bar-Spiel Verknüpfungen`);
  console.log(`  - Demo-Reservierungen & Demo-PromoDeals erstellt`);
  console.log("");
  console.log("Demo-Accounts sind mit [DEMO] markiert.");
  console.log("Echte Accounts und deren Daten wurden NICHT verändert.");
  console.log("");
  console.log("Test-Login:");
  console.log("  Fan:       max@example.com / test1234");
  console.log("  Bar-Owner: tom@sportsbar.de / test1234");
  console.log("  Admin:     admin@spieltagbar.de / test1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
