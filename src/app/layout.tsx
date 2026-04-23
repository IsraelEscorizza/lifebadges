import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "LifeBadges", template: "%s | LifeBadges" },
  description: "Conquiste troféus pelas suas realizações na vida real. Valide com amigos e colecione suas conquistas.",
  keywords: ["troféus", "conquistas", "rede social", "gamificação", "lifebadges"],
  openGraph: {
    title: "LifeBadges",
    description: "Conquiste troféus pelas suas realizações na vida real.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
