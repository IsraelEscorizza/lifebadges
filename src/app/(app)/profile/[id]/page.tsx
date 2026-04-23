import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileClient } from "@/components/profile/profile-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, select: { name: true } });
  return { title: user?.name ?? "Perfil" };
}

async function getProfile(id: string, currentUserId: string) {
  const user = await db.user.findUnique({
    where: { id, deletedAt: null, isBanned: false },
    select: {
      id: true, name: true, username: true, image: true, bio: true,
      createdAt: true, isVerified: true,
      userAchievements: {
        where: { status: { in: ["EARNED", "PENDING"] } },
        orderBy: { createdAt: "desc" },
        include: {
          achievement: {
            include: { pack: { select: { name: true, color: true } } },
          },
          validations: { select: { type: true } },
        },
      },
    },
  });

  if (!user) return null;

  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: id },
        { senderId: id, receiverId: currentUserId },
      ],
    },
  });

  const earned = user.userAchievements.filter((ua) => ua.status === "EARNED");
  const pending = user.userAchievements.filter((ua) => ua.status === "PENDING");

  return { user, friendship, earned, pending };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session!.user!.id as string;

  const data = await getProfile(id, currentUserId);
  if (!data) notFound();

  return (
    <ProfileClient
      user={data.user}
      friendship={data.friendship}
      earned={data.earned}
      pending={data.pending}
      isOwner={id === currentUserId}
      currentUserId={currentUserId}
    />
  );
}
