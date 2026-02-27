#!/bin/bash
# ============================================
# SpieltagBar — Plesk Deployment Script
# ============================================
# Dieses Script auf dem Plesk-Server ausführen
#
# Voraussetzungen:
#   1. Node.js 20+ in Plesk installiert
#   2. MySQL-Datenbank "spieltagbar_db" angelegt
#   3. .env mit Production-Werten konfiguriert
#   4. Git-Repository geklont oder Dateien hochgeladen
#
# Ausführen mit: bash deploy.sh
# ============================================

set -e  # Bei Fehler sofort abbrechen

echo "🏟️  SpieltagBar Deployment startet..."
echo "========================================"

# --- 1. Abhängigkeiten installieren ---
echo ""
echo "📦 [1/6] Abhängigkeiten installieren..."
npm ci --production=false
echo "✅ Abhängigkeiten installiert"

# --- 2. Prisma: MySQL-Schema aktivieren ---
echo ""
echo "🗄️  [2/6] Prisma auf MySQL umstellen..."

# Backup des SQLite-Schemas
if [ -f prisma/schema.prisma ]; then
  cp prisma/schema.prisma prisma/schema.sqlite.backup
fi

# MySQL-Schema als aktives Schema setzen
cp prisma/schema.mysql.prisma prisma/schema.prisma
echo "✅ MySQL-Schema aktiviert"

# --- 3. Prisma Client generieren & Datenbank migrieren ---
echo ""
echo "🔧 [3/6] Prisma Client generieren & Datenbank erstellen..."
npx prisma generate
npx prisma db push --accept-data-loss
echo "✅ Datenbank-Schema synchronisiert"

# --- 4. Next.js Build (Standalone fuer Plesk) ---
echo ""
echo "🏗️  [4/6] Next.js Production Build (Standalone)..."
BUILD_STANDALONE=true npm run build
echo "✅ Build erfolgreich"

# --- 5. Static Files in Standalone kopieren ---
echo ""
echo "📁 [5/6] Static Files kopieren..."
if [ -d ".next/standalone" ]; then
  cp -r public .next/standalone/ 2>/dev/null || true
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
  echo "✅ Static Files in Standalone kopiert"
else
  echo "⚠️  Kein standalone Output — normaler Start mit 'npm start'"
fi

# --- 6. Seed-Daten (optional) ---
echo ""
echo "🌱 [6/6] Seed-Daten..."
read -p "Demo-Daten laden? (j/n): " SEED_ANSWER
if [ "$SEED_ANSWER" = "j" ] || [ "$SEED_ANSWER" = "J" ]; then
  npm run db:seed
  echo "✅ Seed-Daten geladen"
else
  echo "⏭️  Seed übersprungen"
fi

# --- Fertig! ---
echo ""
echo "========================================"
echo "🎉 SpieltagBar Deployment abgeschlossen!"
echo "========================================"
echo ""
echo "Nächste Schritte:"
echo "  1. In Plesk → Node.js App konfigurieren:"
echo "     - Document Root:   /httpdocs"
echo "     - Application Root: /httpdocs"
echo "     - Application Startup File: .next/standalone/server.js"
echo "     - Node.js Version: 20+"
echo ""
echo "  2. Oder mit PM2 starten:"
echo "     pm2 start ecosystem.config.js"
echo "     pm2 save"
echo ""
echo "  3. Cron-Jobs in Plesk einrichten:"
echo "     a) Spielplan-Sync (alle 6 Stunden):"
echo "        Schedule: 0 */6 * * *"
echo "        Command:  curl -s https://DEINE-DOMAIN/api/cron/spielplan?secret=DEIN_CRON_SECRET"
echo ""
echo "     b) E-Mail-Erinnerungen (taeglich 10:00 Uhr):"
echo "        Schedule: 0 10 * * *"
echo "        Command:  curl -s https://DEINE-DOMAIN/api/cron/erinnerungen?secret=DEIN_CRON_SECRET"
echo ""
echo "  4. SSL-Zertifikat in Plesk aktivieren (Let's Encrypt)"
echo ""
