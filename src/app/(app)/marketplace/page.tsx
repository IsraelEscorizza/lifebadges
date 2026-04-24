import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MarketplaceClient } from "@/components/marketplace/marketplace-client";

export const metadata: Metadata = { title: "Loja de Packs" };

// Pack list rarely changes — cache for 1 hour
const getPacks = unstable_cache(
  async () =>
    db.achievementPack.findMany({
      where: { isActive: true, isBase: false },
      orderBy: { sortOrder: "asc" },
      include: {
        achievements: {
          where: { isActive: true },
          select: { id: true, name: true, icon: true, rarity: true },
        },
      },
    }),
  ["packs-list"],
  { revalidate: 3600 }
);

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; pack?: string; canceled?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id as string;
  const params = await searchParams;

  const [packs, purchases] = await Promise.all([
    getPacks(),
    db.purchase.findMany({
      where: { userId, status: "COMPLETED" },
      select: { packId: true },
    }),
  ]);

  const purchasedPackIds = new Set(purchases.map((p) => p.packId));

  return (
    <MarketplaceClient
      packs={packs}
      purchasedPackIds={purchasedPackIds}
      justPurchasedPackId={params.success === "1" ? (params.pack ?? null) : null}
      canceled={params.canceled === "1"}
    />
  );
}
