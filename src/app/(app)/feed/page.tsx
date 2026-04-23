import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { FeedClient } from "@/components/feed/feed-client";

export const metadata: Metadata = { title: "Feed" };

async function getFeedItems(userId: string) {
  // Get friends IDs
  const friendships = await db.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    select: { senderId: true, receiverId: true },
  });

  const friendIds = friendships.map((f) =>
    f.senderId === userId ? f.receiverId : f.senderId
  );

  // Feed = own + friends' achievements
  const feedUserIds = [userId, ...friendIds];

  const items = await db.userAchievement.findMany({
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
  });

  return items;
}

export default async function FeedPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const items = await getFeedItems(userId);

  return <FeedClient items={items} currentUserId={userId} />;
}
