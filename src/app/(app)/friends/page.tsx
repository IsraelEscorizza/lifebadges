import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { FriendsClient } from "@/components/friends/friends-client";

export const metadata: Metadata = { title: "Amigos" };

async function getData(userId: string) {
  const [friendships, pending, suggestions] = await Promise.all([
    db.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
        receiver: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
    db.friendship.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
    // Suggest users not yet connected
    db.user.findMany({
      where: {
        id: { not: userId },
        isBanned: false,
        deletedAt: null,
        sentFriendRequests: { none: { receiverId: userId } },
        receivedFriendRequests: { none: { senderId: userId } },
      },
      take: 10,
      select: { id: true, name: true, username: true, image: true },
    }),
  ]);

  const friends = friendships.map((f) =>
    f.senderId === userId ? f.receiver : f.sender
  );

  return { friends, pending, suggestions };
}

export default async function FriendsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const { friends, pending, suggestions } = await getData(userId);

  return (
    <FriendsClient
      friends={friends}
      pendingRequests={pending}
      suggestions={suggestions}
      currentUserId={userId}
    />
  );
}
