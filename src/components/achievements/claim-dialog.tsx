"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { rarityConfig } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
}

interface ClaimAchievementDialogProps {
  achievement: Achievement;
  onClose: () => void;
}

export function ClaimAchievementDialog({ achievement, onClose }: ClaimAchievementDialogProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const rarity = rarityConfig[achievement.rarity as keyof typeof rarityConfig];

  function handleClaim() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/achievements/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ achievementId: achievement.id, note: note.trim() || undefined }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message ?? "Erro ao registrar conquista.");
          return;
        }

        toast.success("Conquista registrada! Peça para seus amigos validarem 🎉");
        onClose();
        router.refresh();
      } catch {
        toast.error("Erro de conexão. Tente novamente.");
      }
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-black">Registrar conquista</DialogTitle>
          <DialogDescription className="text-center">
            Seus amigos precisarão validar para você ganhar o troféu.
          </DialogDescription>
        </DialogHeader>

        <div className="text-center py-4 space-y-3">
          <div className="text-6xl mx-auto">{achievement.icon}</div>
          <div>
            <p className="font-bold text-lg">{achievement.name}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>
          <Badge variant={achievement.rarity.toLowerCase() as "common" | "uncommon" | "rare" | "epic" | "legendary"}>
            {rarity.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mensagem (opcional)</label>
          <textarea
            className="w-full rounded-lg border border-input bg-background p-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={3}
            placeholder="Conte um pouco sobre essa conquista..."
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <p className="text-right text-xs text-muted-foreground">{note.length}/500</p>
        </div>

        <div className="bg-secondary border border-neon/30 rounded-lg p-3 text-sm text-neon-600">
          <strong>Como funciona:</strong> Você precisa de <strong>5 validações</strong> de amigos para receber o troféu.
          Qualquer um do seu círculo pode contestar se achar que não é verdade.
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="neon" className="flex-1" onClick={handleClaim} loading={isPending}>
            Registrar 🏆
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
