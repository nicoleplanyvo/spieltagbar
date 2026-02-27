import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const OPENLIGA_BASE = "https://api.openligadb.de";

// Ligen-Kürzel für OpenLigaDB
const LIVE_LIGEN = ["bl1", "bl2", "bl3"];

interface OpenLigaMatch {
  matchID: number;
  matchIsFinished: boolean;
  matchResults: Array<{
    pointsTeam1: number;
    pointsTeam2: number;
    resultTypeID: number;
    resultOrderID: number;
  }>;
}

/**
 * GET: Aktuelle Live-Ergebnisse abrufen und DB aktualisieren
 * Prüft bei OpenLigaDB ob laufende Spiele aktualisierte Ergebnisse haben
 */
export async function GET() {
  try {
    let updatedCount = 0;
    const errors: string[] = [];

    for (const liga of LIVE_LIGEN) {
      try {
        // Aktuelle Spieltag-Daten holen
        const url = `${OPENLIGA_BASE}/getmatchdata/${liga}`;
        const response = await fetch(url, {
          next: { revalidate: 0 },
          cache: "no-store",
        });

        if (!response.ok) continue;

        const matches: OpenLigaMatch[] = await response.json();

        for (const match of matches) {
          const externalId = `openliga_${match.matchID}`;

          // Aktuelles Ergebnis (letztes Result = aktueller Stand)
          const results = match.matchResults || [];
          const latestResult = results.sort(
            (a, b) => b.resultOrderID - a.resultOrderID
          )[0];

          const ergebnis = latestResult
            ? `${latestResult.pointsTeam1}:${latestResult.pointsTeam2}`
            : null;

          // Status bestimmen
          let status: string;
          if (match.matchIsFinished) {
            status = "BEENDET";
          } else if (results.length > 0) {
            // Hat Ergebnisse aber ist nicht beendet = LIVE
            status = "LIVE";
          } else {
            status = "GEPLANT";
          }

          try {
            const existing = await prisma.spiel.findUnique({
              where: { externalId },
            });

            if (existing && (existing.status !== status || existing.ergebnis !== ergebnis)) {
              await prisma.spiel.update({
                where: { externalId },
                data: { status, ergebnis },
              });
              updatedCount++;
            }
          } catch {
            // Einzelne Fehler ignorieren
          }
        }
      } catch (e) {
        errors.push(
          `${liga}: ${e instanceof Error ? e.message : "Unbekannt"}`
        );
      }
    }

    // Aktuelle Live-Spiele zurückgeben
    const liveSpiele = await prisma.spiel.findMany({
      where: { status: "LIVE" },
      orderBy: { anpfiff: "asc" },
    });

    return NextResponse.json({
      updated: updatedCount,
      liveSpiele: liveSpiele.map((s) => ({
        id: s.id,
        heimTeam: s.heimTeam,
        gastTeam: s.gastTeam,
        liga: s.liga,
        ergebnis: s.ergebnis,
        anpfiff: s.anpfiff.toISOString(),
      })),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
