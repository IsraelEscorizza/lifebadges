"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isPending, startTransition] = useTransition();
  const [usernameError, setUsernameError] = useState("");

  function handleFinish() {
    startTransition(async () => {
      if (!username.trim()) {
        setUsernameError("Escolha um nome de usuário.");
        return;
      }
      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        setUsernameError("Use apenas letras minúsculas, números e _ (3–20 caracteres).");
        return;
      }

      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.field === "username") setUsernameError(data.message);
        else toast.error(data.message ?? "Erro ao salvar perfil.");
        return;
      }

      await update();
      toast.success("Perfil configurado! Bem-vindo ao LifeBadges 🏆");
      router.push("/feed");
    });
  }

  const steps = [
    {
      icon: "🏆",
      title: "Bem-vindo ao LifeBadges!",
      description: "Aqui você registra as conquistas da sua vida real e coleciona troféus validados pelos seus amigos.",
    },
    {
      icon: "👥",
      title: "Como funciona?",
      description: "Registre uma conquista → Seus amigos validam → Com 5 validações, você ganha o troféu! Qualquer amigo pode contestar se achar que não é verdade.",
    },
    {
      icon: "👤",
      title: "Configure seu perfil",
      description: "Escolha um nome de usuário para seus amigos te encontrarem.",
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Progress */}
        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-neon" : "bg-secondary"}`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="text-6xl">{currentStep.icon}</div>
          <h1 className="text-2xl font-black">{currentStep.title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{currentStep.description}</p>

          {step === 2 && (
            <div className="space-y-3 text-left">
              <Input
                label="Nome de usuário"
                placeholder="ex: joaosilva123"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                  setUsernameError("");
                }}
                error={usernameError}
                maxLength={20}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium">Bio (opcional)</label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background p-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={2}
                  placeholder="Conte um pouco sobre você..."
                  maxLength={280}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {step < 2 ? (
            <Button variant="neon" className="w-full gap-2" onClick={() => setStep((s) => s + 1)}>
              Próximo <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="neon" className="w-full gap-2" onClick={handleFinish} loading={isPending}>
              <Trophy className="h-4 w-4" /> Começar a colecionar!
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
