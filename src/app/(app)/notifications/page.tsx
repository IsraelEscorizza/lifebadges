import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export const metadata: Metadata = { title: "Notificações" };

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Mark all as read
  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return <NotificationsClient notifications={notifications} />;
}
