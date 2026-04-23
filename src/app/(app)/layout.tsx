import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session.user} />
      <main className="max-w-2xl mx-auto px-4 pt-16 pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
