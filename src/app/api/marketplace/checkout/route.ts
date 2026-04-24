import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const schema = z.object({ packId: z.string().cuid() });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }

    const { packId } = parsed.data;

    const pack = await db.achievementPack.findUnique({
      where: { id: packId, isActive: true, isBase: false },
    });

    if (!pack) {
      return NextResponse.json({ message: "Pack não encontrado." }, { status: 404 });
    }

    // Check not already purchased
    const existing = await db.purchase.findFirst({
      where: { userId, packId, status: "COMPLETED" },
    });

    if (existing) {
      return NextResponse.json({ message: "Você já possui este pack." }, { status: 409 });
    }

    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "pix"],
      payment_method_options: {
        pix: { expires_after_seconds: 3600 }, // Pix expira em 1h
      },
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: Math.round(pack.price * 100),
            product_data: {
              name: `${pack.icon} ${pack.name}`,
              description: pack.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, packId },
      success_url: `${appUrl}/marketplace?success=1&pack=${packId}`,
      cancel_url:  `${appUrl}/marketplace?canceled=1`,
      locale: "pt-BR",
    });

    // Create pending purchase record
    await db.purchase.create({
      data: {
        userId,
        packId,
        amount: pack.price,
        currency: "BRL",
        status: "PENDING",
        stripeSessionId: checkoutSession.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json({ message: "Erro ao criar sessão de pagamento." }, { status: 500 });
  }
}
