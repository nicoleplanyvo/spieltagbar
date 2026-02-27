import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Deploy Webhook — wird von GitHub Webhook aufgerufen
 *
 * GitHub Webhook URL: https://spieltagbar.de/api/deploy?secret=DEIN_CRON_SECRET
 *
 * Führt aus: git pull → npm install → build → static copy
 * Die App muss danach in Plesk manuell oder per PM2 neugestartet werden.
 */
export async function POST(req: Request) {
  const secret =
    req.headers.get("x-deploy-secret") ||
    new URL(req.url).searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const cwd = process.cwd();
    const logs: string[] = [];

    // 1. Git Pull
    try {
      const { stdout } = await execAsync("git pull origin main", { cwd, timeout: 30000 });
      logs.push(`✅ Git Pull: ${stdout.trim()}`);
    } catch (e) {
      logs.push(`⚠️ Git Pull: ${e instanceof Error ? e.message : "Fehler"}`);
    }

    // 2. npm install
    try {
      const { stdout } = await execAsync("npm install --production=false", { cwd, timeout: 120000 });
      logs.push(`✅ npm install: fertig (${stdout.split("\n").length} Zeilen)`);
    } catch (e) {
      logs.push(`❌ npm install: ${e instanceof Error ? e.message : "Fehler"}`);
      return NextResponse.json({ success: false, logs, duration: `${((Date.now() - startTime) / 1000).toFixed(1)}s` }, { status: 500 });
    }

    // 3. Prisma generate
    try {
      await execAsync("npx prisma generate", { cwd, timeout: 30000 });
      logs.push("✅ Prisma generate: fertig");
    } catch (e) {
      logs.push(`⚠️ Prisma generate: ${e instanceof Error ? e.message : "Fehler"}`);
    }

    // 4. Next.js Build
    try {
      await execAsync("npx next build", { cwd, timeout: 300000 }); // 5 min timeout
      logs.push("✅ Next.js Build: fertig");
    } catch (e) {
      logs.push(`❌ Build: ${e instanceof Error ? e.message : "Fehler"}`);
      return NextResponse.json({ success: false, logs, duration: `${((Date.now() - startTime) / 1000).toFixed(1)}s` }, { status: 500 });
    }

    // 5. Static Files kopieren
    try {
      await execAsync(
        'cp -r public .next/standalone/ 2>/dev/null; cp -r .next/static .next/standalone/.next/ 2>/dev/null || true',
        { cwd, timeout: 15000 }
      );
      logs.push("✅ Static Files kopiert");
    } catch (e) {
      logs.push(`⚠️ Static copy: ${e instanceof Error ? e.message : "Fehler"}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logs.push(`\n🎉 Deploy abgeschlossen in ${duration}s — App-Neustart nötig!`);

    return NextResponse.json({ success: true, logs, duration: `${duration}s` });
  } catch (error) {
    console.error("Deploy Webhook Fehler:", error);
    return NextResponse.json(
      { error: "Deploy fehlgeschlagen.", details: error instanceof Error ? error.message : "Unbekannt" },
      { status: 500 }
    );
  }
}
