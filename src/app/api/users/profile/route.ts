import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Eigenes Profil laden
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        favoriteTeam: true,
        city: true,
        createdAt: true,
        _count: {
          select: {
            reservierungen: true,
            bewertungen: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}

// PATCH: Profil aktualisieren
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const body = await req.json();
    const { name, favoriteTeam, city, image } = body;

    // Nur erlaubte Felder aktualisieren
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Name muss mindestens 2 Zeichen lang sein." },
          { status: 400 }
        );
      }
      data.name = name.trim();
    }
    if (favoriteTeam !== undefined) data.favoriteTeam = favoriteTeam || null;
    if (city !== undefined) data.city = city || null;
    if (image !== undefined) data.image = image || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Keine Änderungen angegeben." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id! },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        favoriteTeam: true,
        city: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
