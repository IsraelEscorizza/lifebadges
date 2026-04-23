import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ packId: z.string().cuid() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { freePackClaimedAt: true, firstLoginAt: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.freePackClaimedAt) return NextResponse.json({ error: "Free pack already claimed" }, { status: 409 });

  const pack = await db.achievementPack.findUnique({
    where: { id: parsed.data.packId },
    select: { id: true, isBase: true, isActive: true },
  });

  if (!pack || !pack.isActive || pack.isBase) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  // Create COMPLETED purchase at R$0 + mark free pack as claimed
  await db.$transaction([
    db.purchase.create({
      data: {
        userId,
        packId: pack.id,
        amount: 0,
        currency: "BRL",
        status: "COMPLETED",
        completedAt: new Date(),
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { freePackClaimedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
