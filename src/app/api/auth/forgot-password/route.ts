import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate Limiting
    const ip = getClientIp(req);
    const rl = rateLimit(`forgot-password:${ip}`, RATE_LIMITS.forgotPassword);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte warte einige Minuten." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-Mail ist erforderlich." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Immer "success" zurückgeben (auch wenn User nicht existiert) — Sicherheit
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Alte Tokens für diese Email löschen
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Neuen Token generieren
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde gültig

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    // E-Mail mit Reset-Link senden
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/passwort-reset?token=${token}`;

    // Import dynamisch um circular deps zu vermeiden
    const { sendEmail: sendRawEmail } = await import("@/lib/email-raw");
    await sendRawEmail(email, "Passwort zurücksetzen — SpieltagBar", `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align:center; padding:24px; background-color:#1A1A2E; border-radius:12px 12px 0 0;">
          <h1 style="margin:0; color:white; font-size:28px; letter-spacing:3px;">
            SPIELTAG<span style="color:#F5A623;">BAR</span>
          </h1>
        </div>
        <div style="background:white; padding:32px 24px; border-radius:0 0 12px 12px;">
          <h2 style="margin:0 0 16px; font-size:20px; color:#1A1A2E;">Passwort zurücksetzen</h2>
          <p style="color:#4B5563; font-size:14px; line-height:1.6;">
            Wir haben eine Anfrage erhalten, dein Passwort zurückzusetzen.
            Klicke auf den Button, um ein neues Passwort zu wählen.
          </p>
          <p style="text-align:center; margin:24px 0;">
            <a href="${resetUrl}" style="display:inline-block; padding:12px 28px; background-color:#00D26A; color:white; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">
              Neues Passwort setzen
            </a>
          </p>
          <p style="color:#9CA3AF; font-size:12px;">
            Der Link ist 1 Stunde gültig. Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.
          </p>
        </div>
        <div style="text-align:center; padding:20px; font-size:12px; color:#999;">
          &copy; ${new Date().getFullYear()} SpieltagBar
        </div>
      </div>
    `);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
