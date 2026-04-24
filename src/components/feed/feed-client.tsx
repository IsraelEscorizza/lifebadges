"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatRelativeDate, formatDate, rarityConfig, VALIDATION_THRESHOLD } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ValidationButtons } from "@/components/achievements/validation-buttons";
import { Trophy, Users, UserPlus, Sparkles, CalendarDays, ShoppingBag } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

interface AchievementData {
  id: string;
  status: string;
  note: string | null;
  createdAt: Date;
  earnedAt: Date | null;
  user: { id: string; name: string | null; username: string | null; image: string | null };
  achievement: {
    name: string; icon: string; description: string; rarity: string;
    pack: { name: string; icon: string; color: string };
  };
  validations: Array<{
    id: string; type: string;
    validator: { id: string; name: string | null; image: string | null };
  }>;
}

interface PurchaseData {
  id: string;
  createdAt: Date;
  user: { id: string; name: string | null; username: string | null; image: string | null };
  pack: { id: string; name: string; icon: string; color: string; description: string; _count: { achievements: number } };
}

type FeedEvent =
  | { type: "achievement"; createdAt: Date; data: AchievementData }
  | { type: "purchase";    createdAt: Date; data: PurchaseData };

interface FriendSuggestion {
  id: string; name: string | null; username: string | null; image: string | null;
  _count: { userAchievements: number };
}

interface AchievementSuggestion {
  id: string; name: string; icon: string; description: string;
  rarity: string; packName: string; packIcon: string;
}

interface FeedClientProps {
  feedEvents: FeedEvent[];
  currentUserId: string;
  friendSuggestions: FriendSuggestion[];
  achievementSuggestions: AchievementSuggestion[];
  friendIds: string[];
}

/* ─── Main component ──────────────────────────────────────────── */

export function FeedClient({
  feedEvents, currentUserId, friendSuggestions, achievementSuggestions, friendIds,
}: FeedClientProps) {
  const hasFriends = friendIds.length > 0;

  return (
    <div className="space-y-4 pt-4 pb-6">
      <h1 className="text-xl font-black">Feed</h1>

      {/* Achievement suggestions */}
      {achievementSuggestions.length > 0 && (
        <SuggestionSection title="Conquistas para você alcançar" icon={<Sparkles className="h-4 w-4 text-neon" />}>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
            {achievementSuggestions.map((a) => (
              <AchievementSuggestionCard key={a.id} achievement={a} />
            ))}
          </div>
        </SuggestionSection>
      )}

      {/* Friend suggestions */}
      {friendSuggestions.length > 0 && (
        <SuggestionSection title="Sugestões de amigos" icon={<UserPlus className="h-4 w-4 text-neon" />}>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
            {friendSuggestions.map((u) => (
              <FriendSuggestionCard key={u.id} user={u} />
            ))}
          </div>
        </SuggestionSection>
      )}

      {/* Feed events */}
      {feedEvents.length === 0 ? (
        <EmptyFeed hasFriends={hasFriends} />
      ) : (
        <>
          {hasFriends && (
            <p className="text-xs text-muted-foreground px-1">
              Atividades recentes dos seus amigos e suas
            </p>
          )}
          {feedEvents.map((event) =>
            event.type === "achievement" ? (
              <AchievementCard key={`ach-${event.data.id}`} item={event.data} currentUserId={currentUserId} />
            ) : (
              <PurchaseCard key={`pur-${event.data.id}`} purchase={event.data} currentUserId={currentUserId} />
            )
          )}
        </>
      )}
    </div>
  );
}

/* ─── Suggestion section wrapper ─────────────────────────────── */

