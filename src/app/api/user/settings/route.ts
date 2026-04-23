import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(60).trim(),
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
  bio: z.string().max(280).optional(),
  isPrivate: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }

    const { name, username, bio, isPrivate } = parsed.data;

    const usernameConflict = await db.user.findFirst({
      where: { username, id: { not: userId } },
      select: { id: true },
    });

    if (usernameConflict) {
      return NextResponse.json(
        { message: "Este nome de usuário já está em uso.", field: "username" },
        { status: 409 }
      );
    }

    await db.user.update({
      where: { id: userId },
      data: { name, username, bio, isPrivate },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[settings PATCH]", error);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
