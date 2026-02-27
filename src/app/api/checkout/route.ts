import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, getStripeEnabled } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    if (!getStripeEnabled()) {
      return NextResponse.json(
        { error: "Zahlungen sind noch nicht aktiviert." },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
    }

    const { promoDealId, personen } = await req.json();

    if (!promoDealId || !personen) {
      return NextResponse.json(
        { error: "Promo-Deal und Personenzahl sind erforderlich." },
        { status: 400 }
      );
    }

    const deal = await prisma.promoDeal.findUnique({
      where: { id: promoDealId },
      include: { bar: true },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal nicht gefunden." }, { status: 404 });
    }

    if (!deal.aktiv) {
      return NextResponse.json({ error: "Dieser Deal ist nicht mehr aktiv." }, { status: 400 });
    }

    if (deal.gebuchtePlaetze + parseInt(personen) > deal.maxPlaetze) {
      return NextResponse.json({ error: "Nicht genügend Plätze verfügbar." }, { status: 400 });
    }

    const anzahlPersonen = parseInt(personen);
    const gesamtPreis = deal.preis * anzahlPersonen;

    // 10% Vermittlungsprovision für SpieltagBar
    const PROVISIONS_SATZ = 0.10;
    const provision = Math.round(gesamtPreis * PROVISIONS_SATZ * 100) / 100;
    const barAnteil = Math.round((gesamtPreis - provision) * 100) / 100;

    // Stripe Checkout Session erstellen
    const checkoutSession = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: deal.titel,
              description: `${deal.bar.name} - ${anzahlPersonen} Person(en)`,
            },
            unit_amount: Math.round(deal.preis * 100),
          },
          quantity: anzahlPersonen,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?buchung=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?buchung=cancelled`,
      metadata: {
        promoDealId: deal.id,
        userId: session.user.id!,
        personen: anzahlPersonen.toString(),
        provision: provision.toString(),
        barAnteil: barAnteil.toString(),
      },
    });

    // Buchung in DB erstellen (Status: ausstehend)
    await prisma.promoBuchung.create({
      data: {
        promoDealId: deal.id,
        userId: session.user.id!,
        personen: anzahlPersonen,
        gesamtPreis,
        provision,
        barAnteil,
        stripeSessionId: checkoutSession.id,
        bezahlStatus: "AUSSTEHEND",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