function SuggestionSection({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold text-foreground/80">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Achievement suggestion horizontal card ─────────────────── */

function AchievementSuggestionCard({ achievement }: { achievement: AchievementSuggestion }) {
  const rarity = rarityConfig[achievement.rarity as keyof typeof rarityConfig];
  return (
    <Link
      href="/achievements"
      className="snap-start flex-shrink-0 w-44 bg-secondary border border-border hover:border-neon/40 rounded-xl p-3 space-y-2 transition-colors"
    >
      <div className="text-3xl">{achievement.icon}</div>
      <div>
        <p className="font-semibold text-xs text-foreground leading-tight">{achievement.name}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{achievement.packIcon} {achievement.packName}</p>
      </div>
      <Badge variant={achievement.rarity.toLowerCase() as "common" | "uncommon" | "rare" | "epic" | "legendary"} className="text-[10px]">
        {rarity.label}
      </Badge>
    </Link>
  );
}

/* ─── Friend suggestion horizontal card ──────────────────────── */

function FriendSuggestionCard({ user }: { user: FriendSuggestion }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const initials = user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  async function addFriend() {
    setLoading(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success("Pedido enviado!");
    } catch {
      toast.error("Erro ao enviar pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="snap-start flex-shrink-0 w-36 bg-secondary border border-border rounded-xl p-3 flex flex-col items-center gap-2 text-center">
      <Link href={`/profile/${user.id}`} className="flex flex-col items-center gap-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
          <AvatarFallback className="bg-neon/10 text-neon text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-xs text-foreground truncate max-w-[112px]">{user.name ?? user.username}</p>
          <p className="text-[10px] text-muted-foreground">{user._count.userAchievements} conquistas</p>
        </div>
      </Link>
      {sent ? (
        <span className="text-xs text-neon font-semibold">Pedido enviado ✓</span>
      ) : (
        <Button
          size="sm"
          className="w-full h-7 text-xs bg-neon text-black font-bold hover:bg-neon-300"
          disabled={loading}
          onClick={addFriend}
        >
          {loading ? "..." : "Adicionar"}
        </Button>
      )}
    </div>
  );
}

/* ─── Empty feed ─────────────────────────────────────────────── */

function EmptyFeed({ hasFriends }: { hasFriends: boolean }) {
  return (
    <div className="mt-8 text-center space-y-3">
      <Trophy className="h-14 w-14 mx-auto text-muted-foreground/40" strokeWidth={1} />
      <h2 className="text-xl font-bold">Seu feed está vazio</h2>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
        {hasFriends
          ? "Registre sua primeira conquista para ela aparecer aqui!"
          : "Adicione amigos ou registre sua primeira conquista para começar!"}
      </p>
      <div className="flex gap-2 justify-center mt-4">
        <Link href="/achievements">
          <Button size="sm" className="bg-neon text-black font-semibold hover:bg-neon-300">
            Ver conquistas
          </Button>
        </Link>
        {!hasFriends && (
          <Link href="/friends">
            <Button size="sm" variant="outline">Adicionar amigos</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Achievement feed card ──────────────────────────────────── */

// Copy variants — more engaging than "conquistou uma conquista"
function achievementVerb(status: string) {
  if (status === "EARNED") return "desbloqueou um troféu";
  return "está conquistando um troféu";
}

function AchievementCard({ item, currentUserId }: { item: AchievementData; currentUserId: string }) {
  const validates = item.validations.filter((v) => v.type === "VALIDATE");
  const contests  = item.validations.filter((v) => v.type === "CONTEST");
  const myVote    = item.validations.find((v) => v.validator.id === currentUserId);
  const isOwner   = item.user.id === currentUserId;
  const progress  = Math.min((validates.length / VALIDATION_THRESHOLD) * 100, 100);
  const rarity    = rarityConfig[item.achievement.rarity as keyof typeof rarityConfig];
  const initials  = item.user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/profile/${item.user.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.user.image ?? ""} alt={item.user.name ?? ""} />
              <AvatarFallback className="bg-secondary text-neon-500 text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${item.user.id}`} className="font-semibold text-sm hover:underline">
              {item.user.name ?? item.user.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              {achievementVerb(item.status)} · {formatRelativeDate(item.createdAt)}
            </p>
          </div>
          {item.status === "EARNED" && (
            <Trophy className="h-5 w-5 flex-shrink-0" style={{ color: rarity.trophyColor }} />
          )}
        </div>

        {/* Achievement block */}
        <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${item.achievement.pack.color}20` }}
          >
            {item.achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{item.achievement.name}</span>
              <Badge variant={item.achievement.rarity.toLowerCase() as "common" | "uncommon" | "rare" | "epic" | "legendary"}>
                {rarity.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{item.achievement.description}</p>
          </div>
        </div>

        {item.note && <p className="text-sm text-muted-foreground italic">"{item.note}"</p>}

        {/* Validation progress */}
        {item.status !== "EARNED" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {validates.length}/{VALIDATION_THRESHOLD} validações
              </span>
              {contests.length > 0 && (
                <span className="text-orange-500">{contests.length} contestação(ões)</span>
              )}
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Earned banner */}
        {item.status === "EARNED" && (
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: rarity.trophyColor }} />
            <span className="font-semibold" style={{ color: rarity.trophyColor }}>
              Troféu conquistado!
            </span>
            {validates.length > 0 && (
              <span className="text-muted-foreground text-xs">
                {validates.length} {validates.length === 1 ? "pessoa validou" : "pessoas validaram"}
              </span>
            )}
            {item.earnedAt && (
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <CalendarDays className="h-3 w-3" />
                {formatDate(item.earnedAt)}
              </span>
            )}
          </div>
        )}

        {/* Validation buttons */}
        {!isOwner && item.status === "PENDING" && (
          <ValidationButtons userAchievementId={item.id} myVote={myVote?.type ?? null} />
        )}

        {/* Validator avatars */}
        {validates.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {validates.slice(0, 5).map((v) => (
                <Avatar key={v.id} className="h-5 w-5 border border-background">
                  <AvatarImage src={v.validator.image ?? ""} />
                  <AvatarFallback className="text-[8px] bg-secondary">
                    {v.validator.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              {validates.length > 1
                ? `${validates[0].validator.name} e mais ${validates.length - 1} validaram`
                : `${validates[0].validator.name} validou`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Pack purchase feed card ────────────────────────────────── */

function PurchaseCard({ purchase, currentUserId }: { purchase: PurchaseData; currentUserId: string }) {
  const isSelf   = purchase.user.id === currentUserId;
  const initials = purchase.user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/profile/${purchase.user.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={purchase.user.image ?? ""} alt={purchase.user.name ?? ""} />
              <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${purchase.user.id}`} className="font-semibold text-sm hover:underline">
              {purchase.user.name ?? purchase.user.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              desbloqueou um novo pack · {formatRelativeDate(purchase.createdAt)}
            </p>
          </div>
          <ShoppingBag className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        </div>

        {/* Pack banner */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: `${purchase.pack.color}18` }}
        >
          <div
            className="h-14 flex items-center gap-3 px-4"
            style={{ backgroundColor: purchase.pack.color }}
          >
            <span className="text-2xl">{purchase.pack.icon}</span>
            <div className="text-white">
              <p className="font-black text-base leading-tight">{purchase.pack.name}</p>
              <p className="text-xs opacity-80">{purchase.pack._count.achievements} conquistas incluídas</p>
            </div>
          </div>
          {purchase.pack.description && (
            <p className="text-xs text-muted-foreground px-4 py-2 leading-relaxed">
              {purchase.pack.description}
            </p>
          )}
        </div>

        {/* CTA — only show for others, not self */}
        {!isSelf && (
          <Link href="/marketplace">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <ShoppingBag className="h-3.5 w-3.5" />
              Ver este pack na loja
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
