import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const sendRequestSchema = z.object({
  receiverId: z.string().cuid(),
});

const respondSchema = z.object({
  friendshipId: z.string().cuid(),
  action: z.enum(["ACCEPT", "REJECT"]),
});

// Send friend request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }
    const senderId = session.user.id;

    const body = await req.json();
    const parsed = sendRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }

    const { receiverId } = parsed.data;

    if (senderId === receiverId) {
      return NextResponse.json(
        { message: "Você não pode se adicionar." },
        { status: 400 }
      );
    }

    // Check if user exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true },
    });
    if (!receiver) {
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
    }

    // Check existing
    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Solicitação já existe ou vocês já são amigos." },
        { status: 409 }
      );
    }

    const friendship = await db.friendship.create({
      data: { senderId, receiverId, status: "PENDING" },
    });

    // Notify receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "FRIEND_REQUEST",
        title: "Nova solicitação de amizade",
        body: `Alguém quer ser seu amigo no LifeBadges!`,
        data: { friendshipId: friendship.id, senderId },
      },
    });

    return NextResponse.json({ ok: true, friendshipId: friendship.id }, { status: 201 });
  } catch (error) {
    console.error("[friends POST]", error);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}

// Accept / Reject friend request
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }

    const { friendshipId, action } = parsed.data;

    const friendship = await db.friendship.findUnique({ where: { id: friendshipId } });

    if (!friendship || friendship.receiverId !== userId) {
      return NextResponse.json({ message: "Solicitação não encontrada." }, { status: 404 });
    }

    if (friendship.status !== "PENDING") {
      return NextResponse.json({ message: "Solicitação já processada." }, { status: 409 });
    }

    if (action === "ACCEPT") {
      await db.friendship.update({
        where: { id: friendshipId },
        data: { status: "ACCEPTED" },
      });
      await db.notification.create({
        data: {
          userId: friendship.senderId,
          type: "FRIEND_ACCEPTED",
          title: "Solicitação aceita!",
          body: "Sua solicitação de amizade foi aceita.",
          data: { friendshipId },
        },
      });
    } else {
      await db.friendship.delete({ where: { id: friendshipId } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[friends PATCH]", error);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}

// List friends
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const friendships = await db.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
        receiver: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    const friends = friendships.map((f) =>
      f.senderId === userId ? f.receiver : f.sender
    );

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("[friends GET]", error);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
