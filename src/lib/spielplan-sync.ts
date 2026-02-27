/**
 * Spielplan-Sync Service
 * Importiert Fußball-Spielpläne aus OpenLigaDB (kostenlos, kein API-Key nötig)
 * und speichert sie in der lokalen Datenbank.
 *
 * Unterstützte Ligen:
 * - Bundesliga (bl1), 2. Bundesliga (bl2), 3. Liga (bl3)
 * - DFB-Pokal (dfb)
 * - Champions League (ucl), Europa League (uel), Conference League (uecl)
 * - Nations League (unl)
 * - Premier League (PL), La Liga (PD), Serie A (SA), Ligue 1 (FL1)
 * - Eredivisie (DED), Österr. Bundesliga (ASL), Schweizer Super League (SSL)
 */

import { prisma } from "@/lib/db";

// ===== OpenLigaDB Konfiguration =====
const OPENLIGA_BASE = "https://api.openligadb.de";

// Mapping: interner Liga-Key -> OpenLigaDB Shortcut + Anzeigename
const OPENLIGA_LIGEN: Record<string, { shortcut: string; name: string; saison: string }> = {
  bl1: { shortcut: "bl1", name: "Bundesliga", saison: "2025" },
  bl2: { shortcut: "bl2", name: "2. Bundesliga", saison: "2025" },
  bl3: { shortcut: "bl3", name: "3. Liga", saison: "2025" },
  dfb: { shortcut: "dfb2025", name: "DFB-Pokal", saison: "2025" },
};

// ===== football-data.org Konfiguration (Freier Tier: 10 requests/min) =====
// Für internationale Ligen - braucht API Key (kostenlos registrieren)
const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";

// Competition Codes für football-data.org
const FOOTBALL_DATA_LIGEN: Record<string, { code: string; name: string }> = {
  bl1_fd: { code: "BL1", name: "Bundesliga" },
  ucl: { code: "CL", name: "Champions League" },
  uel: { code: "ELC", name: "Europa League" },
  uecl: { code: "ECL", name: "Conference League" },
  pl: { code: "PL", name: "Premier League" },
  laliga: { code: "PD", name: "La Liga" },
  seriea: { code: "SA", name: "Serie A" },
  ligue1: { code: "FL1", name: "Ligue 1" },
  eredivisie: { code: "DED", name: "Eredivisie" },
  oebl: { code: "ASL", name: "Österr. Bundesliga" },
  ssl: { code: "SSL", name: "Schweizer Super League" },
};

// ===== OpenLigaDB Types =====
interface OpenLigaMatch {
  matchID: number;
  matchDateTime: string;
  team1: { teamName: string; shortName: string; teamIconUrl: string };
  team2: { teamName: string; shortName: string; teamIconUrl: string };
  matchIsFinished: boolean;
  matchResults: Array<{ pointsTeam1: number; pointsTeam2: number; resultTypeID: number }>;
  group?: { groupName: string; groupOrderID: number };
}

