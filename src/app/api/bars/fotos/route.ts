import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

/**
 * GET /api/bars/fotos - Alle Fotos der Bar
 */
export async function GET() {
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

  const fotos = await prisma.barFoto.findMany({
    where: { barId: bar.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(fotos);
}

/**
 * POST /api/bars/fotos - Foto hochladen
 */
export async function POST(req: NextRequest) {
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

  // Max 10 Fotos pro Bar
  const fotoCount = await prisma.barFoto.count({ where: { barId: bar.id } });
  if (fotoCount >= 10) {
    return NextResponse.json(
      { error: "Maximal 10 Fotos pro Bar erlaubt." },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const alt = (formData.get("alt") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
  }

  // Nur Bilder erlauben
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Nur Bilddateien sind erlaubt." }, { status: 400 });
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Maximale Dateigröße: 5 MB." }, { status: 400 });
  }

  // Datei speichern
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${bar.id}_${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "bars");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/bars/${filename}`;

  const foto = await prisma.barFoto.create({
    data: {
      barId: bar.id,
      url,
      alt,
      sortOrder: fotoCount,
    },
  });

  return NextResponse.json(foto, { status: 201 });
}

/**
 * DELETE /api/bars/fotos?id=xxx - Foto löschen
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  const fotoId = req.nextUrl.searchParams.get("id");
  if (!fotoId) {
    return NextResponse.json({ error: "Foto-ID fehlt." }, { status: 400 });
  }

  const bar = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!bar) {
    return NextResponse.json({ error: "Keine Bar gefunden." }, { status: 404 });
  }

  const foto = await prisma.barFoto.findFirst({
    where: { id: fotoId, barId: bar.id },
  });

  if (!foto) {
    return NextResponse.json({ error: "Foto nicht gefunden." }, { status: 404 });
  }

  // Datei von Disk löschen
  try {
    const filePath = path.join(process.cwd(), "public", foto.url);
    await unlink(filePath);
  } catch {
    // Datei existiert möglicherweise nicht mehr
  }

  await prisma.barFoto.delete({ where: { id: fotoId } });

  return NextResponse.json({ success: true });
}
