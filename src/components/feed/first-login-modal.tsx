"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trophy, Gift, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pack {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface FirstLoginModalProps {
  packs: Pack[];
}

export function FirstLoginModal({ packs }: FirstLoginModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "pick-pack" | "done">("welcome");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function claimPack() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/claim-free-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: selected }),
      });
      if (!res.ok) throw new Error();
      setStep("done");
    } catch {
      toast.error("Erro ao resgatar o pacote. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function finish() {
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-neon/30 rounded-2xl w-full max-w-md shadow-2xl shadow-neon/10 overflow-hidden">

        {step === "welcome" && (
          <div className="p-8 text-center space-y-5">
            <div className="text-7xl animate-bounce">🎉</div>
            <h2 className="text-2xl font-black text-white">
              Bem-vindo ao LifeBadges!
            </h2>
            <p className="text-white/70 leading-relaxed">
              Você acabou de ganhar seu primeiro troféu —{" "}
              <span className="text-neon font-semibold">Bem-vindo ao LifeBadges!</span>
            </p>
            <div className="bg-neon/10 border border-neon/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-left">
                <Trophy className="h-5 w-5 text-neon flex-shrink-0" />
                <p className="text-sm text-white/80">Registre suas conquistas da vida real</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Star className="h-5 w-5 text-neon flex-shrink-0" />
                <p className="text-sm text-white/80">Peça para amigos validarem — 5 validações = troféu!</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Zap className="h-5 w-5 text-neon flex-shrink-0" />
                <p className="text-sm text-white/80">Colecione conquistas e mostre sua jornada</p>
              </div>
            </div>
            <div className="bg-secondary border border-neon/20 rounded-xl p-4 flex items-center gap-3">
              <Gift className="h-6 w-6 text-neon flex-shrink-0" />
              <p className="text-sm text-white/80 text-left">
                <span className="text-neon font-bold">Presente de boas-vindas:</span> escolha um pacote de conquistas grátis!
              </p>
            </div>
            <Button
              className="w-full bg-neon text-black font-black hover:bg-neon-300 neon-glow"
              onClick={() => setStep("pick-pack")}
            >
              Escolher meu pacote grátis 🎁
            </Button>
          </div>
        )}

        {step === "pick-pack" && (
          <div className="p-8 space-y-5">
            <div className="text-center">
              <div className="text-4xl mb-2">🎁</div>
              <h2 className="text-xl font-black text-white">Escolha seu pacote grátis</h2>
              <p className="text-white/60 text-sm mt-1">Você pode comprar os outros depois por R$9,90 cada</p>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {packs.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => setSelected(pack.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    selected === pack.id
                      ? "border-neon bg-neon/10 shadow-sm shadow-neon/20"
                      : "border-border bg-secondary hover:border-neon/50"
                  }`}
                >
                  <span className="text-3xl">{pack.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{pack.name}</p>
                    <p className="text-white/50 text-xs">{pack.description}</p>
                  </div>
                  {selected === pack.id && (
                    <span className="ml-auto text-neon text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("welcome")}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 bg-neon text-black font-black hover:bg-neon-300 neon-glow"
                disabled={!selected || loading}
                onClick={claimPack}
              >
                {loading ? "Resgatando..." : "Resgatar grátis!"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 text-center space-y-5">
            <div className="text-7xl">🏆</div>
            <h2 className="text-2xl font-black text-white">Pacote resgatado!</h2>
            <p className="text-white/70 leading-relaxed">
              Agora explore suas conquistas, registre a próxima e peça para amigos validarem.
              Cada troféu conta a história da sua vida!
            </p>
            <div className="bg-neon/10 border border-neon/20 rounded-xl p-4 text-neon font-semibold text-sm">
              💡 Dica: quanto mais conquistas você registrar, mais sua história ganha vida!
            </div>
            <Button
              className="w-full bg-neon text-black font-black hover:bg-neon-300 neon-glow"
              onClick={finish}
            >
              Começar a conquistar! 🚀
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
