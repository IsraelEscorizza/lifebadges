import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GroupsClient } from "@/components/groups/groups-client";

export const metadata: Metadata = { title: "Grupos" };

export default async function GroupsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const [memberships, pendingInvites] = await Promise.all([
    db.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: { _count: { select: { members: true } } },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    db.groupInvite.findMany({
      where: { invitedId: userId, status: "PENDING" },
      include: {
        group: { select: { id: true, name: true, icon: true, description: true } },
        inviter: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  const groups = memberships
    .filter((m) => m.group.isActive)
    .map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      icon: m.group.icon,
      ownerId: m.group.ownerId,
      maxMembers: m.group.maxMembers,
      role: m.role,
      memberCount: m.group._count.members,
    }));

  return <GroupsClient groups={groups} pendingInvites={pendingInvites} />;
}
