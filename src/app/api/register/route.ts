import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { sendWillkommensEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // Rate Limiting
    const ip = getClientIp(req);
    const rl = rateLimit(`register:${ip}`, RATE_LIMITS.register);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Zu viele Registrierungsversuche. Bitte warte einige Minuten." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const { name, email, password, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, E-Mail und Passwort sind erforderlich." },
        { status: 400 }
      );
    }

    // Passwort-Validierung: Min. 8 Zeichen, 1 Grossbuchstabe, 1 Zahl
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 8 Zeichen haben." },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Passwort muss mindestens einen Grossbuchstaben enthalten." },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Passwort muss mindestens eine Zahl enthalten." },
        { status: 400 }
      );
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Bitte gib eine gueltige E-Mail-Adresse ein." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Diese E-Mail ist bereits registriert." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role === "BAR_OWNER" ? "BAR_OWNER" : "FAN",
      },
    });

    // Willkommens-E-Mail asynchron senden (blockiert nicht die Response)
    sendWillkommensEmail(user.email, {
      name: user.name || "Fussballfan",
      rolle: user.role as "FAN" | "BAR_OWNER",
    }).catch((err) => console.error("Willkommens-E-Mail Fehler:", err));

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
