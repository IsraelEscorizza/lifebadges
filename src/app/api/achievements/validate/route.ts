import { NextRequest, NextResponse } from "next/server";
import { UserAchievementStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateAchievementSchema } from "@/lib/validations/achievement";
import { VALIDATION_THRESHOLD, CONTEST_REJECTION_THRESHOLD } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }
    const validatorId = session.user.id;

    const body = await req.json();
    const parsed = validateAchievementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }

    const { userAchievementId, type, comment } = parsed.data;

    const userAchievement = await db.userAchievement.findUnique({
      where: { id: userAchievementId },
      include: { validations: { select: { type: true } } },
    });

    if (!userAchievement) {
      return NextResponse.json({ message: "Conquista não encontrada." }, { status: 404 });
    }

    // Cannot validate your own achievement
    if (userAchievement.userId === validatorId) {
      return NextResponse.json(
        { message: "Você não pode validar sua própria conquista." },
        { status: 403 }
      );
    }

    // Achievement must be pending
    if (userAchievement.status === "EARNED") {
      return NextResponse.json(
        { message: "Esta conquista já foi conquistada." },
        { status: 409 }
      );
    }

    // Check if already voted
    const existing = await db.validation.findUnique({
      where: { userAchievementId_validatorId: { userAchievementId, validatorId } },
    });

    if (existing) {
      return NextResponse.json({ message: "Você já votou nesta conquista." }, { status: 409 });
    }

    // Must be friend of achievement owner
    const friendship = await db.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: validatorId, receiverId: userAchievement.userId },
          { senderId: userAchievement.userId, receiverId: validatorId },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { message: "Você precisa ser amigo para validar conquistas." },
        { status: 403 }
      );
    }

    // Create validation
    await db.validation.create({
      data: { userAchievementId, validatorId, type, comment },
    });

    // Recalculate status
    const allValidations = [...userAchievement.validations, { type }];
    const validates = allValidations.filter((v) => v.type === "VALIDATE").length;
    const contests = allValidations.filter((v) => v.type === "CONTEST").length;

    let newStatus: UserAchievementStatus = userAchievement.status;
    let earnedAt: Date | undefined;

    if (validates >= VALIDATION_THRESHOLD) {
      newStatus = UserAchievementStatus.EARNED;
      earnedAt = new Date();
    } else if (contests >= CONTEST_REJECTION_THRESHOLD && contests > validates) {
      newStatus = UserAchievementStatus.CONTESTED;
    }

    if (newStatus !== userAchievement.status) {
      await db.userAchievement.update({
        where: { id: userAchievementId },
        data: { status: newStatus, ...(earnedAt ? { earnedAt } : {}) },
      });

      // Notify achievement owner
      const notifType =
        newStatus === UserAchievementStatus.EARNED
          ? "ACHIEVEMENT_EARNED"
          : type === "VALIDATE"
          ? "ACHIEVEMENT_VALIDATED"
          : "ACHIEVEMENT_CONTESTED";

      await db.notification.create({
        data: {
          userId: userAchievement.userId,
          type: notifType,
          title:
            newStatus === UserAchievementStatus.EARNED
              ? "Troféu conquistado! 🏆"
              : type === "VALIDATE"
              ? "Conquista validada!"
              : "Conquista contestada",
          body:
            newStatus === UserAchievementStatus.EARNED
              ? "Você recebeu 5 validações e ganhou o troféu!"
              : type === "VALIDATE"
              ? "Alguém validou sua conquista."
              : "Alguém contestou sua conquista.",
          data: { userAchievementId },
        },
      });
    }

    return NextResponse.json({ ok: true, newStatus });
  } catch (error) {
    console.error("[validate]", error);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
