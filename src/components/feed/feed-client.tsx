"use client";

import Link from "next/link";
import { formatRelativeDate, rarityConfig, VALIDATION_THRESHOLD } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ValidationButtons } from "@/components/achievements/validation-buttons";
import { Trophy, Users } from "lucide-react";

interface FeedItem {
  id: string;
  status: string;
  note: string | null;
  createdAt: Date;
  earnedAt: Date | null;
  user: { id: string; name: string | null; username: string | null; image: string | null };
  achievement: {
    name: string;
    icon: string;
    description: string;
    rarity: string;
    pack: { name: string; icon: string; color: string };
  };
  validations: Array<{
    id: string;
    type: string;
    validator: { id: string; name: string | null; image: string | null };
  }>;
}

interface FeedClientProps {
  items: FeedItem[];
  currentUserId: string;
}

export function FeedClient({ items, currentUserId }: FeedClientProps) {
  if (items.length === 0) {
    return (
      <div className="mt-12 text-center space-y-3">
        <div className="text-6xl">🏆</div>
        <h2 className="text-xl font-bold">Seu feed está vazio</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Adicione amigos ou registre sua primeira conquista para começar!
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <Link href="/achievements" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors">
            Ver conquistas
          </Link>
          <Link href="/friends" className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent transition-colors">
            Adicionar amigos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <h1 className="text-xl font-black">Feed</h1>
      {items.map((item) => (
        <FeedCard key={item.id} item={item} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

function FeedCard({ item, currentUserId }: { item: FeedItem; currentUserId: string }) {
  const validates = item.validations.filter((v) => v.type === "VALIDATE");
  const contests = item.validations.filter((v) => v.type === "CONTEST");
  const myVote = item.validations.find((v) => v.validator.id === currentUserId);
  const isOwner = item.user.id === currentUserId;
  const progress = Math.min((validates.length / VALIDATION_THRESHOLD) * 100, 100);
  const rarity = rarityConfig[item.achievement.rarity as keyof typeof rarityConfig];
  const initials = item.user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/profile/${item.user.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.user.image ?? ""} alt={item.user.name ?? ""} />
              <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${item.user.id}`} className="font-semibold text-sm hover:underline">
              {item.user.name ?? item.user.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              registrou uma conquista · {formatRelativeDate(item.createdAt)}
            </p>
          </div>
          {item.status === "EARNED" && (
            <span className="text-amber-500 text-lg animate-trophy-glow">🏆</span>
          )}
        </div>

        {/* Achievement card */}
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

        {item.note && (
          <p className="text-sm text-muted-foreground italic">"{item.note}"</p>
        )}

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

        {item.status === "EARNED" && (
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            <Trophy className="h-4 w-4" />
            Troféu conquistado! Validado por {validates.length} pessoas.
          </div>
        )}

        {/* Validation buttons (only for friends, not self) */}
        {!isOwner && item.status === "PENDING" && (
          <ValidationButtons
            userAchievementId={item.id}
            myVote={myVote?.type ?? null}
          />
        )}

        {/* Validator avatars */}
        {validates.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {validates.slice(0, 5).map((v) => (
                <Avatar key={v.id} className="h-5 w-5 border border-background">
                  <AvatarImage src={v.validator.image ?? ""} />
                  <AvatarFallback className="text-[8px] bg-green-100 text-green-700">
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
