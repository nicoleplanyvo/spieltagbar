-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'FAN',
    "favoriteTeam" TEXT,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "beschreibung" TEXT,
    "adresse" TEXT NOT NULL,
    "stadt" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "telefon" TEXT,
    "website" TEXT,
    "bildUrl" TEXT,
    "kapazitaet" INTEGER NOT NULL DEFAULT 50,
    "hatReservierung" BOOLEAN NOT NULL DEFAULT true,
    "hatLeinwand" BOOLEAN NOT NULL DEFAULT true,
    "hatBeamer" BOOLEAN NOT NULL DEFAULT false,
    "biergarten" BOOLEAN NOT NULL DEFAULT false,
    "oeffnungszeiten" TEXT,
    "ownerId" TEXT NOT NULL,
    "bewertungen" REAL NOT NULL DEFAULT 0,
    "premiumTier" TEXT NOT NULL DEFAULT 'BASIC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Spiel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heimTeam" TEXT NOT NULL,
    "gastTeam" TEXT NOT NULL,
    "liga" TEXT NOT NULL,
    "anpfiff" DATETIME NOT NULL,
    "tvSender" TEXT,
    "status" TEXT NOT NULL DEFAULT 'GEPLANT',
    "ergebnis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BarSpiel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barId" TEXT NOT NULL,
    "spielId" TEXT NOT NULL,
    "hatTon" BOOLEAN NOT NULL DEFAULT true,
    "plaetze" INTEGER,
    CONSTRAINT "BarSpiel_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BarSpiel_spielId_fkey" FOREIGN KEY ("spielId") REFERENCES "Spiel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservierung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "datum" DATETIME NOT NULL,
    "personen" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AUSSTEHEND',
    "notiz" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservierung_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservierung_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bar_slug_key" ON "Bar"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Bar_ownerId_key" ON "Bar"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "BarSpiel_barId_spielId_key" ON "BarSpiel"("barId", "spielId");
