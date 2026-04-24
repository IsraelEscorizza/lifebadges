import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;
  const { id } = await params;

  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

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
                select: { id: true },
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

  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build leaderboard sorted by earned achievements
  const leaderboard = group.members
    .map((m) => ({
      id: m.user.id,
      name: m.user.name,
      username: m.user.username,
      image: m.user.image,
      role: m.role,
      earned: m.user.userAchievements.length,
    }))
    .sort((a, b) => b.earned - a.earned);

  return NextResponse.json({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      icon: group.icon,
      ownerId: group.ownerId,
      maxMembers: group.maxMembers,
      memberCount: group.members.length,
    },
    leaderboard,
    pendingInvites: group.invites,
    currentUserRole: membership.role,
  });
}
