"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserPlus, UserCheck, Search, Users } from "lucide-react";
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
      <h1 className="text-xl font-black">Amigos</h1>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Solicitações ({pendingRequests.length})
          </h2>
          {pendingRequests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <Link href={`/profile/${req.sender.id}`}>
                  <Avatar>
                    <AvatarImage src={req.sender.image ?? ""} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                      {req.sender.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{req.sender.name}</p>
                  {req.sender.username && (
                    <p className="text-xs text-muted-foreground">@{req.sender.username}</p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="gold"
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
            <Card key={friend.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <Link href={`/profile/${friend.id}`}>
                  <Avatar>
                    <AvatarImage src={friend.image ?? ""} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                      {friend.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{friend.name}</p>
                  {friend.username && (
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                  )}
                </div>
                <Link href={`/profile/${friend.id}`}>
                  <Button size="sm" variant="ghost" className="text-muted-foreground">Ver perfil</Button>
                </Link>
              </CardContent>
            </Card>
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
            <Card key={user.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <Link href={`/profile/${user.id}`}>
                  <Avatar>
                    <AvatarImage src={user.image ?? ""} />
                    <AvatarFallback className="bg-secondary text-xs">{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{user.name}</p>
                  {user.username && (
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => sendRequest(user.id)}
                  disabled={isPending}
                >
                  <UserPlus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
