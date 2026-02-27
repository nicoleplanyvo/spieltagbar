import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  syncOpenLigaDB,
  syncFootballData,
  syncAlleSpielplaene,
  getVerfuegbareLigen,
} from "@/lib/spielplan-sync";

/**
 * GET: Verfügbare Ligen abrufen + Sync-Status
 */
export async function GET() {
  try {
    const ligen = getVerfuegbareLigen();
    const spieleCount = await prisma.spiel.count();
    const naechsteSpiele = await prisma.spiel.count({
      where: { anpfiff: { gte: new Date() } },
    });

    // Spiele pro Liga zählen
    const spieleProLiga = await prisma.spiel.groupBy({
      by: ["liga"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    return NextResponse.json({
      verfuegbareLigen: ligen,
      spieleGesamt: spieleCount,
      naechsteSpiele,
      spieleProLiga: spieleProLiga.map((s) => ({
        liga: s.liga,
        anzahl: s._count.id,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}

/**
 * POST: Spielplan-Sync triggern
 * Body: { source?: "openliga" | "footballdata" | "all", ligen?: string[] }
 *
 * Kann auch via Cron mit CRON_SECRET Header aufgerufen werden
 */
export async function POST(req: Request) {
  try {
    // Auth prüfen: entweder Admin-User oder CRON_SECRET
    const cronSecret = req.headers.get("x-cron-secret");
    const validCron =
      cronSecret && process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;

    if (!validCron) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: "Nicht authentifiziert." },
          { status: 401 }
        );
      }

      // Nur Admins oder Bar-Owner dürfen manuell syncen
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user || (user.role !== "ADMIN" && user.role !== "BAR_OWNER")) {
        return NextResponse.json(
          { error: "Nicht autorisiert." },
          { status: 403 }
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const source = body.source || "all";
    const ligen = body.ligen;

    let results;

    switch (source) {
      case "openliga":
        results = await syncOpenLigaDB(ligen);
        break;
      case "footballdata":
        results = await syncFootballData(ligen);
        break;
      default:
        results = await syncAlleSpielplaene();
    }

    const totalCreated = results.reduce((s, r) => s + r.created, 0);
    const totalUpdated = results.reduce((s, r) => s + r.updated, 0);
    const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);

    return NextResponse.json({
      success: true,
      summary: {
        created: totalCreated,
        updated: totalUpdated,
        errors: totalErrors,
      },
      details: results,
    });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
