import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { FeedClient } from "@/components/feed/feed-client";
import { FirstLoginModal } from "@/components/feed/first-login-modal";

export const metadata: Metadata = { title: "Feed" };

async function getFeedData(userId: string) {
  const [friendships, user] = await Promise.all([
    db.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: { senderId: true, receiverId: true },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { freePackClaimedAt: true },
    }),
  ]);

  const friendIds = friendships.map((f) =>
    f.senderId === userId ? f.receiverId : f.senderId
  );
  const feedUserIds = [userId, ...friendIds];

  const [items, friendSuggestions, claimedAchievementIds, paidPacks, purchasedPackIds] =
    await Promise.all([
      // Feed items
      db.userAchievement.findMany({
        where: { userId: { in: feedUserIds } },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
          achievement: {
            include: { pack: { select: { name: true, icon: true, color: true } } },
          },
          validations: {
            include: { validator: { select: { id: true, name: true, image: true } } },
          },
        },
      }),

      // Friend suggestions: users not yet connected to current user, limit 6
      db.user.findMany({
        where: {
          id: { not: userId },
          deletedAt: null,
          isBanned: false,
          sentFriendRequests: { none: { receiverId: userId } },
          receivedFriendRequests: { none: { senderId: userId } },
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          _count: { select: { userAchievements: true } },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),

      // Achievements the user has already claimed
      db.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),

      // All paid packs (for free-pack modal)
      db.achievementPack.findMany({
        where: { isBase: false, isActive: true },
        select: { id: true, name: true, icon: true, description: true },
        orderBy: { sortOrder: "asc" },
      }),

      // Packs the user already purchased
      db.purchase.findMany({
        where: { userId, status: "COMPLETED" },
        select: { packId: true },
      }),
    ]);

  const claimedIds = new Set(claimedAchievementIds.map((a) => a.achievementId));
  const ownedPackIds = new Set(purchasedPackIds.map((p) => p.packId));

  // Achievement suggestions: unclaimed achievements from packs the user owns (base or purchased)
  const ownedPacksWithAchievements = await db.achievementPack.findMany({
    where: {
      isActive: true,
      OR: [{ isBase: true }, { id: { in: Array.from(ownedPackIds) } }],
    },
    include: {
      achievements: {
        where: { isActive: true, id: { notIn: Array.from(claimedIds) } },
        orderBy: { sortOrder: "asc" },
        take: 3,
      },
    },
  });

  const achievementSuggestions = ownedPacksWithAchievements
    .flatMap((p) => p.achievements.map((a) => ({ ...a, packName: p.name, packIcon: p.icon })))
    .slice(0, 5);

  // Show free pack modal only if user hasn't claimed yet and packs exist
  const showFreePack = !user?.freePackClaimedAt && paidPacks.length > 0;

  return {
    items,
    friendSuggestions,
    achievementSuggestions,
    paidPacks,
    showFreePack,
    friendIds,
  };
}

export default async function FeedPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const data = await getFeedData(userId);

  return (
    <>
      {data.showFreePack && <FirstLoginModal packs={data.paidPacks} />}
      <FeedClient
        items={data.items}
        currentUserId={userId}
        friendSuggestions={data.friendSuggestions}
        achievementSuggestions={data.achievementSuggestions}
        friendIds={data.friendIds}
      />
    </>
  );
}
