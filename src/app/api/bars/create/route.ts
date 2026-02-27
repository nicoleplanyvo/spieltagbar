import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BAR_OWNER") {
      return NextResponse.json({ error: "Nur Bar-Betreiber können Bars erstellen." }, { status: 403 });
    }

    // Prüfe ob User schon eine Bar hat
    const existingBar = await prisma.bar.findUnique({
      where: { ownerId: user.id },
    });

    if (existingBar) {
      return NextResponse.json({ error: "Du hast bereits eine Bar eingetragen." }, { status: 400 });
    }

    const body = await req.json();
    const { name, beschreibung, adresse, stadt, plz, telefon, website, kapazitaet } = body;

    if (!name || !adresse || !stadt || !plz) {
      return NextResponse.json(
        { error: "Name, Adresse, Stadt und PLZ sind Pflichtfelder." },
        { status: 400 }
      );
    }

    // Eindeutigen Slug generieren
    let slug = slugify(name);
    const existingSlug = await prisma.bar.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${stadt.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      const existingSlug2 = await prisma.bar.findUnique({ where: { slug } });
      if (existingSlug2) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const bar = await prisma.bar.create({
      data: {
        name,
        slug,
        beschreibung: beschreibung || null,
        adresse,
        stadt,
        plz,
        telefon: telefon || null,
        website: website || null,
        kapazitaet: parseInt(kapazitaet) || 50,
        ownerId: user.id,
        hatReservierung: true,
        hatLeinwand: true,
        hatBeamer: false,
        biergarten: false,
        premiumTier: "BASIC",
      },
    });

    return NextResponse.json(bar);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
