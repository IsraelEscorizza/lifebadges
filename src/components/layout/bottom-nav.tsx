"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Users, ShoppingBag, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/feed",         label: "Feed",     icon: Home },
  { href: "/achievements", label: "Troféus",  icon: Trophy },
  { href: "/groups",       label: "Grupos",   icon: UsersRound },
  { href: "/friends",      label: "Amigos",   icon: Users },
  { href: "/marketplace",  label: "Loja",     icon: ShoppingBag },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-colors",
                active ? "text-neon" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
