import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { claimAchievementSchema } from "@/lib/validations/achievement";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = claimAchievementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }

    const { achievementId, note } = parsed.data;

    // Check achievement exists and user has access to its pack
    const achievement = await db.achievement.findUnique({
      where: { id: achievementId, isActive: true },
      include: { pack: { select: { id: true, isBase: true } } },
    });

    if (!achievement) {
      return NextResponse.json({ message: "Conquista não encontrada." }, { status: 404 });
    }

    // Check pack access
    if (!achievement.pack.isBase) {
      const purchase = await db.purchase.findFirst({
        where: { userId, packId: achievement.pack.id, status: "COMPLETED" },
      });
      if (!purchase) {
        return NextResponse.json({ message: "Você não possui este pack." }, { status: 403 });
      }
    }

    // Check not already claimed
    const existing = await db.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Você já registrou esta conquista." },
        { status: 409 }
      );
    }

    const userAchievement = await db.userAchievement.create({
      data: { userId, achievementId, note, status: "PENDING" },
    });

    return NextResponse.json({ ok: true, id: userAchievement.id }, { status: 201 });
  } catch (error) {
    console.error("[claim]", error);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