// ===== football-data.org Types =====
interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  homeTeam: { name: string; shortName: string; crest: string };
  awayTeam: { name: string; shortName: string; crest: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

// ===== Sync-Ergebnisse =====
interface SyncResult {
  liga: string;
  created: number;
  updated: number;
  errors: string[];
}

/**
 * Synchronisiere alle OpenLigaDB-Ligen
 */
export async function syncOpenLigaDB(
  ligenKeys?: string[]
): Promise<SyncResult[]> {
  const keys = ligenKeys || Object.keys(OPENLIGA_LIGEN);
  const results: SyncResult[] = [];

  for (const key of keys) {
    const liga = OPENLIGA_LIGEN[key];
    if (!liga) continue;

    const result: SyncResult = { liga: liga.name, created: 0, updated: 0, errors: [] };

    try {
      // Alle Spieltage der aktuellen Saison holen
      const url = `${OPENLIGA_BASE}/getmatchdata/${liga.shortcut}/${liga.saison}`;
      const response = await fetch(url, { next: { revalidate: 0 } });

      if (!response.ok) {
        result.errors.push(`HTTP ${response.status} für ${liga.name}`);
        results.push(result);
        continue;
      }

      const matches: OpenLigaMatch[] = await response.json();

      for (const match of matches) {
        const externalId = `openliga_${match.matchID}`;
        const status = match.matchIsFinished ? "BEENDET" : "GEPLANT";
        // Endergebnis: resultTypeID 2 = Endergebnis, 1 = Halbzeit — Fallback auf letztes verfügbares
        const endResult = match.matchResults?.find((r) => r.resultTypeID === 2)
          || match.matchResults?.sort((a, b) => b.resultTypeID - a.resultTypeID)[0];
        const ergebnis = endResult
          ? `${endResult.pointsTeam1}:${endResult.pointsTeam2}`
          : null;

        try {
          const existing = await prisma.spiel.findUnique({
            where: { externalId },
          });

          if (existing) {
            // Update nur wenn sich etwas geändert hat
            await prisma.spiel.update({
              where: { externalId },
              data: {
                anpfiff: new Date(match.matchDateTime),
                status,
                ergebnis,
                heimTeam: match.team1.teamName,
                gastTeam: match.team2.teamName,
                spieltag: match.group?.groupOrderID || null,
              },
            });
            result.updated++;
          } else {
            await prisma.spiel.create({
              data: {
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
            result.created++;
          }
        } catch (e) {
          result.errors.push(
            `Fehler bei Match ${match.matchID}: ${e instanceof Error ? e.message : "Unbekannt"}`
          );
        }
      }
    } catch (e) {
      result.errors.push(
        `Netzwerkfehler: ${e instanceof Error ? e.message : "Unbekannt"}`
      );
    }

    results.push(result);
  }

  return results;
}

/**
 * Synchronisiere Ligen via football-data.org
 * Braucht API-Key in FOOTBALL_DATA_API_KEY env variable
 */
export async function syncFootballData(
  ligenKeys?: string[]
): Promise<SyncResult[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return [{ liga: "football-data.org", created: 0, updated: 0, errors: ["FOOTBALL_DATA_API_KEY nicht gesetzt. Registriere dich kostenlos auf football-data.org"] }];
  }

  const keys = ligenKeys || Object.keys(FOOTBALL_DATA_LIGEN);
  const results: SyncResult[] = [];

  for (const key of keys) {
    const liga = FOOTBALL_DATA_LIGEN[key];
    if (!liga) continue;

    const result: SyncResult = { liga: liga.name, created: 0, updated: 0, errors: [] };

    try {
      // Nächste 30 Tage an Spielen holen
      const dateFrom = new Date().toISOString().split("T")[0];
      const dateTo = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const url = `${FOOTBALL_DATA_BASE}/competitions/${liga.code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      const response = await fetch(url, {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        if (response.status === 429) {
          result.errors.push(`Rate Limit erreicht für ${liga.name}. Warte 1 Minute.`);
        } else {
          result.errors.push(`HTTP ${response.status} für ${liga.name}`);
        }
        results.push(result);
        continue;
      }

      const data = await response.json();
      const matches: FootballDataMatch[] = data.matches || [];

      for (const match of matches) {
        const externalId = `fd_${match.id}`;
        const status = match.status === "FINISHED"
          ? "BEENDET"
          : match.status === "IN_PLAY" || match.status === "PAUSED"
          ? "LIVE"
          : "GEPLANT";

        const ergebnis =
          match.score.fullTime.home !== null
            ? `${match.score.fullTime.home}:${match.score.fullTime.away}`
            : null;

        // Teams ermitteln (KO-Runden können null sein)
        const heimTeam = match.homeTeam.shortName || match.homeTeam.name || "TBD";
        const gastTeam = match.awayTeam.shortName || match.awayTeam.name || "TBD";

        // Spiele ohne Teams überspringen (noch nicht ausgelost)
        if (heimTeam === "TBD" && gastTeam === "TBD") continue;

        try {
          const existing = await prisma.spiel.findUnique({
            where: { externalId },
          });

          if (existing) {
            await prisma.spiel.update({
              where: { externalId },
              data: {
                anpfiff: new Date(match.utcDate),
                status,
                ergebnis,
                heimTeam,
                gastTeam,
              },
            });
            result.updated++;
          } else {
            await prisma.spiel.create({
              data: {
                externalId,
                heimTeam,
                gastTeam,
                liga: liga.name,
                spieltag: match.matchday,
                anpfiff: new Date(match.utcDate),
                status,
                ergebnis,
              },
            });
            result.created++;
          }
        } catch (e) {
          result.errors.push(
            `Fehler bei Match ${match.id}: ${e instanceof Error ? e.message : "Unbekannt"}`
          );
        }
      }

      // Rate Limiting: 1 Sekunde zwischen Requests
      await new Promise((r) => setTimeout(r, 1000));
    } catch (e) {
      result.errors.push(
        `Netzwerkfehler: ${e instanceof Error ? e.message : "Unbekannt"}`
      );
    }

    results.push(result);
  }

  return results;
}

/**
 * Synchronisiere ALLE Ligen (OpenLigaDB + football-data.org)
 */
export async function syncAlleSpielplaene(): Promise<SyncResult[]> {
  const openLigaResults = await syncOpenLigaDB();
  const footballDataResults = await syncFootballData();
  return [...openLigaResults, ...footballDataResults];
}

/**
 * Hilfsfunktion: Alle verfügbaren Ligen zurückgeben
 */
export function getVerfuegbareLigen(): { key: string; name: string; source: string }[] {
  const ligen = [];
  for (const [key, val] of Object.entries(OPENLIGA_LIGEN)) {
    ligen.push({ key, name: val.name, source: "OpenLigaDB" });
  }
  for (const [key, val] of Object.entries(FOOTBALL_DATA_LIGEN)) {
    ligen.push({ key, name: val.name, source: "football-data.org" });
  }
  return ligen;
}
