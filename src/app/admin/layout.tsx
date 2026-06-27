"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft, Layers, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";



export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (!isAdmin) router.push("/");
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Checking admin access…</p>
      </div>
    );
  }

  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: Layers },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 bg-foreground text-background flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Logo variant="footer" className="h-20 scale-[2.5] origin-left" />
          <p className="text-[10px] tracking-[0.2em] text-gold mt-1">ADMIN PANEL</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                href={it.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition ${active ? "bg-gold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              >
                <it.icon className="w-4 h-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-xs text-white/60 hover:text-white">
            <ArrowLeft className="w-3 h-3" /> Back to store
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
