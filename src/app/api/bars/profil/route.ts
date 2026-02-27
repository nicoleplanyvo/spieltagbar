import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/bars/profil - Vollständige Bar-Daten für den Besitzer
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  const bar = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
    include: { fotos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!bar) {
    return NextResponse.json({ error: "Keine Bar gefunden." }, { status: 404 });
  }

  return NextResponse.json(bar);
}

/**
 * PATCH /api/bars/profil - Bar-Profil aktualisieren
 */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  const bar = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!bar) {
    return NextResponse.json({ error: "Keine Bar gefunden." }, { status: 404 });
  }

  const body = await req.json();

  // Erlaubte Felder zum Aktualisieren
  const allowedFields = [
    "name",
    "beschreibung",
    "adresse",
    "stadt",
    "plz",
    "telefon",
    "website",
    "bildUrl",
    "kapazitaet",
    "hatReservierung",
    "hatLeinwand",
    "hatBeamer",
    "biergarten",
    "oeffnungszeiten",
  ];

  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (field === "kapazitaet") {
        updateData[field] = parseInt(body[field]) || bar.kapazitaet;
      } else if (["hatReservierung", "hatLeinwand", "hatBeamer", "biergarten"].includes(field)) {
        updateData[field] = Boolean(body[field]);
      } else {
        updateData[field] = body[field];
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 });
  }

  const updated = await prisma.bar.update({
    where: { id: bar.id },
    data: updateData,
    include: { fotos: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(updated);
}
