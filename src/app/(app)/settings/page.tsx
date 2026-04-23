import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, bio: true, image: true, isPrivate: true, email: true },
  });

  if (!user) return null;

  return <SettingsClient user={user} />;
}
