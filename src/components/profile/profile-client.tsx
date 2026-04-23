"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserPlus, UserCheck, Clock, Trophy, Star, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { rarityConfig, formatDate, VALIDATION_THRESHOLD } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProfileUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  createdAt: Date;
  isVerified: boolean;
}

interface UserAchievement {
  id: string;
  status: string;
  note: string | null;
  earnedAt: Date | null;
  achievement: {
    name: string;
    icon: string;
    description: string;
    rarity: string;
    pack: { name: string; color: string };
  };
  validations: Array<{ type: string }>;
}

interface Friendship {
  id: string;
  status: string;
  senderId: string;
  receiverId: string;
}

interface Props {
  user: ProfileUser;
  friendship: Friendship | null;
  earned: UserAchievement[];
  pending: UserAchievement[];
  isOwner: boolean;
  currentUserId: string;
}

export function ProfileClient({ user, friendship, earned, pending, isOwner, currentUserId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"earned" | "pending">("earned");

  const initials = user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const friendshipStatus = !friendship
    ? "none"
    : friendship.status === "ACCEPTED"
    ? "friends"
    : friendship.senderId === currentUserId
    ? "sent"
    : "received";

  function handleFriendAction() {
    startTransition(async () => {
      if (friendshipStatus === "none") {
        const res = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: user.id }),
        });
        if (res.ok) { toast.success("Solicitação enviada!"); router.refresh(); }
        else toast.error("Erro ao enviar solicitação.");
      } else if (friendshipStatus === "received") {
        const res = await fetch("/api/friends", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendshipId: friendship!.id, action: "ACCEPT" }),
        });
        if (res.ok) { toast.success("Amizade aceita!"); router.refresh(); }
        else toast.error("Erro ao aceitar solicitação.");
      }
    });
  }

  const items = tab === "earned" ? earned : pending;

  return (
    <div className="pt-4 space-y-5">
      {/* Profile header */}
      <div className="text-center space-y-3">
        <Avatar className="h-20 w-20 mx-auto ring-4 ring-neon/30">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
          <AvatarFallback className="text-2xl bg-secondary text-neon-500">{initials}</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-xl font-black">{user.name}</h1>
            {user.isVerified && <span className="text-blue-500">✓</span>}
          </div>
          {user.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
          {user.bio && (
            <p className="text-sm mt-2 max-w-xs mx-auto">{user.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-black text-neon">{earned.length}</p>
            <p className="text-xs text-muted-foreground">Troféus</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-muted-foreground">
              {formatDate(user.createdAt).split(" ")[2]}
            </p>
            <p className="text-xs text-muted-foreground">Membro desde</p>
          </div>
        </div>

        {/* Action buttons */}
        {!isOwner && (
          <div className="flex justify-center gap-2">
            {friendshipStatus === "none" && (
              <Button variant="neon" size="sm" className="gap-1.5" onClick={handleFriendAction} loading={isPending}>
                <UserPlus className="h-4 w-4" /> Adicionar amigo
              </Button>
            )}
            {friendshipStatus === "sent" && (
              <Button variant="outline" size="sm" className="gap-1.5" disabled>
                <Clock className="h-4 w-4" /> Solicitação enviada
              </Button>
            )}
            {friendshipStatus === "received" && (
              <Button variant="neon" size="sm" className="gap-1.5" onClick={handleFriendAction} loading={isPending}>
                <UserCheck className="h-4 w-4" /> Aceitar amizade
              </Button>
            )}
            {friendshipStatus === "friends" && (
              <Button variant="outline" size="sm" className="gap-1.5" disabled>
                <UserCheck className="h-4 w-4" /> Amigos
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-secondary p-1 gap-1">
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "earned" ? "bg-background shadow-sm text-neon" : "text-muted-foreground"}`}
          onClick={() => setTab("earned")}
        >
          <Trophy className="h-4 w-4" /> Troféus ({earned.length})
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "pending" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          onClick={() => setTab("pending")}
        >
          <Clock className="h-4 w-4" /> Pendentes ({pending.length})
        </button>
      </div>

      {/* Achievement list */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {tab === "earned" ? "Nenhum troféu ainda." : "Nenhuma conquista pendente."}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ua) => {
            const rarity = rarityConfig[ua.achievement.rarity as keyof typeof rarityConfig];
            const validates = ua.validations.filter((v) => v.type === "VALIDATE").length;
            const progress = (validates / VALIDATION_THRESHOLD) * 100;

            return (
              <Card key={ua.id} className={ua.status === "EARNED" ? "border-neon/30 bg-secondary" : ""}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${ua.achievement.pack.color}20` }}
                  >
                    {ua.achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm">{ua.achievement.name}</span>
                      <Badge variant={ua.achievement.rarity.toLowerCase() as "common" | "uncommon" | "rare" | "epic" | "legendary"} className="text-[10px]">
                        {rarity.label}
                      </Badge>
                    </div>
                    {ua.status === "PENDING" && (
                      <div className="mt-1.5 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">{validates}/{VALIDATION_THRESHOLD} validações</p>
                        <Progress value={progress} className="h-1" />
                      </div>
                    )}
                    {ua.earnedAt && (
                      <p className="text-[10px] text-neon-500 font-medium mt-0.5">
                        Conquistado em {formatDate(ua.earnedAt)}
                      </p>
                    )}
                  </div>
                  {ua.status === "EARNED" && <span className="text-xl">🏆</span>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
