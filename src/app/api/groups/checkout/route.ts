import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const GROUP_PRICE_BRL = 1490; // R$14,90 in centavos

const schema = z.object({
  name: z.string().min(3, "Nome muito curto").max(40, "Nome muito longo").trim(),
  description: z.string().max(200).optional(),
  icon: z.string().max(4).default("🏆"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  const userId = session.user.id as string;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });

  const { name, description, icon } = parsed.data;
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Create inactive group first so we have the ID for metadata
  const group = await db.group.create({
    data: { name, description, icon, ownerId: userId, isActive: false },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "brl",
          unit_amount: GROUP_PRICE_BRL,
          product_data: {
            name: `${icon} Grupo: ${name}`,
            description: "Criação de grupo fechado no LifeBadges (até 10 membros)",
          },
        },
        quantity: 1,
      },
    ],
    metadata: { type: "group", groupId: group.id, userId },
    success_url: `${appUrl}/groups?created=1`,
    cancel_url:  `${appUrl}/groups?canceled=1`,
    locale: "pt-BR",
  });

  await db.group.update({
    where: { id: group.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
