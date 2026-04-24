"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShoppingBag, CheckCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  justPurchasedPackId: string | null;
  canceled: boolean;
}

export function MarketplaceClient({ packs, purchasedPackIds, justPurchasedPackId, canceled }: Props) {
  const router = useRouter();
  const [expandedPack, setExpandedPack] = useState<string | null>(justPurchasedPackId);
  const [isPending, startTransition] = useTransition();
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Handle post-Stripe redirect feedback and auto-refresh
  useEffect(() => {
    if (justPurchasedPackId) {
      // Pack already confirmed (webhook already fired before redirect)
      if (purchasedPackIds.has(justPurchasedPackId)) {
        toast.success("Pack desbloqueado! Suas conquistas estão disponíveis. 🎉");
        router.replace("/marketplace");
        return;
      }

      // Webhook not yet fired — show confirming state and poll with refresh
      setConfirming(true);
      toast.loading("Confirmando pagamento…", { id: "confirming" });

      let attempts = 0;
      const maxAttempts = 8;

      const interval = setInterval(() => {
        attempts++;
        router.refresh();

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.dismiss("confirming");
          setConfirming(false);
          toast.success("Pagamento recebido! O pack será desbloqueado em instantes.", { duration: 6000 });
          router.replace("/marketplace");
        }
      }, 2000);

      return () => clearInterval(interval);
    }

    if (canceled) {
      toast.error("Pagamento cancelado. Tente novamente quando quiser.");
      router.replace("/marketplace");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect when the refresh brings the purchased pack in
  useEffect(() => {
    if (confirming && justPurchasedPackId && purchasedPackIds.has(justPurchasedPackId)) {
      toast.dismiss("confirming");
      setConfirming(false);
      toast.success("Pack desbloqueado! Suas conquistas estão disponíveis. 🎉");
      router.replace("/marketplace");
    }
  }, [confirming, justPurchasedPackId, purchasedPackIds, router]);

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

      {/* Confirming banner */}
      {confirming && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-neon/30 bg-neon/5">
          <Loader2 className="h-5 w-5 text-neon animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-neon">Confirmando seu pagamento…</p>
            <p className="text-xs text-muted-foreground">Aguarde enquanto processamos. Isso leva alguns segundos.</p>
          </div>
        </div>
      )}

      {packs.map((pack) => {
        const isPurchased = purchasedPackIds.has(pack.id);
        const isExpanded  = expandedPack === pack.id;
        const isJustBought = justPurchasedPackId === pack.id;

        return (
          <Card
            key={pack.id}
            className={cn(
              "overflow-hidden transition-all",
              isPurchased && "border-green-500/30",
              isJustBought && confirming && "border-neon/40 ring-1 ring-neon/20"
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

              {/* Achievement preview toggle */}
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
