import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Haversine-Distanz in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stadt = searchParams.get("stadt");
    const q = searchParams.get("q");
    const ausstattung = searchParams.get("ausstattung");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius"); // km, default 10

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (stadt && stadt !== "Alle") {
      where.stadt = stadt;
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { stadt: { contains: q } },
        { plz: { startsWith: q } },
        { adresse: { contains: q } },
        { beschreibung: { contains: q } },
      ];
    }

    if (ausstattung) {
      const features = ausstattung.split(",");
      if (features.includes("leinwand")) where.hatLeinwand = true;
      if (features.includes("beamer")) where.hatBeamer = true;
      if (features.includes("biergarten")) where.biergarten = true;
    }

    const bars = await prisma.bar.findMany({
      where,
      include: {
        spiele: {
          include: { spiel: true },
          where: {
            spiel: {
              anpfiff: { gte: new Date() },
            },
          },
        },
      },
      orderBy: [{ premiumTier: "desc" }, { bewertungen: "desc" }],
    });

    // Standort-basierte Filterung (post-query, da SQLite kein ST_Distance hat)
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius || "10");

      if (isNaN(userLat) || isNaN(userLng)) {
        return NextResponse.json(
          { error: "Ungültige Koordinaten." },
          { status: 400 }
        );
      }

      const barsWithDistance = bars
        .filter((bar) => bar.latitude != null && bar.longitude != null)
        .map((bar) => ({
          ...bar,
          distanz: Math.round(
            haversineKm(userLat, userLng, bar.latitude!, bar.longitude!) * 10
          ) / 10,
        }))
        .filter((bar) => bar.distanz <= maxRadius)
        .sort((a, b) => a.distanz - b.distanz);

      // Bars ohne Koordinaten an das Ende anfügen
      const barsOhneKoordinaten = bars
        .filter((bar) => bar.latitude == null || bar.longitude == null)
        .map((bar) => ({ ...bar, distanz: null }));

      return NextResponse.json([...barsWithDistance, ...barsOhneKoordinaten]);
    }

    return NextResponse.json(bars);
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
