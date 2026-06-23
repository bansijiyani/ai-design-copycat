import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { getMyOrders } from "@/lib/api/order.functions";

export const Route = createFileRoute("/profile/orders")({
  head: () => ({ meta: [{ title: "Order History — FizTopz" }] }),
  loader: async () => {
    const orders = await getMyOrders();
    return { orders };
  },
  component: ProfileOrders,
});

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", bg: "#FEF3C7", color: "#92400E", icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: "Processing", bg: "#DBEAFE", color: "#1E40AF", icon: <Package className="w-3.5 h-3.5" /> },
  shipped: { label: "Shipped", bg: "#EDE9FE", color: "#5B21B6", icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: "Delivered", bg: "#D1FAE5", color: "#065F46", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", color: "#B91C1C", icon: <XCircle className="w-3.5 h-3.5" /> },
};

function ProfileOrders() {
  const { orders } = Route.useLoaderData();

  return (
    <div className="bg-white border border-border rounded shadow-sm p-6 lg:p-8">
      <h1 className="font-display text-2xl mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded border border-dashed border-border">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="bg-maroon text-white px-6 py-2 rounded-sm text-sm font-semibold hover:bg-maroon/90 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const address = order.address_snapshot as any || {};
            const items = order.order_items || [];
            
            return (
              <div key={order.id} className="border border-border rounded p-5 relative">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 pb-4 border-b border-border/50">
                  <div>
                    <div className="font-mono text-sm font-semibold text-foreground">ORDER #{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      {address.city && ` · Delivering to ${address.city}`}
                    </div>
                  </div>
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    {cfg.icon} {cfg.label}
                  </div>
                </div>

                <div className="space-y-4">
                  {items.map((item: any) => {
                    const snap = item.product_snapshot || {};
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0 border border-border/50">
                          {snap.image && <img src={snap.image} alt={item.product_name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm line-clamp-1">{item.product_name}</div>
                          <div className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</div>
                          <div className="font-semibold text-sm mt-1">₹{item.price.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">Total Paid</div>
                  <div className="font-semibold">₹{order.total.toLocaleString("en-IN")}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
