"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home, Trophy, UsersRound, Users,
  ShoppingBag, Bell, Settings, LogOut, X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const mainItems = [
  { href: "/feed",         label: "Feed",    icon: Home },
  { href: "/achievements", label: "Troféus", icon: Trophy },
  { href: "/groups",       label: "Grupos",  icon: UsersRound },
  { href: "/friends",      label: "Amigos",  icon: Users },
];

const menuItems = [
  { href: "/marketplace",  label: "Loja",         icon: ShoppingBag },
  { href: "/notifications",label: "Notificações",  icon: Bell },
  { href: "/settings",     label: "Configurações", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const user = session?.user;
  const initials =
    user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {mainItems.map(({ href, label, icon: Icon }) => {
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

          {/* User / "Eu" button */}
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-colors",
              open ? "text-neon" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
              <AvatarFallback className="text-[9px] bg-secondary">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium">Eu</span>
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-up menu sheet */}
      <div
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Link href={`/profile/${user?.id}`} onClick={() => setOpen(false)}>
            <Avatar className="h-11 w-11">
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
              <AvatarFallback className="bg-neon/10 text-neon text-sm">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile link */}
        <div className="px-3 pt-2">
          <Link
            href={`/profile/${user?.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? ""} />
              <AvatarFallback className="bg-neon/10 text-neon text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold">Meu Perfil</span>
          </Link>

          {/* Other nav items */}
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/5 transition-colors mt-1 mb-1"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-sm font-medium text-red-400">Sair</span>
          </button>
        </div>

        {/* Safe area padding */}
        <div className="h-6" />
      </div>
    </>
  );
}
