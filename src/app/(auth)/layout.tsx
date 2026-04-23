import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neon/80 via-neon to-neon-300 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 text-center text-white">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">LifeBadges</h1>
          <p className="text-xl font-medium opacity-90 max-w-sm">
            Suas conquistas da vida real merecem um troféu de verdade.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-4xl">
            {["🎓", "💼", "🚗", "🏠", "✈️", "💍"].map((emoji, i) => (
              <div
                key={i}
                className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm hover:scale-110 transition-transform cursor-default"
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🏆</span>
            <h1 className="text-3xl font-black text-neon mt-2">LifeBadges</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
