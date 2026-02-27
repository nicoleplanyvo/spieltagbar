import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
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
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transport = await getTransporter();
  const from = process.env.SMTP_FROM || "SpieltagBar <noreply@spieltagbar.de>";

  const result = await transport.sendMail({ from, to, subject, html });

  if (!process.env.SMTP_HOST) {
    console.log(`📧 [DEV] E-Mail an ${to}: ${subject}`);
  }

  return result;
}
