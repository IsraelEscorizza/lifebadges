import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AchievementsClient } from "@/components/achievements/achievements-client";

export const metadata: Metadata = { title: "Conquistas" };

// Pack + achievement templates rarely change — cache 1 hour
const getAllPacks = unstable_cache(
  async () =>
    db.achievementPack.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        achievements: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
  ["all-packs"],
  { revalidate: 3600 }
);

export default async function AchievementsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const [packs, userAchievements, purchases] = await Promise.all([
    getAllPacks(),
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

  return (
    <AchievementsClient
      packs={packs}
      unlockedPackIds={unlockedPackIds}
      claimedMap={claimedMap}
    />
  );
}
