"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Save, User, Lock, Shield, Palette, Check } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme, THEMES, type Theme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

interface Props {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    image: string | null;
    isPrivate: boolean;
    email: string;
  };
}

export function SettingsClient({ user }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();

  const [form, setForm] = useState({
    name: user.name ?? "",
    username: user.username ?? "",
    bio: user.bio ?? "",
    isPrivate: user.isPrivate,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleSave() {
    startTransition(async () => {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.field) setErrors({ [data.field]: data.message });
        else toast.error(data.message ?? "Erro ao salvar.");
        return;
      }

      await update({ name: form.name });
      toast.success("Perfil atualizado!");
      router.refresh();
    });
  }

  return (
    <div className="pt-4 space-y-5">
      <BackButton href="/feed" />
      <h1 className="text-xl font-black">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome completo"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
            maxLength={60}
          />
          <Input
            label="Nome de usuário"
            value={form.username}
            onChange={(e) => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            error={errors.username}
            maxLength={20}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              className="w-full rounded-lg border border-input bg-background p-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
              maxLength={280}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Conte um pouco sobre você..."
            />
            <p className="text-right text-xs text-muted-foreground">{form.bio.length}/280</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" /> Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium">Conta privada</p>
              <p className="text-xs text-muted-foreground">Apenas amigos veem suas conquistas</p>
            </div>
            <button
              role="switch"
              aria-checked={form.isPrivate}
              onClick={() => set("isPrivate", !form.isPrivate)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.isPrivate ? "bg-neon" : "bg-secondary border border-border"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isPrivate ? "translate-x-5" : ""}`}
              />
            </button>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" /> Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Email: <strong>{user.email}</strong></p>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Para alterar sua senha, use a opção "Esqueceu a senha?" na tela de login.
          </p>
        </CardContent>
      </Card>

      {/* Theme selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" strokeWidth={1.5} /> Aparência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Escolha o tema de cores do app</p>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as Theme)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all",
                  theme === t.id
                    ? "border-neon bg-neon/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                {/* Color preview */}
                <div
                  className="w-8 h-8 rounded-full relative flex items-center justify-center"
                  style={{ backgroundColor: t.bg, border: `2px solid ${t.primary}` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primary }} />
                  {theme === t.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5" style={{ color: t.primary }} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-medium text-center leading-tight text-muted-foreground group-hover:text-foreground transition-colors">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button variant="neon" className="w-full gap-2" onClick={handleSave} loading={isPending}>
        <Save className="h-4 w-4" strokeWidth={1.5} /> Salvar alterações
      </Button>
    </div>
  );
}
