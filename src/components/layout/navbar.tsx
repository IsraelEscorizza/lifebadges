"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

interface NavbarProps {
  user: Session["user"];
}

export function Navbar({ user }: NavbarProps) {
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border h-14">
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2 font-black text-lg text-amber-500">
          <span className="text-2xl">🏆</span>
          <span className="hidden sm:block">LifeBadges</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/notifications">
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                  <AvatarFallback className="text-xs bg-amber-100 text-amber-700">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[180px] bg-card border border-border rounded-xl shadow-lg p-1 animate-in fade-in-0 zoom-in-95"
                align="end"
                sideOffset={8}
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="font-semibold text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenu.Item asChild>
                  <Link href={`/profile/${user?.id}`} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent cursor-pointer outline-none">
                    <UserIcon className="h-4 w-4" /> Meu Perfil
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent cursor-pointer outline-none">
                    <Settings className="h-4 w-4" /> Configurações
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive cursor-pointer outline-none"
                  onSelect={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
