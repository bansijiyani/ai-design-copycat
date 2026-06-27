"use client";

import Link from "next/link";
import { useEffect } from "react";
import { User, MapPin, Package, LogOut } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const links = [
    { to: "/profile", icon: User, label: "Personal Details", exact: true },
    { to: "/profile/addresses", icon: MapPin, label: "Manage Addresses", exact: false },
    { to: "/profile/orders", icon: Package, label: "Order History", exact: false },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 bg-white border border-border rounded shadow-sm p-4 sticky top-28">
            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = link.exact ? pathname === link.to : pathname?.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors whitespace-nowrap lg:whitespace-normal ${
                      isActive ? "bg-maroon/10 text-maroon" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-border hidden lg:block" />
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap lg:whitespace-normal"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 w-full min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
