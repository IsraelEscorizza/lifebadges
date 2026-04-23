import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-neon/80 via-neon to-neon-300 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl animate-bounce">🏆</div>
        <h1 className="text-5xl font-black tracking-tight">LifeBadges</h1>
        <p className="text-xl font-medium opacity-90">
          Suas conquistas da vida real merecem um troféu de verdade.
        </p>
        <p className="opacity-80 text-sm leading-relaxed">
          Forme-se, tire a carta, compre sua casa, corra uma maratona — registre tudo e
          deixe seus amigos validarem. Com 5 validações, você ganha o troféu!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-white text-neon-500 hover:bg-secondary font-black w-full sm:w-auto">
              Começar grátis 🚀
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 w-full sm:w-auto">
              Entrar
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 text-4xl pt-4">
          {["🎓", "💼", "🚗", "🏠", "✈️", "💪"].map((emoji, i) => (
            <div key={i} className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
