import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;

  const [memberships, pendingInvites] = await Promise.all([
    db.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    db.groupInvite.findMany({
      where: { invitedId: userId, status: "PENDING" },
      include: {
        group: { select: { id: true, name: true, icon: true } },
        inviter: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  const groups = memberships.map((m) => ({
    ...m.group,
    role: m.role,
    memberCount: m.group._count.members,
  }));

  return NextResponse.json({ groups, pendingInvites });
}
