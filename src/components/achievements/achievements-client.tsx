"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Lock, CheckCircle, Clock, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClaimAchievementDialog } from "@/components/achievements/claim-dialog";
import { rarityConfig, categoryConfig, VALIDATION_THRESHOLD } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
  const [selectedPackId, setSelectedPackId] = useState<string>(packs[0]?.id ?? "");
  const [claimTarget, setClaimTarget] = useState<Achievement | null>(null);

  const selectedPack = packs.find((p) => p.id === selectedPackId);
  const isUnlocked = selectedPack ? unlockedPackIds.has(selectedPack.id) : false;

  const earnedCount = selectedPack?.achievements.filter(
    (a) => claimedMap.get(a.id)?.status === "EARNED"
  ).length ?? 0;
  const totalCount = selectedPack?.achievements.length ?? 0;

  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black">Conquistas</h1>
        <Link href="/marketplace">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ShoppingBag className="h-4 w-4" /> Loja
          </Button>
        </Link>
      </div>

      {/* Pack tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {packs.map((pack) => (
          <button
            key={pack.id}
            onClick={() => setSelectedPackId(pack.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border",
              selectedPackId === pack.id
                ? "border-transparent text-white shadow-sm"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
              !unlockedPackIds.has(pack.id) && "opacity-60"
            )}
            style={
              selectedPackId === pack.id
                ? { backgroundColor: pack.color }
                : {}
            }
          >
            {pack.icon} {pack.name}
            {!unlockedPackIds.has(pack.id) && <Lock className="h-3 w-3" />}
          </button>
        ))}
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

      {/* Locked pack */}
      {selectedPack && !isUnlocked && (
        <div className="text-center py-6 space-y-3">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="font-semibold">Pack bloqueado</p>
          <p className="text-sm text-muted-foreground">
            Adquira este pack na loja para desbloquear as conquistas.
          </p>
          <Link href="/marketplace">
            <Button variant="gold" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Ver na loja · R$ {selectedPack.price.toFixed(2).replace(".", ",")}
            </Button>
          </Link>
        </div>
      )}

      {/* Achievement grid */}
      {selectedPack && isUnlocked && (
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
                    ? "border-amber-200 bg-amber-50"
                    : isPending
                    ? "border-blue-200 bg-blue-50"
                    : "border-border bg-card hover:bg-accent cursor-pointer"
                )}
                onClick={() => {
                  if (!claimed) setClaimTarget(achievement);
                }}
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative",
                    isEarned ? "animate-trophy-glow" : ""
                  )}
                  style={{
                    backgroundColor: isEarned
                      ? "#fef3c7"
                      : `${selectedPack.color}20`,
                  }}
                >
                  {achievement.icon}
                  {isEarned && (
                    <span className="absolute -top-1 -right-1 text-base">🏆</span>
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
                      <p className="text-[10px] text-blue-600 font-medium">
                        {claimed?.validates}/{VALIDATION_THRESHOLD} validações
                      </p>
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {isEarned && <CheckCircle className="h-5 w-5 text-amber-500" />}
                  {isPending && <Clock className="h-5 w-5 text-blue-500" />}
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
