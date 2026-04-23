import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AchievementsClient } from "@/components/achievements/achievements-client";

export const metadata: Metadata = { title: "Conquistas" };

async function getData(userId: string) {
  const [packs, userAchievements, purchases] = await Promise.all([
    db.achievementPack.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        achievements: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    db.userAchievement.findMany({
      where: { userId },
      select: {
        achievementId: true,
        status: true,
        validations: { select: { type: true } },
      },
    }),
    db.purchase.findMany({
      where: { userId, status: "COMPLETED" },
      select: { packId: true },
    }),
  ]);

  const unlockedPackIds = new Set([
    ...packs.filter((p) => p.isBase).map((p) => p.id),
    ...purchases.map((p) => p.packId),
  ]);

  const claimedMap = new Map(
    userAchievements.map((ua) => [
      ua.achievementId,
      {
        status: ua.status,
        validates: ua.validations.filter((v) => v.type === "VALIDATE").length,
        contests: ua.validations.filter((v) => v.type === "CONTEST").length,
      },
    ])
  );

  return { packs, unlockedPackIds, claimedMap };
}

export default async function AchievementsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const { packs, unlockedPackIds, claimedMap } = await getData(userId);

  return (
    <AchievementsClient
      packs={packs}
      unlockedPackIds={unlockedPackIds}
      claimedMap={claimedMap}
    />
  );
}
