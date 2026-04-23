"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success — prevents email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="shadow-lg">
        <CardContent className="pt-8 text-center space-y-4">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold">Email enviado!</h2>
          <p className="text-muted-foreground text-sm">
            Se uma conta com <strong>{email}</strong> existir, você receberá um link para redefinir sua senha.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full mt-2">
              <ArrowLeft className="h-4 w-4" /> Voltar para o login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-black">Recuperar senha</CardTitle>
        <CardDescription>
          Digite seu email e enviaremos um link para redefinir sua senha.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            leftIcon={<Mail className="h-4 w-4" />}
            autoFocus
          />
          <Button type="submit" className="w-full" variant="gold" loading={loading}>
            Enviar link de recuperação
          </Button>
        </form>
        <Link href="/login">
          <Button variant="ghost" className="w-full text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar para o login
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
