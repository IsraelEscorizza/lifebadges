import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const inviteSchema = z.object({ invitedId: z.string().cuid() });
const respondSchema = z.object({ action: z.enum(["ACCEPT", "DECLINE"]), inviteId: z.string().cuid() });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;
  const { id: groupId } = await params;

  const body = await req.json();

  // Handle ACCEPT/DECLINE (invited user)
  const respond = respondSchema.safeParse(body);
  if (respond.success) {
    const { action, inviteId } = respond.data;
    const invite = await db.groupInvite.findUnique({
      where: { id: inviteId },
      include: { group: { select: { maxMembers: true, _count: { select: { members: true } } } } },
    });
    if (!invite || invite.invitedId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      if (invite.group._count.members >= invite.group.maxMembers) {
        return NextResponse.json({ error: "Grupo cheio" }, { status: 409 });
      }

      await db.$transaction(async (tx) => {
        await tx.groupInvite.update({ where: { id: inviteId }, data: { status: "ACCEPTED" } });
        await tx.groupMember.create({ data: { groupId: invite.groupId, userId } });

        // Auto-grant "Membro de Grupo" achievement
        const memberAch = await tx.achievement.findFirst({ where: { slug: "membro-de-grupo" }, select: { id: true } });
        if (memberAch) {
          await tx.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId: memberAch.id } },
            update: {},
            create: { userId, achievementId: memberAch.id, status: "EARNED", earnedAt: new Date() },
          });
        }
      });
    } else {
      await db.groupInvite.update({ where: { id: inviteId }, data: { status: "DECLINED" } });
    }

    return NextResponse.json({ ok: true });
  }

  // Handle sending invite (group member)
  const invite = inviteSchema.safeParse(body);
  if (!invite.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const group = await db.group.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } },
  });
  if (!group?.isActive) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group._count.members >= group.maxMembers) {
    return NextResponse.json({ error: "Grupo cheio (máx. 10 membros)" }, { status: 409 });
  }

  // Check not already a member
  const alreadyMember = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: invite.data.invitedId } },
  });
  if (alreadyMember) return NextResponse.json({ error: "Já é membro" }, { status: 409 });

  await db.groupInvite.upsert({
    where: { groupId_invitedId: { groupId, invitedId: invite.data.invitedId } },
    update: { status: "PENDING", inviterId: userId },
    create: { groupId, invitedId: invite.data.invitedId, inviterId: userId, status: "PENDING" },
  });

  return NextResponse.json({ ok: true });
}
