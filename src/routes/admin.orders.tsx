import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/lib/api/order.functions";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getAllOrders(),
  });

  const setStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus({ data: { id, status: status as any } });
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    try {
      await deleteOrder({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Orders</h1>
      <p className="text-sm text-muted-foreground mt-1">View and update customer orders.</p>

      <div className="mt-6 bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Order ID</th>
              <th className="text-left p-3">Items</th>
              <th className="text-right p-3">Total</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Date</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {(orders as any[])?.map((o: any) => (
              <tr key={o.id} className="border-t border-border align-top">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="p-3">
                  {o.order_items?.length ? (
                    <ul className="space-y-1">
                      {o.order_items.map((it: any, i: number) => (
                        <li key={i} className="text-xs">{it.quantity}× {it.product_name}</li>
                      ))}
                    </ul>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="p-3 text-right font-semibold">₹{Number(o.total).toLocaleString("en-IN")}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="text-xs bg-muted border border-border rounded px-2 py-1 capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  {o.payments?.length ? (
                    <span className={`text-[10px] px-2 py-1 rounded uppercase ${o.payments[0].status === "paid" ? "bg-forest/10 text-forest" : "bg-muted"}`}>
                      {o.payments[0].method} · {o.payments[0].status}
                    </span>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="p-3 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => del(o.id)} className="text-xs text-maroon hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {(orders as any[])?.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
