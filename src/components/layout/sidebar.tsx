"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, Trophy, Users, ShoppingBag,
  Bell, Settings, User as UserIcon, LogOut, UsersRound, Gem,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

const navItems = [
  { href: "/feed",          label: "Feed",         icon: Home },
  { href: "/achievements",  label: "Conquistas",   icon: Trophy },
  { href: "/friends",       label: "Amigos",       icon: Users },
  { href: "/groups",        label: "Grupos",       icon: UsersRound },
  { href: "/marketplace",   label: "Loja",         icon: ShoppingBag },
  { href: "/notifications", label: "Notificações", icon: Bell },
];

interface SidebarProps {
  user: Session["user"];
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const initials = user?.name
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-black border-r border-white/8 z-40">
      {/* Logo */}
      <div className="px-5 py-6">
        <Link href="/feed" className="flex items-center gap-2.5 font-black text-xl text-neon">
          <Gem className="h-6 w-6 flex-shrink-0" strokeWidth={1.5} />
          <span>LifeBadges</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-neon/10 text-neon"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0")} strokeWidth={active ? 2 : 1.5} />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/8 p-3 space-y-0.5">
        <Link
          href={`/profile/${user?.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <UserIcon className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
          Meu Perfil
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Settings className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
          Configurações
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
          Sair
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3 mt-1 border-t border-white/8">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
            <AvatarFallback className="text-xs bg-neon/10 text-neon">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
