"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { registerSchema } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.field) setErrors({ [data.field]: data.message });
        else toast.error(data.message ?? "Erro ao criar conta.");
        return;
      }

      // Auto login after register
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      toast.success("Conta criada! Bem-vindo ao LifeBadges 🏆");
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "facebook") {
    setLoadingSocial(provider);
    try {
      await signIn(provider, { callbackUrl: "/onboarding" });
    } catch {
      toast.error("Erro ao conectar. Tente novamente.");
      setLoadingSocial(null);
    }
  }

  return (
    <div className="space-y-3">
      <Link href="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors group">
        <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span> Fazer login
      </Link>
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-black">Crie sua conta</CardTitle>
        <CardDescription>Grátis para sempre. Comece a colecionar conquistas!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            variant="social"
            className="w-full"
            onClick={() => handleSocialLogin("google")}
            loading={loadingSocial === "google"}
            disabled={!!loadingSocial || loading}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Cadastrar com Google
          </Button>
          <Button
            variant="social"
            className="w-full"
            onClick={() => handleSocialLogin("facebook")}
            loading={loadingSocial === "facebook"}
            disabled={!!loadingSocial || loading}
          >
            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Cadastrar com Facebook
          </Button>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            ou crie com email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
            leftIcon={<User className="h-4 w-4" />}
            autoComplete="name"
            autoFocus
          />
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
          />
          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            autoComplete="new-password"
          />
          <Input
            label="Confirmar senha"
            type={showPassword ? "text" : "password"}
            placeholder="Repita a senha"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
          />

          <p className="text-xs text-muted-foreground text-center">
            Ao criar conta você concorda com os{" "}
            <Link href="/terms" className="text-primary hover:underline">Termos de Uso</Link>{" "}
            e a{" "}
            <Link href="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>.
          </p>

          <Button type="submit" className="w-full" variant="neon" loading={loading} disabled={!!loadingSocial}>
            Criar conta grátis 🏆
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
    </div>
  );
}
