"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ValidationButtonsProps {
  userAchievementId: string;
  myVote: string | null;
}

export function ValidationButtons({ userAchievementId, myVote: initialVote }: ValidationButtonsProps) {
  const [myVote, setMyVote] = useState(initialVote);
  const [isPending, startTransition] = useTransition();

  async function vote(type: "VALIDATE" | "CONTEST") {
    // Optimistic update
    setMyVote(type);

    startTransition(async () => {
      try {
        const res = await fetch("/api/achievements/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAchievementId, type }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.message ?? "Erro ao registrar voto.");
          setMyVote(initialVote);
          return;
        }

        if (type === "VALIDATE") toast.success("Conquista validada! ✅");
        else toast("Conquista contestada.", { icon: "⚠️" });
      } catch {
        toast.error("Erro de conexão. Tente novamente.");
        setMyVote(initialVote);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex-1 gap-1.5 transition-all",
          myVote === "VALIDATE" && "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
        )}
        onClick={() => vote("VALIDATE")}
        disabled={isPending || myVote !== null}
      >
        <ThumbsUp className="h-4 w-4" />
        {myVote === "VALIDATE" ? "Validado" : "Validar"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex-1 gap-1.5 transition-all",
          myVote === "CONTEST" && "bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
        )}
        onClick={() => vote("CONTEST")}
        disabled={isPending || myVote !== null}
      >
        <ThumbsDown className="h-4 w-4" />
        {myVote === "CONTEST" ? "Contestado" : "Contestar"}
      </Button>
    </div>
  );
}
