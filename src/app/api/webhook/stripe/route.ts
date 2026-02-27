import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { sendPromoBuchungEmail, sendBuchungsBestaetigungEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Buchung als bezahlt markieren
    const buchung = await prisma.promoBuchung.findFirst({
      where: { stripeSessionId: session.id },
    });

    if (buchung) {
      await prisma.promoBuchung.update({
        where: { id: buchung.id },
        data: {
          bezahlStatus: "BEZAHLT",
          stripePaymentId: session.payment_intent as string,
        },
      });

      // Plätze im PromoDeal updaten
      await prisma.promoDeal.update({
        where: { id: buchung.promoDealId },
        data: {
          gebuchtePlaetze: {
            increment: buchung.personen,
          },
        },
      });

      // E-Mail-Benachrichtigungen senden
      const deal = await prisma.promoDeal.findUnique({
        where: { id: buchung.promoDealId },
        include: {
          bar: { include: { owner: { select: { email: true } } } },
        },
      });

      const fan = await prisma.user.findUnique({
        where: { id: buchung.userId },
        select: { email: true, name: true },
      });

      if (deal && fan) {
        // An Bar-Owner
        sendPromoBuchungEmail(deal.bar.owner.email, {
          barName: deal.bar.name,
          dealTitel: deal.titel,
          gastName: fan.name || fan.email,
          personen: buchung.personen,
          gesamtPreis: buchung.gesamtPreis,
          barAnteil: buchung.barAnteil,
        }).catch(console.error);

        // An Fan
        sendBuchungsBestaetigungEmail(fan.email, {
          barName: deal.bar.name,
          dealTitel: deal.titel,
          personen: buchung.personen,
          gesamtPreis: buchung.gesamtPreis,
          datum: deal.spielTag ? new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "short" }).format(deal.spielTag) : undefined,
        }).catch(console.error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
