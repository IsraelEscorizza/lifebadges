import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
  bio: z.string().max(280).optional(),
});

export async function POST(req: NextRequest) {
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

    const { username, bio } = parsed.data;

    const existing = await db.user.findFirst({
      where: { username, id: { not: userId } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Este nome de usuário já está em uso.", field: "username" },
        { status: 409 }
      );
    }

    await db.user.update({
      where: { id: userId },
      data: { username, bio },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[onboarding]", error);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
