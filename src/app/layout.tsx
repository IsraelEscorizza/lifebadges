import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

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

// Anti-FOUT: runs before React hydration to set the theme from localStorage
const themeScript = `(function(){try{var t=localStorage.getItem('lb-theme');if(t&&t!=='dark-neon')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <ToastProvider />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
