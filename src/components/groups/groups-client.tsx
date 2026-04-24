"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Users, Plus, Crown, ChevronRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const ICONS = ["🏆", "⚽", "🎮", "🎵", "📚", "💪", "🚀", "🎨", "🌍", "🏋️", "🎯", "🔥"];

interface Group {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  ownerId: string;
  maxMembers: number;
  role: string;
  memberCount: number;
}

interface PendingInvite {
  id: string;
  groupId: string;
  group: { id: string; name: string; icon: string; description: string | null };
  inviter: { id: string; name: string | null; image: string | null };
}

interface Props {
  groups: Group[];
  pendingInvites: PendingInvite[];
}

export function GroupsClient({ groups, pendingInvites }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="pt-4 space-y-5 pb-6">
      <BackButton href="/feed" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Grupos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Compita com amigos em grupos fechados</p>
        </div>
        <Button
          size="sm"
          className="bg-neon text-black font-bold hover:bg-neon-300 gap-1.5"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4" /> Criar grupo
        </Button>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wide">Convites pendentes</h2>
          {pendingInvites.map((inv) => (
            <InviteCard key={inv.id} invite={inv} onRespond={() => router.refresh()} />
          ))}
        </div>
      )}

      {/* Groups list */}
      {groups.length === 0 && pendingInvites.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-5xl">👥</div>
          <h2 className="font-bold text-lg">Nenhum grupo ainda</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Crie um grupo e convide até 10 amigos para competirem juntos!
          </p>
          <Button
            className="bg-neon text-black font-bold hover:bg-neon-300 mt-2"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Criar meu primeiro grupo
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.length > 0 && (
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wide">Meus grupos</h2>
          )}
          {groups.map((g) => (
            <Link key={g.id} href={`/groups/${g.id}`}>
              <Card className="hover:border-neon/30 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="text-3xl w-12 h-12 flex items-center justify-center bg-neon/10 rounded-xl flex-shrink-0">
                    {g.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm">{g.name}</p>
                      {g.role === "OWNER" && <Crown className="h-3.5 w-3.5 text-neon flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <Users className="h-3 w-3 inline mr-0.5" />
                      {g.memberCount}/{g.maxMembers} membros
                    </p>
                    {g.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{g.description}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create group modal */}
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={() => router.refresh()} />}
    </div>
  );
}

function InviteCard({ invite, onRespond }: { invite: PendingInvite; onRespond: () => void }) {
  const [loading, setLoading] = useState<"ACCEPT" | "DECLINE" | null>(null);
  const initials = invite.inviter.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  async function respond(action: "ACCEPT" | "DECLINE") {
    setLoading(action);
    try {
      const res = await fetch(`/api/groups/${invite.groupId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, inviteId: invite.id }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erro");
      }
      toast.success(action === "ACCEPT" ? "Você entrou no grupo! 🎉" : "Convite recusado.");
      onRespond();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao responder convite.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="border-neon/20">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="text-2xl">{invite.group.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{invite.group.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Avatar className="h-4 w-4">
              <AvatarImage src={invite.inviter.image ?? ""} />
              <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">Convidado por {invite.inviter.name}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs"
            disabled={loading !== null}
            onClick={() => respond("DECLINE")}
          >
            Recusar
          </Button>
          <Button
            size="sm"
            className="h-8 px-3 text-xs bg-neon text-black font-bold hover:bg-neon-300"
            disabled={loading !== null}
            onClick={() => respond("ACCEPT")}
          >
            {loading === "ACCEPT" ? "..." : "Aceitar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🏆");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim() || name.trim().length < 3) {
      toast.error("Nome deve ter ao menos 3 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/groups/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, icon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Erro");
      window.location.href = data.url;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar grupo.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-neon/30 rounded-2xl w-full max-w-md shadow-2xl space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Criar grupo</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Icon picker */}
        <div>
          <label className="text-xs text-white/60 font-medium mb-2 block">Ícone do grupo</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`text-2xl p-2 rounded-xl transition-all ${icon === ic ? "bg-neon/20 border border-neon ring-1 ring-neon/50" : "bg-secondary hover:bg-white/10"}`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs text-white/60 font-medium mb-1.5 block">Nome do grupo *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Ex: Galera do rolê"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-neon/60 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-white/60 font-medium mb-1.5 block">Descrição (opcional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            placeholder="Ex: Grupo dos amigos da faculdade"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-neon/60 transition-colors"
          />
        </div>

        {/* Info box */}
        <div className="bg-neon/5 border border-neon/20 rounded-xl p-4 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Limite de membros</span>
            <span className="font-bold text-white">até 10 pessoas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Conquista exclusiva</span>
            <span className="font-bold text-white">👑 Fundador de Grupo</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5 mt-1.5">
            <span className="text-white/70">Valor único</span>
            <span className="font-black text-neon text-base">R$ 14,90</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-neon text-black font-black hover:bg-neon-300 neon-glow"
            onClick={handleCreate}
            disabled={loading || name.trim().length < 3}
          >
            {loading ? "Redirecionando..." : "Criar por R$ 14,90"}
          </Button>
        </div>
      </div>
    </div>
  );
}
