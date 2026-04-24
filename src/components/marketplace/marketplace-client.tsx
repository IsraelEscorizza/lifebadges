"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { ShoppingBag, CheckCircle, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rarityConfig } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  icon: string;
  rarity: string;
}

interface Pack {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  price: number;
  achievements: Achievement[];
}

interface Props {
  packs: Pack[];
  purchasedPackIds: Set<string>;
}

export function MarketplaceClient({ packs, purchasedPackIds }: Props) {
  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  function handlePurchase(packId: string) {
    setLoadingPackId(packId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/marketplace/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packId }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message ?? "Erro ao iniciar pagamento.");
          return;
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } catch {
        toast.error("Erro de conexão. Tente novamente.");
      } finally {
        setLoadingPackId(null);
      }
    });
  }

  if (packs.length === 0) {
    return (
      <div className="pt-4 text-center py-12 space-y-3">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">Nenhum pack disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-4">
      <BackButton href="/feed" />
      <div>
        <h1 className="text-xl font-black">Loja de Packs</h1>
        <p className="text-sm text-muted-foreground">Desbloqueie novos conjuntos de conquistas</p>
      </div>

      {packs.map((pack) => {
        const isPurchased = purchasedPackIds.has(pack.id);
        const isExpanded = expandedPack === pack.id;

        return (
          <Card
            key={pack.id}
            className={cn(
              "overflow-hidden transition-all",
              isPurchased && "border-green-200"
            )}
          >
            {/* Pack banner */}
            <div
              className="h-20 flex items-center justify-between px-5"
              style={{ backgroundColor: pack.color }}
            >
              <div className="text-white">
                <h2 className="text-xl font-black">{pack.icon} {pack.name}</h2>
                <p className="text-sm opacity-80">{pack.achievements.length} conquistas</p>
              </div>
              {isPurchased && (
                <div className="bg-white/20 rounded-full px-3 py-1 flex items-center gap-1.5 text-white text-sm font-semibold">
                  <CheckCircle className="h-4 w-4" /> Desbloqueado
                </div>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">{pack.description}</p>

              {/* Achievement preview */}
              <button
                className="flex items-center justify-between w-full text-sm font-semibold"
                onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
              >
                <span>Ver conquistas</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isExpanded && (
                <div className="grid grid-cols-2 gap-2">
                  {pack.achievements.map((ach) => {
                    const rarity = rarityConfig[ach.rarity as keyof typeof rarityConfig];
                    // Show name + icon for COMMON and UNCOMMON even when locked
                    const isVisible = isPurchased || ach.rarity === "COMMON" || ach.rarity === "UNCOMMON";
                    return (
                      <div
                        key={ach.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border",
                          isPurchased
                            ? "bg-background"
                            : isVisible
                            ? "bg-secondary border-white/10"
                            : "opacity-50 bg-secondary"
                        )}
                      >
                        <span className="text-xl">{isVisible ? ach.icon : "🔒"}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">
                            {isVisible ? ach.name : "???"}
                          </p>
                          <Badge
                            variant={ach.rarity.toLowerCase() as "common" | "uncommon" | "rare" | "epic" | "legendary"}
                            className="text-[9px] px-1 py-0 mt-0.5"
                          >
                            {rarity.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isPurchased && (
                <Button
                  variant="neon"
                  className="w-full gap-2"
                  onClick={() => handlePurchase(pack.id)}
                  loading={loadingPackId === pack.id && isPending}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Comprar por R$ {pack.price.toFixed(2).replace(".", ",")}
                </Button>
              )}

              {isPurchased && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-semibold py-2">
                  <CheckCircle className="h-4 w-4" />
                  Pack adquirido — conquistas disponíveis!
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
