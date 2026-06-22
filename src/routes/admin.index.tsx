import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import { getAdminStats } from "@/lib/api/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(),
  });

  const cards = [
    { label: "Total Products", value: stats?.products ?? "—", icon: Package, color: "bg-gold" },
    { label: "Total Orders", value: stats?.orders ?? "—", icon: ShoppingCart, color: "bg-maroon" },
    { label: "Total Users", value: stats?.users ?? "—", icon: Users, color: "bg-forest" },
    { label: "Low Stock (<10)", value: stats?.lowStock ?? "—", icon: AlertTriangle, color: "bg-amber-600" },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage your store at a glance.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-background border border-border rounded-lg p-5">
            <div className={`w-10 h-10 rounded ${c.color} grid place-items-center text-white`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground mt-4 uppercase tracking-wide">{c.label}</p>
            <p className="font-display text-3xl mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-background border border-border rounded-lg p-6">
        <h2 className="font-display text-xl">Revenue</h2>
        <p className="font-display text-4xl text-gold mt-2">₹{(stats?.revenue ?? 0).toLocaleString("en-IN")}</p>
        <p className="text-xs text-muted-foreground mt-1">Across all orders</p>
      </div>
    </div>
  );
}
