import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@lifebadges.app";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Redefinir sua senha — LifeBadges",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:48px;">🏆</span>
          <h1 style="color:#f59e0b;font-size:24px;margin:8px 0 0;">LifeBadges</h1>
        </div>
        <h2 style="font-size:20px;color:#111;">Olá, ${name}!</h2>
        <p style="color:#555;line-height:1.6;">
          Recebemos uma solicitação para redefinir a senha da sua conta.
          Clique no botão abaixo para criar uma nova senha.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;background:#f59e0b;color:#fff;font-weight:700;
                    text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;">
            Redefinir senha
          </a>
        </div>
        <p style="color:#888;font-size:13px;">
          Este link expira em 1 hora. Se você não solicitou isso, ignore este email — sua conta está segura.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;text-align:center;">
          LifeBadges · Suas conquistas merecem um troféu.
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bem-vindo ao LifeBadges! 🏆",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:48px;">🏆</span>
          <h1 style="color:#f59e0b;font-size:24px;margin:8px 0 0;">LifeBadges</h1>
        </div>
        <h2 style="font-size:20px;color:#111;">Olá, ${name}! Seja bem-vindo!</h2>
        <p style="color:#555;line-height:1.6;">
          Sua conta foi criada com sucesso. Agora você pode começar a registrar suas conquistas,
          convidar amigos para validar e colecionar troféus incríveis da sua vida!
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${APP_URL}/feed"
             style="display:inline-block;background:#f59e0b;color:#fff;font-weight:700;
                    text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;">
            Começar agora 🚀
          </a>
        </div>
      </div>
    `,
  });
}
