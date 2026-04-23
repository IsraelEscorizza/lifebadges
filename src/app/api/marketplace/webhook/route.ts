import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Raw body required for Stripe signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ message: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ message: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, packId } = session.metadata ?? {};

    if (!userId || !packId) {
      return NextResponse.json({ message: "Missing metadata." }, { status: 400 });
    }

    try {
      await db.purchase.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: "COMPLETED",
          stripePaymentIntentId: session.payment_intent as string,
          receiptUrl: null,
          completedAt: new Date(),
        },
      });

      await db.notification.create({
        data: {
          userId,
          type: "PACK_PURCHASE_SUCCESS",
          title: "Pack desbloqueado! 🎉",
          body: "Seu novo pack de conquistas está disponível.",
          data: { packId },
        },
      });
    } catch (error) {
      console.error("[webhook] db update failed:", error);
      return NextResponse.json({ message: "DB error." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
