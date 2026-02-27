import { NextResponse } from "next/server";
import { syncAlleSpielplaene } from "@/lib/spielplan-sync";

/**
 * Cron-Job: Spielplan automatisch syncen
 *
 * Kann von externem Cron-Service aufgerufen werden (z.B. cron-job.org, Plesk Cron):
 * curl -X POST https://spieltagbar.de/api/cron/spielplan \
 *   -H "x-cron-secret: DEIN_CRON_SECRET"
 *
 * Oder in vercel.json als Cron konfiguriert werden.
 *
 * Empfohlen: Alle 6 Stunden ausführen
 */
export async function GET(req: Request) {
  // Cron-Secret prüfen
  const cronSecret = req.headers.get("x-cron-secret") ||
                     new URL(req.url).searchParams.get("secret");

  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const results = await syncAlleSpielplaene();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    const totalCreated = results.reduce((s, r) => s + r.created, 0);
    const totalUpdated = results.reduce((s, r) => s + r.updated, 0);
    const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);

    console.log(
      `⚽ Spielplan-Sync: ${totalCreated} neu, ${totalUpdated} aktualisiert, ${totalErrors} Fehler (${duration}s)`
    );

    return NextResponse.json({
      success: true,
      duration: `${duration}s`,
      summary: { created: totalCreated, updated: totalUpdated, errors: totalErrors },
      details: results,
    });
  } catch (error) {
    console.error("Cron Spielplan-Sync Fehler:", error);
    return NextResponse.json({ error: "Sync fehlgeschlagen." }, { status: 500 });
  }
}

// POST wird auch unterstützt
export async function POST(req: Request) {
  return GET(req);
}
