import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;
  const { id: groupId } = await params;

  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 404 });
  if (membership.role === "OWNER") {
    return NextResponse.json({ error: "O dono não pode sair — apenas excluir o grupo." }, { status: 400 });
  }

  await db.groupMember.delete({ where: { groupId_userId: { groupId, userId } } });
  return NextResponse.json({ ok: true });
}
