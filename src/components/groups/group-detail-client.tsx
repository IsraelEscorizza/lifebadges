"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Crown, Users, UserPlus, Trophy, Medal,
  LogOut, Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  role: string;
  earned: number;
  recentTrophies: string[];
}

interface PendingInvite {
  id: string;
  invited: { id: string; name: string | null; image: string | null };
}

interface InvitableFriend {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  ownerId: string;
  maxMembers: number;
  memberCount: number;
}

interface Props {
  group: GroupInfo;
  leaderboard: LeaderboardEntry[];
  pendingInvites: PendingInvite[];
  invitableFriends: InvitableFriend[];
  currentUserId: string;
  currentUserRole: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function GroupDetailClient({
  group,
  leaderboard,
  pendingInvites,
  invitableFriends,
  currentUserId,
  currentUserRole,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"ranking" | "membros" | "convidar">("ranking");
  const [search, setSearch] = useState("");
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [leavingLoading, setLeavingLoading] = useState(false);
  const isOwner = currentUserRole === "OWNER";
  const spotsLeft = group.maxMembers - group.memberCount;

  async function invite(friendId: string) {
    setInvitingId(friendId);
    try {
      const res = await fetch(`/api/groups/${group.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitedId: friendId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erro");
      toast.success("Convite enviado!");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao convidar.");
    } finally {
      setInvitingId(null);
    }
  }

  async function leaveGroup() {
    if (!confirm("Tem certeza que quer sair do grupo?")) return;
    setLeavingLoading(true);
    try {
      const res = await fetch(`/api/groups/${group.id}/leave`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      toast.success("Você saiu do grupo.");
      router.push("/groups");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao sair.");
      setLeavingLoading(false);
    }
  }

  const filteredFriends = invitableFriends.filter(
    (f) =>
      !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.username?.toLowerCase().includes(search.toLowerCase())
  );

  const alreadyInvitedIds = new Set(pendingInvites.map((inv) => inv.invited.id));

  return (
    <div className="pt-4 space-y-4 pb-6">
      <BackButton href="/groups" />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="text-5xl w-16 h-16 flex items-center justify-center bg-neon/10 rounded-2xl flex-shrink-0">
          {group.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black leading-tight">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{group.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {group.memberCount}/{group.maxMembers} membros
            </span>
            {spotsLeft > 0 && (
              <span className="text-neon font-medium">{spotsLeft} vaga{spotsLeft !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        {!isOwner && (
          <Button
            size="sm"
            variant="outline"
            className="text-red-400 border-red-400/30 hover:bg-red-400/10 flex-shrink-0"
            disabled={leavingLoading}
            onClick={leaveGroup}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sair
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        {(["ranking", "membros", "convidar"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors",
              tab === t ? "bg-neon text-black" : "text-white/60 hover:text-white"
            )}
          >
            {t === "ranking" ? "🏆 Ranking" : t === "membros" ? "👥 Membros" : "➕ Convidar"}
          </button>
        ))}
      </div>

      {/* Ranking tab */}
      {tab === "ranking" && (
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Nenhum troféu ainda. Comecem a conquistar!
            </p>
          ) : (
            leaderboard.map((entry, i) => {
              const isSelf = entry.id === currentUserId;
              return (
                <Link key={entry.id} href={`/profile/${entry.id}`} className="block group">
                  <Card
                    className={cn(
                      "transition-colors group-hover:border-border/80",
                      i === 0 && "border-yellow-500/40 bg-yellow-500/5",
                      i === 1 && "border-gray-400/40",
                      i === 2 && "border-amber-600/40",
                      isSelf && "border-neon/30"
                    )}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      {/* Position */}
                      <div className="w-8 text-center flex-shrink-0">
                        {i < 3 ? (
                          <span className="text-xl">{MEDALS[i]}</span>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{i + 1}º</span>
                        )}
                      </div>

                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={entry.image ?? ""} alt={entry.name ?? ""} />
                        <AvatarFallback className="text-xs bg-neon/10 text-neon">
                          {entry.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm truncate">
                            {entry.name ?? entry.username ?? "Usuário"}
                          </span>
                          {entry.role === "OWNER" && (
                            <Crown className="h-3.5 w-3.5 text-neon flex-shrink-0" />
                          )}
                          {isSelf && (
                            <span className="text-[10px] font-bold text-neon bg-neon/10 px-1.5 py-0.5 rounded-full">você</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {entry.recentTrophies.map((icon, j) => (
                            <span key={j} className="text-xs">{icon}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Trophy className="h-4 w-4 text-neon" />
                        <span className="font-black text-sm text-neon">{entry.earned}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Members tab */}
      {tab === "membros" && (
        <div className="space-y-2">
          {leaderboard.map((member) => (
            <Link key={member.id} href={`/profile/${member.id}`} className="block group">
              <Card className="transition-colors group-hover:border-border/80">
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={member.image ?? ""} />
                    <AvatarFallback className="text-xs bg-neon/10 text-neon">
                      {member.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate">{member.name ?? member.username}</span>
                      {member.role === "OWNER" && <Crown className="h-3.5 w-3.5 text-neon flex-shrink-0" />}
                    </div>
                    {member.username && (
                      <p className="text-xs text-muted-foreground">@{member.username}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5" />
                    {member.earned}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Pending invites */}
          {pendingInvites.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Convites pendentes
              </p>
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={inv.invited.image ?? ""} />
                    <AvatarFallback className="text-xs bg-secondary">
                      {inv.invited.name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground flex-1">{inv.invited.name}</span>
                  <span className="text-xs text-yellow-500/80 font-medium">Pendente</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite tab */}
      {tab === "convidar" && (
        <div className="space-y-3">
          {spotsLeft === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Users className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Grupo cheio — máximo de {group.maxMembers} membros atingido.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {spotsLeft} vaga{spotsLeft !== 1 ? "s" : ""} disponível{spotsLeft !== 1 ? "veis" : ""}
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar amigos..."
                  className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-neon/60 transition-colors"
                />
              </div>

              {filteredFriends.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-6">
                  {invitableFriends.length === 0
                    ? "Adicione amigos primeiro para poder convidá-los."
                    : "Nenhum amigo encontrado."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => {
                    const alreadyInvited = alreadyInvitedIds.has(friend.id);
                    return (
                      <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.image ?? ""} />
                          <AvatarFallback className="text-xs bg-neon/10 text-neon">
                            {friend.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{friend.name}</p>
                          {friend.username && (
                            <p className="text-xs text-muted-foreground">@{friend.username}</p>
                          )}
                        </div>
                        {alreadyInvited ? (
                          <span className="text-xs text-yellow-500/80 font-medium flex-shrink-0">Convidado</span>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-neon text-black font-bold hover:bg-neon-300 flex-shrink-0"
                            disabled={invitingId === friend.id}
                            onClick={() => invite(friend.id)}
                          >
                            <UserPlus className="h-3.5 w-3.5 mr-1" />
                            {invitingId === friend.id ? "..." : "Convidar"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
