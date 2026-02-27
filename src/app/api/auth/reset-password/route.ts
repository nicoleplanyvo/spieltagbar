import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate Limiting
    const ip = getClientIp(req);
    const rl = rateLimit(`reset-password:${ip}`, RATE_LIMITS.resetPassword);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Zu viele Versuche. Bitte warte einige Minuten." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token und Passwort sind erforderlich." }, { status: 400 });
    }

    // Passwort-Validierung: Min. 8 Zeichen, 1 Grossbuchstabe, 1 Zahl
    if (password.length < 8) {
      return NextResponse.json({ error: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Passwort muss mindestens einen Grossbuchstaben enthalten." }, { status: 400 });
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Passwort muss mindestens eine Zahl enthalten." }, { status: 400 });
    }

    // Token suchen und validieren
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Ungueltiger oder abgelaufener Link." }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      // Abgelaufenen Token loeschen
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json({ error: "Der Link ist abgelaufen. Bitte fordere einen neuen an." }, { status: 400 });
    }

    // User finden
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }

    // Passwort hashen und updaten (bcrypt cost 12 fuer Produktion)
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Token loeschen
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
