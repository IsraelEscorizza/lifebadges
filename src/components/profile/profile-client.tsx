"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserPlus, UserCheck, Clock, Trophy, Users, ShoppingBag, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { rarityConfig, formatDate, VALIDATION_THRESHOLD } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";

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

interface Friend {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface PurchasedPack {
  id: string;
  name: string;
  icon: string;
  color: string;
  _count: { achievements: number };
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
  friends: Friend[];
  purchasedPacks: PurchasedPack[];
  isOwner: boolean;
  currentUserId: string;
}

type Tab = "earned" | "pending" | "friends" | "packs";

export function ProfileClient({
  user, friendship, earned, pending, friends, purchasedPacks, isOwner, currentUserId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("earned");

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

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "earned",  label: "Troféus",  icon: <Trophy className="h-3.5 w-3.5" />, count: earned.length },
    { id: "pending", label: "Em andamento", icon: <Clock className="h-3.5 w-3.5" />, count: pending.length },
    { id: "friends", label: "Amigos",   icon: <Users className="h-3.5 w-3.5" />, count: friends.length },
    { id: "packs",   label: "Packs",    icon: <ShoppingBag className="h-3.5 w-3.5" />, count: purchasedPacks.length },
  ];

  return (
    <div className="pt-4 space-y-5 pb-6">
      <BackButton />

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
            <p className="text-sm mt-2 max-w-xs mx-auto text-foreground/80">{user.bio}</p>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex justify-center gap-6">
          <StatPill label="Troféus" value={earned.length} accent />
          <StatPill label="Amigos" value={friends.length} />
          <StatPill label="Packs" value={purchasedPacks.length} />
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
      <div className="flex rounded-xl bg-secondary p-1 gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-w-0",
              tab === t.id
                ? "bg-background shadow-sm text-neon"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            <span className="text-[10px] opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "earned" && (
        <AchievementList items={earned} empty="Nenhum troféu ainda." />
      )}
      {tab === "pending" && (
        <AchievementList items={pending} empty="Nenhuma conquista em andamento." />
      )}
      {tab === "friends" && (
        <FriendsList friends={friends} />
      )}
      {tab === "packs" && (
        <PacksList packs={purchasedPacks} />
      )}
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className={cn("text-2xl font-black", accent ? "text-neon" : "text-foreground")}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function AchievementList({ items, empty }: { items: UserAchievement[]; empty: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">{empty}</div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((ua) => {
        const rarity = rarityConfig[ua.achievement.rarity as keyof typeof rarityConfig];
        const trophyColor = rarity.trophyColor;
        const validates = ua.validations.filter((v) => v.type === "VALIDATE").length;
        const progress = (validates / VALIDATION_THRESHOLD) * 100;

        return (
          <Card key={ua.id} className={ua.status === "EARNED" ? "border-neon/20" : ""}>
            <CardContent className="p-3 flex items-center gap-3">
              {/* Achievement icon */}
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: `${ua.achievement.pack.color}20` }}
              >
                {ua.achievement.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm">{ua.achievement.name}</span>
                  <Badge
                    variant={ua.achievement.rarity.toLowerCase() as "common" | "uncommon" | "rare" | "epic" | "legendary"}
                    className="text-[10px] px-1.5 py-0"
                  >
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
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Conquistado em {formatDate(ua.earnedAt)}
                  </p>
                )}
              </div>

              {/* PSN-style trophy icon */}
              {ua.status === "EARNED" && (
                <Trophy
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: trophyColor }}
                />
              )}
              {ua.status === "PENDING" && (
                <Clock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FriendsList({ friends }: { friends: Friend[] }) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Nenhum amigo ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => {
        const initials = friend.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";
        return (
          <Link key={friend.id} href={`/profile/${friend.id}`} className="block group">
            <Card className="transition-colors group-hover:border-border/80">
              <CardContent className="p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={friend.image ?? ""} />
                  <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{friend.name}</p>
                  {friend.username && (
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                  )}
                </div>
                <UserCheck className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-neon transition-colors" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function PacksList({ packs }: { packs: PurchasedPack[] }) {
  if (packs.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Nenhum pack adquirido ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {packs.map((pack) => (
        <div
          key={pack.id}
          className="rounded-xl p-4 text-white space-y-1"
          style={{ backgroundColor: pack.color }}
        >
          <span className="text-3xl">{pack.icon}</span>
          <p className="font-bold text-sm leading-tight">{pack.name}</p>
          <p className="text-xs opacity-75">{pack._count.achievements} conquistas</p>
        </div>
      ))}
    </div>
  );
}
