"use client";

import { Bell, Trophy, UserPlus, ThumbsUp, AlertTriangle, ShoppingBag } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

const typeIconMap: Record<string, React.ReactNode> = {
  FRIEND_REQUEST: <UserPlus className="h-5 w-5 text-blue-500" />,
  FRIEND_ACCEPTED: <UserPlus className="h-5 w-5 text-green-500" />,
  ACHIEVEMENT_VALIDATED: <ThumbsUp className="h-5 w-5 text-green-500" />,
  ACHIEVEMENT_CONTESTED: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  ACHIEVEMENT_EARNED: <Trophy className="h-5 w-5 text-amber-500" />,
  ACHIEVEMENT_REJECTED: <AlertTriangle className="h-5 w-5 text-red-500" />,
  PACK_PURCHASE_SUCCESS: <ShoppingBag className="h-5 w-5 text-purple-500" />,
};

export function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="pt-12 text-center space-y-3">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="font-semibold">Tudo em dia!</h2>
        <p className="text-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-3">
      <h1 className="text-xl font-black">Notificações</h1>
      <div className="space-y-1">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl transition-colors",
              !notif.isRead ? "bg-amber-50 border border-amber-100" : "bg-card border border-transparent hover:bg-accent"
            )}
          >
            <div className="mt-0.5 flex-shrink-0 h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
              {typeIconMap[notif.type] ?? <Bell className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">{notif.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeDate(notif.createdAt)}</p>
            </div>
            {!notif.isRead && (
              <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
