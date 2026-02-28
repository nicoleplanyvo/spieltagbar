import { NextResponse } from "next/server";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Debug-Endpoint — zeigt den Server-Status
 * Zugriff: GET /api/debug?secret=CRON_SECRET
 */
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const cwd = process.cwd();
  const info: Record<string, unknown> = {
    cwd,
    nodeVersion: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL ? "***set***" : "MISSING",
      CRON_SECRET: process.env.CRON_SECRET ? "***set***" : "MISSING",
    },
  };

  // Prüfe ob wichtige Verzeichnisse existieren
  const dirs = [
    "src/app/login",
    "src/app/register",
    "src/app/dashboard",
    ".next",
    ".next/standalone",
    ".next/standalone/.next",
    ".next/standalone/.next/server",
    ".next/standalone/.next/server/app",
    ".next/standalone/.next/server/app/login",
    ".next/standalone/.next/server/app/register",
    ".next/static",
    "node_modules",
    ".git",
  ];

  info.directories = {};
  for (const dir of dirs) {
    const fullPath = join(cwd, dir);
    (info.directories as Record<string, unknown>)[dir] = existsSync(fullPath)
      ? "EXISTS"
      : "MISSING";
  }

  // Zeige Dateien im App-Root
  try {
    info.rootFiles = readdirSync(cwd).filter(
      (f) => !f.startsWith(".") && f !== "node_modules"
    );
  } catch {
    info.rootFiles = "FEHLER";
  }

  // Zeige src/app Verzeichnisse
  try {
    const appDir = join(cwd, "src/app");
    if (existsSync(appDir)) {
      info.appRoutes = readdirSync(appDir);
    }
  } catch {
    info.appRoutes = "FEHLER";
  }

  // Zeige Build-Routes (standalone)
  try {
    const serverAppDir = join(cwd, ".next/standalone/.next/server/app");
    if (existsSync(serverAppDir)) {
      info.buildRoutes = readdirSync(serverAppDir);
    } else {
      // Fallback: check .next/server/app directly
      const altDir = join(cwd, ".next/server/app");
      if (existsSync(altDir)) {
        info.buildRoutesAlt = readdirSync(altDir);
      }
    }
  } catch {
    info.buildRoutes = "FEHLER";
  }

  // Routes Manifest
  try {
    const manifestPath = join(cwd, ".next/routes-manifest.json");
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
      info.dynamicRoutes = manifest.dynamicRoutes?.map((r: { page: string }) => r.page);
      info.staticRoutes = manifest.staticRoutes?.map((r: { page: string }) => r.page);
    }
  } catch {
    info.routesManifest = "FEHLER";
  }

  return NextResponse.json(info, { status: 200 });
}
