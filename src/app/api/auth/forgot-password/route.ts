import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ ok: true });
    }

    const { email } = parsed.data;
    const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });

    if (!user) {
      // Silent success — prevents enumeration
      return NextResponse.json({ ok: true });
    }

    // Invalidate old tokens
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    await sendPasswordResetEmail({
      to: email,
      name: user.name ?? "Usuário",
      token: rawToken,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ ok: true }); // always silent
  }
}
