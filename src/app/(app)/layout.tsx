import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar user={session.user} />

      {/* Content shifts right on desktop to clear the sidebar */}
      <main className="lg:ml-60 max-w-2xl mx-auto px-4 pt-6 pb-24 lg:pb-10">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
