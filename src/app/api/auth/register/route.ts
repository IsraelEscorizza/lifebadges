import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { generateUsername } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Este email já está em uso.", field: "email" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Unique username from name
    let username = generateUsername(name);
    const usernameExists = await db.user.findUnique({ where: { username }, select: { id: true } });
    if (usernameExists) {
      username = `${username}${Math.floor(Math.random() * 9999)}`;
    }

    await db.user.create({
      data: { name, email, passwordHash, username },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ message: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
