import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GroupDetailClient } from "@/components/groups/group-detail-client";

export const metadata: Metadata = { title: "Grupo" };

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id as string;

  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  });
  if (!membership) redirect("/groups");

  const group = await db.group.findUnique({
    where: { id, isActive: true },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              userAchievements: {
                where: { status: "EARNED" },
                select: { id: true, achievement: { select: { icon: true, name: true } } },
              },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      invites: {
        where: { status: "PENDING" },
        include: {
          invited: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!group) notFound();

  // Friends available to invite (accepted friends not yet in the group)
  const memberIds = group.members.map((m) => m.userId);

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

  const invitableFriends = await db.user.findMany({
    where: {
      id: { in: friendIds, notIn: memberIds },
      deletedAt: null,
      isBanned: false,
    },
    select: { id: true, name: true, username: true, image: true },
  });

  const leaderboard = group.members
    .map((m) => ({
      id: m.user.id,
      name: m.user.name,
      username: m.user.username,
      image: m.user.image,
      role: m.role,
      earned: m.user.userAchievements.length,
      recentTrophies: m.user.userAchievements
        .slice(0, 3)
        .map((ua) => ua.achievement.icon),
    }))
    .sort((a, b) => b.earned - a.earned);

  return (
    <GroupDetailClient
      group={{
        id: group.id,
        name: group.name,
        description: group.description,
        icon: group.icon,
        ownerId: group.ownerId,
        maxMembers: group.maxMembers,
        memberCount: group.members.length,
      }}
      leaderboard={leaderboard}
      pendingInvites={group.invites.map((inv) => ({
        id: inv.id,
        invited: inv.invited,
      }))}
      invitableFriends={invitableFriends}
      currentUserId={userId}
      currentUserRole={membership.role}
    />
  );
}
