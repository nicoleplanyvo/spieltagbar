import nodemailer from "nodemailer";

// Transporter erstellen — verwendet SMTP-Konfiguration aus .env
// In Entwicklung: Falls keine SMTP-Daten gesetzt, wird ein Ethereal-Testaccount genutzt
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Produktions-SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Entwicklung: Console-Log statt echte E-Mails
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

const FROM_EMAIL = process.env.SMTP_FROM || "SpieltagBar <noreply@spieltagbar.de>";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// ===== E-Mail-Templates =====

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; color: #1A1A2E; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 24px; background-color: #1A1A2E; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; color: white; font-size: 28px; letter-spacing: 3px; }
    .header .gold { color: #F5A623; }
    .body { background-color: white; padding: 32px 24px; border-radius: 0 0 12px 12px; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #00D26A; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .btn:hover { background-color: #00B85C; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .badge-green { background-color: #DEF7EC; color: #03543F; }
    .badge-yellow { background-color: #FDF6B2; color: #723B13; }
    .badge-red { background-color: #FDE8E8; color: #9B1C1C; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px; }
    .info-label { color: #6B7280; min-width: 120px; }
    .info-value { font-weight: 600; color: #1A1A2E; }
    h2 { margin: 0 0 16px 0; font-size: 20px; }
    p { margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #4B5563; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SPIELTAG<span class="gold">BAR</span></h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SpieltagBar &mdash; Dein Fußball-Erlebnis</p>
      <p><a href="${APP_URL}" style="color: #00D26A;">spieltagbar.de</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ===== E-Mail senden =====

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transport = await getTransporter();
    const result = await transport.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    // In Dev-Modus: E-Mail-Inhalt loggen
    if (!process.env.SMTP_HOST) {
      console.log(`📧 [DEV] E-Mail an ${to}: ${subject}`);
      console.log(`📧 [DEV] Envelope:`, JSON.parse(result.message).to);
    }

    return { success: true };
  } catch (error) {
    console.error("E-Mail-Fehler:", error);
    return { success: false, error };
  }
}

// ===== Benachrichtigungs-Funktionen =====

/**
 * An Bar-Owner: Neue Reservierung eingegangen
 */
export async function sendNeueReservierungEmail(
  barOwnerEmail: string,
  data: {
    barName: string;
    gastName: string;
    datum: string;
    personen: number;
    notiz?: string;
  }
) {
  const html = baseTemplate(`
    <h2>🎉 Neue Reservierung!</h2>
    <p>Für deine Bar <strong>${data.barName}</strong> ist eine neue Reservierung eingegangen.</p>

    <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Gast</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.gastName}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Datum</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.datum}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Personen</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.personen}</td>
      </tr>
      ${data.notiz ? `
      <tr>
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Notiz</td>
        <td style="padding:8px 0; font-size:14px; color:#4B5563; font-style:italic;">${data.notiz}</td>
      </tr>` : ""}
    </table>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/dashboard/bar" class="btn">Im Dashboard ansehen</a>
    </p>
    <p style="text-align:center; font-size:12px; color:#999; margin-top:12px;">
      Bitte bestätige oder lehne die Reservierung in deinem Dashboard ab.
    </p>
  `);

  return sendEmail(barOwnerEmail, `Neue Reservierung für ${data.barName}`, html);
}

/**
 * An Fan: Reservierung wurde bestätigt
 */
export async function sendReservierungBestaetigtEmail(
  fanEmail: string,
  data: {
    barName: string;
    barAdresse: string;
    datum: string;
    personen: number;
  }
) {
  const html = baseTemplate(`
    <h2>✅ Reservierung bestätigt!</h2>
    <p>Deine Reservierung bei <strong>${data.barName}</strong> wurde bestätigt.</p>

    <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Bar</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.barName}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Adresse</td>
        <td style="padding:8px 0; font-size:14px;">${data.barAdresse}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Datum</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.datum}</td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Personen</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.personen}</td>
      </tr>
    </table>

    <div style="background:#DEF7EC; border-radius:8px; padding:12px 16px; margin:16px 0;">
      <p style="margin:0; color:#03543F; font-size:13px;">
        🎉 Dein Platz ist reserviert! Viel Spaß beim Fußball schauen.
      </p>
    </div>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/dashboard" class="btn">Meine Reservierungen</a>
    </p>
  `);

  return sendEmail(fanEmail, `Reservierung bestätigt — ${data.barName}`, html);
}

/**
 * An Fan: Reservierung wurde abgelehnt
 */
export async function sendReservierungAbgelehntEmail(
  fanEmail: string,
  data: {
    barName: string;
    datum: string;
  }
) {
  const html = baseTemplate(`
    <h2>Reservierung nicht möglich</h2>
    <p>Leider konnte deine Reservierung bei <strong>${data.barName}</strong> am <strong>${data.datum}</strong> nicht bestätigt werden.</p>

    <div style="background:#FDE8E8; border-radius:8px; padding:12px 16px; margin:16px 0;">
      <p style="margin:0; color:#9B1C1C; font-size:13px;">
        Die Bar hat leider keine Kapazität mehr. Versuche es bei einer anderen Bar!
      </p>
    </div>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/bars" class="btn" style="background-color:#F5A623;">Andere Bars finden</a>
    </p>
  `);

  return sendEmail(fanEmail, `Reservierung abgelehnt — ${data.barName}`, html);
}

/**
 * An Bar-Owner: Neue Promo-Buchung
 */
export async function sendPromoBuchungEmail(
  barOwnerEmail: string,
  data: {
    barName: string;
    dealTitel: string;
    gastName: string;
    personen: number;
    gesamtPreis: number;
    barAnteil: number;
  }
) {
  const html = baseTemplate(`
    <h2>💰 Neue Promo-Buchung!</h2>
    <p>Jemand hat einen Promo-Deal für <strong>${data.barName}</strong> gebucht.</p>

    <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Deal</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.dealTitel}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Gast</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.gastName}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Personen</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.personen}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Gesamtpreis</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.gesamtPreis.toFixed(2)} €</td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Dein Anteil (90%)</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px; color:#00D26A;">${data.barAnteil.toFixed(2)} €</td>
      </tr>
    </table>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/dashboard/bar" class="btn">Im Dashboard ansehen</a>
    </p>
  `);

  return sendEmail(barOwnerEmail, `Neue Buchung: ${data.dealTitel}`, html);
}

/**
 * An Fan: Buchungsbestätigung
 */
export async function sendBuchungsBestaetigungEmail(
  fanEmail: string,
  data: {
    barName: string;
    dealTitel: string;
    personen: number;
    gesamtPreis: number;
    datum?: string;
  }
) {
  const html = baseTemplate(`
    <h2>🎟️ Buchungsbestätigung</h2>
    <p>Deine Buchung bei <strong>${data.barName}</strong> war erfolgreich!</p>

    <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Deal</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.dealTitel}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Personen</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.personen}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Bezahlt</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.gesamtPreis.toFixed(2)} €</td>
      </tr>
      ${data.datum ? `
      <tr>
        <td style="padding:8px 0; color:#6B7280; font-size:14px;">Spieltag</td>
        <td style="padding:8px 0; font-weight:600; font-size:14px;">${data.datum}</td>
      </tr>` : ""}
    </table>

    <div style="background:#DEF7EC; border-radius:8px; padding:12px 16px; margin:16px 0;">
      <p style="margin:0; color:#03543F; font-size:13px;">
        ✅ Zeige diese Bestätigung am Eingang vor. Viel Spaß!
      </p>
    </div>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/dashboard" class="btn">Mein Dashboard</a>
    </p>
  `);

  return sendEmail(fanEmail, `Buchungsbestätigung — ${data.dealTitel}`, html);
}

/**
 * An neuen User: Willkommens-E-Mail nach Registrierung
 */
export async function sendWillkommensEmail(
  userEmail: string,
  data: {
    name: string;
    rolle: "FAN" | "BAR_OWNER";
  }
) {
  const isFan = data.rolle === "FAN";

  const html = baseTemplate(`
    <h2>Willkommen bei SpieltagBar, ${data.name}!</h2>

    <div style="background:linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%); border-radius:12px; padding:24px; text-align:center; margin:16px 0;">
      <p style="font-size:48px; margin:0;">&#9917;</p>
      <p style="color:white; font-size:16px; font-weight:600; margin:8px 0 0;">
        ${isFan ? "Dein Fussball-Erlebnis beginnt jetzt!" : "Bringe Fans in deine Bar!"}
      </p>
    </div>

    ${isFan ? `
    <p>Ab sofort kannst du:</p>
    <table style="width:100%; border-collapse:collapse; margin:12px 0;">
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:10px 0; font-size:14px;">&#127944; Spiele im Spielplan entdecken</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:10px 0; font-size:14px;">&#127866; Bars in deiner Naehe finden</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:10px 0; font-size:14px;">&#128229; Plaetze reservieren</td>
      </tr>
      <tr>
        <td style="padding:10px 0; font-size:14px;">&#127915; Exklusive Promo-Deals nutzen</td>
      </tr>
    </table>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/spiele" class="btn">Spielplan ansehen</a>
    </p>
    ` : `
    <p>Als Bar-Besitzer kannst du jetzt:</p>
    <table style="width:100%; border-collapse:collapse; margin:12px 0;">
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:10px 0; font-size:14px;">&#127866; Deine Bar registrieren und praesentieren</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:10px 0; font-size:14px;">&#128250; Spiele deiner Bar zuweisen</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:10px 0; font-size:14px;">&#128229; Reservierungen verwalten</td>
      </tr>
      <tr>
        <td style="padding:10px 0; font-size:14px;">&#128176; Promo-Deals erstellen und Gaeste gewinnen</td>
      </tr>
    </table>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/dashboard/bar" class="btn">Bar Dashboard</a>
    </p>
    `}

    <p style="font-size:12px; color:#9CA3AF; margin-top:24px;">
      Bei Fragen erreichst du uns unter info@spieltagbar.de
    </p>
  `);

  return sendEmail(userEmail, `Willkommen bei SpieltagBar, ${data.name}!`, html);
}

/**
 * An Fan: Reservierungserinnerung (24h vor dem Spieltag)
 */
export async function sendReservierungErinnerungEmail(
  fanEmail: string,
  data: {
    name: string;
    barName: string;
    barAdresse: string;
    datum: string;
    personen: number;
    barSlug: string;
  }
) {
  const html = baseTemplate(`
    <h2>Morgen ist Spieltag!</h2>
    <p>Hey ${data.name}, vergiss nicht: Du hast morgen eine Reservierung!</p>

    <div style="background:linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%); border-radius:12px; padding:20px; margin:16px 0;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0; color:#9CA3AF; font-size:13px;">Bar</td>
          <td style="padding:6px 0; color:white; font-weight:600; font-size:14px;">${data.barName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#9CA3AF; font-size:13px;">Adresse</td>
          <td style="padding:6px 0; color:#F5A623; font-size:14px;">${data.barAdresse}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#9CA3AF; font-size:13px;">Wann</td>
          <td style="padding:6px 0; color:white; font-weight:600; font-size:14px;">${data.datum}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#9CA3AF; font-size:13px;">Personen</td>
          <td style="padding:6px 0; color:white; font-weight:600; font-size:14px;">${data.personen}</td>
        </tr>
      </table>
    </div>

    <div style="background:#DEF7EC; border-radius:8px; padding:12px 16px; margin:16px 0;">
      <p style="margin:0; color:#03543F; font-size:13px;">
        &#9989; Dein Platz ist reserviert. Erscheine bitte puenktlich!
      </p>
    </div>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/bars/${data.barSlug}" class="btn">Bar-Details ansehen</a>
    </p>
  `);

  return sendEmail(fanEmail, `Morgen: Deine Reservierung bei ${data.barName}`, html);
}

/**
 * An Fan: Spieltag-Reminder (Spiel mit Reservierung steht bevor)
 */
export async function sendSpieltagReminderEmail(
  fanEmail: string,
  data: {
    name: string;
    spiele: Array<{
      heimTeam: string;
      gastTeam: string;
      anpfiff: string;
      barName: string;
      barSlug: string;
    }>;
  }
) {
  const spieleHtml = data.spiele.map((s) => `
    <div style="background:#F9FAFB; border-radius:8px; padding:16px; margin:8px 0; border-left:4px solid #00D26A;">
      <p style="margin:0 0 4px; font-weight:700; font-size:15px; color:#1A1A2E;">
        ${s.heimTeam} vs ${s.gastTeam}
      </p>
      <p style="margin:0; font-size:13px; color:#6B7280;">
        &#128339; ${s.anpfiff} &mdash; &#127866; ${s.barName}
      </p>
    </div>
  `).join("");

  const html = baseTemplate(`
    <h2>Heute ist Spieltag!</h2>
    <p>Hey ${data.name}, heute stehen spannende Spiele an:</p>

    ${spieleHtml}

    <div style="background:#FDF6B2; border-radius:8px; padding:12px 16px; margin:16px 0;">
      <p style="margin:0; color:#723B13; font-size:13px;">
        &#128276; Denk daran, puenktlich in deiner Bar zu sein!
      </p>
    </div>

    <p style="text-align:center; margin-top:24px;">
      <a href="${APP_URL}/spiele" class="btn">Alle Spiele ansehen</a>
    </p>
  `);

  const subject = data.spiele.length === 1
    ? `Heute: ${data.spiele[0].heimTeam} vs ${data.spiele[0].gastTeam}`
    : `Heute: ${data.spiele.length} Spiele stehen an!`;

  return sendEmail(fanEmail, subject, html);
}
