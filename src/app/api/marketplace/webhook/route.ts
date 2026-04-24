import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

async function grantAchievement(userId: string, slug: string) {
  const ach = await db.achievement.findFirst({ where: { slug }, select: { id: true } });
  if (!ach) return;
  await db.userAchievement.upsert({
    where: { userId_achievementId: { userId, achievementId: ach.id } },
    update: {},
    create: { userId, achievementId: ach.id, status: "EARNED", earnedAt: new Date() },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ message: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ message: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    // ── Group creation ──────────────────────────────────────────
    if (meta.type === "group") {
      const { groupId, userId } = meta;
      if (!groupId || !userId) return NextResponse.json({ message: "Missing metadata." }, { status: 400 });

      try {
        await db.$transaction(async (tx) => {
          // Activate group + add owner as first member
          await tx.group.update({
            where: { id: groupId },
            data: { isActive: true, stripeSessionId: session.id },
          });
          await tx.groupMember.upsert({
            where: { groupId_userId: { groupId, userId } },
            update: {},
            create: { groupId, userId, role: "OWNER" },
          });
        });

        await grantAchievement(userId, "fundador-de-grupo");

        await db.notification.create({
          data: {
            userId,
            type: "PACK_PURCHASE_SUCCESS",
            title: "Grupo criado! 🎉",
            body: "Seu grupo foi criado com sucesso. Convide amigos para participar!",
            data: { groupId },
          },
        });
      } catch (error) {
        console.error("[webhook] group creation failed:", error);
        return NextResponse.json({ message: "DB error." }, { status: 500 });
      }

      return NextResponse.json({ received: true });
    }

    // ── Pack purchase ────────────────────────────────────────────
    const { userId, packId } = meta;
    if (!userId || !packId) return NextResponse.json({ message: "Missing metadata." }, { status: 400 });

    try {
      await db.purchase.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: "COMPLETED",
          stripePaymentIntentId: session.payment_intent as string,
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
      console.error("[webhook] pack purchase failed:", error);
      return NextResponse.json({ message: "DB error." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
