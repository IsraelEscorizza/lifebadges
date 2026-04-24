"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, CheckCircle, Clock, ShoppingBag, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClaimAchievementDialog } from "@/components/achievements/claim-dialog";
import { rarityConfig, VALIDATION_THRESHOLD } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";

interface Pack {
  id: string;
  name: string;
  icon: string;
  color: string;
  isBase: boolean;
  price: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
}

interface ClaimedInfo {
  status: string;
  validates: number;
  contests: number;
}

interface Props {
  packs: Pack[];
  unlockedPackIds: Set<string>;
  claimedMap: Map<string, ClaimedInfo>;
}

export function AchievementsClient({ packs, unlockedPackIds, claimedMap }: Props) {
  // Only show unlocked packs in tabs
  const unlockedPacks = packs.filter((p) => unlockedPackIds.has(p.id));
  const lockedCount = packs.length - unlockedPacks.length;

  const [selectedPackId, setSelectedPackId] = useState<string>(unlockedPacks[0]?.id ?? "");
  const [claimTarget, setClaimTarget] = useState<Achievement | null>(null);

  const selectedPack = unlockedPacks.find((p) => p.id === selectedPackId);

  const earnedCount = selectedPack?.achievements.filter(
    (a) => claimedMap.get(a.id)?.status === "EARNED"
  ).length ?? 0;
  const totalCount = selectedPack?.achievements.length ?? 0;

  return (
    <div className="pt-4 space-y-4">
      <BackButton href="/feed" />
      <h1 className="text-xl font-black">Conquistas</h1>

      {/* Pack tabs — only unlocked packs + "more" button */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center">
        {unlockedPacks.map((pack) => (
          <button
            key={pack.id}
            onClick={() => setSelectedPackId(pack.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border flex-shrink-0",
              selectedPackId === pack.id
                ? "border-transparent text-white shadow-sm"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
            style={selectedPackId === pack.id ? { backgroundColor: pack.color } : {}}
          >
            {pack.icon} {pack.name}
          </button>
        ))}

        {/* "Get more packs" button */}
        <Link
          href="/marketplace"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-neon/50 transition-all"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {lockedCount > 0 ? `+${lockedCount} packs` : "Loja"}
        </Link>
      </div>

      {/* Pack header */}
      {selectedPack && (
        <div className="rounded-xl p-4 text-white" style={{ backgroundColor: selectedPack.color }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">{selectedPack.name}</h2>
              <p className="text-sm opacity-80">
                {earnedCount}/{totalCount} conquistados
              </p>
            </div>
            <span className="text-4xl">{selectedPack.icon}</span>
          </div>
          <Progress
            value={(earnedCount / totalCount) * 100}
            className="mt-3 h-2 bg-white/30"
          />
        </div>
      )}

      {/* Empty state if no unlocked packs */}
      {unlockedPacks.length === 0 && (
        <div className="text-center py-10 space-y-3">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="font-semibold">Nenhum pack desbloqueado</p>
          <p className="text-sm text-muted-foreground">
            Adquira um pack na loja para começar a colecionar conquistas.
          </p>
          <Link href="/marketplace">
            <Button variant="neon" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Ver na loja
            </Button>
          </Link>
        </div>
      )}

      {/* Achievement grid */}
      {selectedPack && (
        <div className="grid grid-cols-1 gap-3">
          {selectedPack.achievements.map((achievement) => {
            const claimed = claimedMap.get(achievement.id);
            const isEarned = claimed?.status === "EARNED";
            const isPending = claimed?.status === "PENDING";
            const rarity = rarityConfig[achievement.rarity as keyof typeof rarityConfig];
            const progress = isPending
              ? Math.min(((claimed?.validates ?? 0) / VALIDATION_THRESHOLD) * 100, 100)
              : 0;

            return (
              <div
                key={achievement.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  isEarned
                    ? "border-neon/20 bg-secondary"
                    : isPending
                    ? "border-border bg-secondary/40"
                    : "border-border bg-card hover:bg-accent cursor-pointer"
                )}
                onClick={() => {
                  if (!claimed) setClaimTarget(achievement);
                }}
              >
                {/* Achievement icon */}
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative"
                  style={{ backgroundColor: `${selectedPack.color}20` }}
                >
                  {achievement.icon}
                  {isEarned && (
                    <Trophy
                      className="absolute -top-1 -right-1 h-4 w-4 drop-shadow-sm"
                      style={{ color: rarity.trophyColor }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{achievement.name}</span>
                    <Badge
                      variant={achievement.rarity.toLowerCase() as "common" | "uncommon" | "rare" | "epic" | "legendary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {rarity.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                  {isPending && (
                    <div className="mt-1.5 space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">
                        {claimed?.validates}/{VALIDATION_THRESHOLD} validações
                      </p>
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {isEarned && <CheckCircle className="h-5 w-5 text-neon" />}
                  {isPending && <Clock className="h-5 w-5 text-muted-foreground" />}
                  {!claimed && (
                    <div className="text-xs text-muted-foreground border border-dashed border-border rounded-lg px-2 py-1">
                      Registrar
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {claimTarget && (
        <ClaimAchievementDialog
          achievement={claimTarget}
          onClose={() => setClaimTarget(null)}
        />
      )}
    </div>
  );
}
