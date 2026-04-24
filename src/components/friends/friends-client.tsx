"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserPlus, UserCheck, Search, Users } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface User {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface PendingRequest {
  id: string;
  sender: User;
}

interface Props {
  friends: User[];
  pendingRequests: PendingRequest[];
  suggestions: User[];
  currentUserId: string;
}

export function FriendsClient({ friends, pendingRequests, suggestions, currentUserId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const filteredFriends = friends.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.username?.toLowerCase().includes(search.toLowerCase())
  );

  function respondToRequest(friendshipId: string, action: "ACCEPT" | "REJECT") {
    setRespondingId(friendshipId);
    startTransition(async () => {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, action }),
      });
      if (res.ok) {
        toast.success(action === "ACCEPT" ? "Amizade aceita! 🎉" : "Solicitação recusada.");
        router.refresh();
      } else {
        toast.error("Erro ao responder solicitação.");
      }
      setRespondingId(null);
    });
  }

  function sendRequest(receiverId: string) {
    startTransition(async () => {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });
      if (res.ok) { toast.success("Solicitação enviada!"); router.refresh(); }
      else toast.error("Erro ao enviar solicitação.");
    });
  }

  return (
    <div className="pt-4 space-y-5">
      <BackButton href="/feed" />
      <h1 className="text-xl font-black">Amigos</h1>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Solicitações ({pendingRequests.length})
          </h2>
          {pendingRequests.map((req) => (
            <Card key={req.id} className="transition-colors hover:border-border/80">
              <CardContent className="p-3 flex items-center gap-3">
                <Link href={`/profile/${req.sender.id}`} className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src={req.sender.image ?? ""} />
                    <AvatarFallback className="bg-secondary text-neon-500 text-xs">
                      {req.sender.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Link href={`/profile/${req.sender.id}`} className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{req.sender.name}</p>
                  {req.sender.username && (
                    <p className="text-xs text-muted-foreground">@{req.sender.username}</p>
                  )}
                </Link>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="neon"
                    onClick={() => respondToRequest(req.id, "ACCEPT")}
                    loading={respondingId === req.id && isPending}
                  >
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => respondToRequest(req.id, "REJECT")}
                    disabled={respondingId === req.id && isPending}
                    className="text-muted-foreground"
                  >
                    Recusar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search friends */}
      <Input
        placeholder="Buscar amigos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {/* Friends list */}
      {filteredFriends.length > 0 ? (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Seus amigos ({filteredFriends.length})
          </h2>
          {filteredFriends.map((friend) => (
            <Link key={friend.id} href={`/profile/${friend.id}`} className="block group">
              <Card className="transition-colors group-hover:border-border/80 group-active:scale-[0.99]">
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src={friend.image ?? ""} />
                    <AvatarFallback className="bg-secondary text-neon-500 text-xs">
                      {friend.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{friend.name}</p>
                    {friend.username && (
                      <p className="text-xs text-muted-foreground">@{friend.username}</p>
                    )}
                  </div>
                  <UserCheck className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-neon transition-colors" strokeWidth={1.5} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <Users className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Você ainda não tem amigos. Adicione alguém abaixo!
          </p>
        </div>
      ) : null}

      {/* Suggestions */}
      {suggestions.length > 0 && !search && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Sugestões
          </h2>
          {suggestions.map((user) => (
            <Link key={user.id} href={`/profile/${user.id}`} className="block group">
              <Card className="transition-colors group-hover:border-border/80 group-active:scale-[0.99]">
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src={user.image ?? ""} />
                    <AvatarFallback className="bg-secondary text-xs">{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{user.name}</p>
                    {user.username && (
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 flex-shrink-0"
                    onClick={(e) => { e.preventDefault(); sendRequest(user.id); }}
                    disabled={isPending}
                  >
                    <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} /> Adicionar
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
