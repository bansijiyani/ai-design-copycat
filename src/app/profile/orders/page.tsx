"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Clock, Truck, CheckCircle, XCircle, RefreshCcw, Archive, Banknote, ChevronDown, ChevronUp, MapPin, CreditCard } from "lucide-react";
import { getMyOrders, initiateOrderReturnOrCancel } from "@/lib/api/order.functions";
import { toast } from "sonner";
import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", bg: "#FEF3C7", color: "#92400E", icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: "Processing", bg: "#DBEAFE", color: "#1E40AF", icon: <Package className="w-3.5 h-3.5" /> },
  packed: { label: "Packed", bg: "#FEF08A", color: "#854D0E", icon: <Archive className="w-3.5 h-3.5" /> },
  shipped: { label: "Shipped", bg: "#EDE9FE", color: "#5B21B6", icon: <Truck className="w-3.5 h-3.5" /> },
  out_for_delivery: { label: "Out for Delivery", bg: "#FFEDD5", color: "#C2410C", icon: <MapPin className="w-3.5 h-3.5" /> },
  delivered: { label: "Delivered", bg: "#D1FAE5", color: "#065F46", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", color: "#B91C1C", icon: <XCircle className="w-3.5 h-3.5" /> },
  return_initiated: { label: "Return Initiated", bg: "#FEF08A", color: "#854D0E", icon: <RefreshCcw className="w-3.5 h-3.5" /> },
  return_received: { label: "Return Received", bg: "#E0E7FF", color: "#3730A3", icon: <Archive className="w-3.5 h-3.5" /> },
  refund_completed: { label: "Refund Completed", bg: "#D1FAE5", color: "#065F46", icon: <Banknote className="w-3.5 h-3.5" /> },
};

const PROGRESS_STEPS = [
  { id: "pending", label: "Order Placement", icon: Clock },
  { id: "processing", label: "Processing", icon: Package },
  { id: "packed", label: "Packed", icon: Archive },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { id: "delivered", label: "Delivered", icon: CheckCircle }
];

function OrderProgress({ currentStatus }: { currentStatus: string }) {
  const currentIndex = PROGRESS_STEPS.findIndex(s => s.id === currentStatus);
  const isCancelledOrReturned = ["cancelled", "return_initiated", "return_received", "refund_completed"].includes(currentStatus);

  if (isCancelledOrReturned) return null;

  const percentage = Math.max(0, Math.min(100, (currentIndex / (PROGRESS_STEPS.length - 1)) * 100));

  return (
    <div className="w-full py-4 mb-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-between min-w-[700px] relative z-0">
        {/* Background dashed line */}
        <div className="absolute left-12 right-12 top-6 h-0 border-t-2 border-dashed border-border z-0" />
        
        {/* Foreground solid line */}
        <div 
          className="absolute left-12 top-6 h-0 border-t-2 border-solid border-maroon z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `calc((100% - 6rem) * ${percentage / 100})` }} 
        />
        
        {PROGRESS_STEPS.map((step, index) => {
          const isActive = currentIndex >= 0 && index <= currentIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 w-24">
              <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center border-2 transition-all ${isActive ? 'border-maroon text-maroon shadow-sm' : 'border-border text-muted-foreground border-dashed'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold text-center leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfileOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getMyOrders(),
    enabled: !!user,
  });
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCancelOrder = async (orderId: string, isDelivered: boolean) => {
    const msg = isDelivered 
      ? "Are you sure you want to return this order? A pickup will be scheduled. Refunds will be processed after the item is received."
      : "Are you sure you want to cancel this order?";
    if (!confirm(msg)) return;
    
    setCancellingId(orderId);
    try {
      const res = await initiateOrderReturnOrCancel({ data: { id: orderId } });
      toast.success(res.newStatus === "return_initiated" ? "Return initiated successfully" : "Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-white border border-border rounded shadow-sm p-6 lg:p-8">
      <h1 className="font-display text-2xl mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded border border-dashed border-border">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Link href="/products" className="bg-maroon text-white px-6 py-2 rounded-sm text-sm font-semibold hover:bg-maroon/90 transition-colors">
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
              <div key={order.id} className="border border-border rounded overflow-hidden">
                {/* Header (Clickable) */}
                <div 
                  className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm font-semibold text-foreground">ORDER #{order.id.slice(0, 8).toUpperCase()}</div>
                      {expandedId === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon} {cfg.label}
                    </div>
                    <div className="font-semibold text-foreground text-sm">
                      Total: ₹{order.total.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === order.id && (
                  <div className="border-t border-border/50 bg-muted/10 p-5 space-y-6">
                    <OrderProgress currentStatus={order.status} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping Info */}
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Shipping Address</h4>
                        <div className="bg-white p-3 rounded border border-border/50 text-sm">
                          <div className="font-semibold">{address.full_name}</div>
                          <div className="text-muted-foreground mt-1">{address.line1}</div>
                          {address.line2 && <div className="text-muted-foreground">{address.line2}</div>}
                          <div className="text-muted-foreground">{address.city}, {address.state} {address.pincode}</div>
                          <div className="text-muted-foreground mt-2 text-xs">Phone: {address.phone}</div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payment Method</h4>
                        <div className="bg-white p-3 rounded border border-border/50 text-sm">
                          {order.payments?.[0] ? (
                            <>
                              <div className="font-semibold capitalize">{order.payments[0].method === "cod" ? "Cash on Delivery" : "Online Payment"}</div>
                              <div className="text-muted-foreground mt-1 capitalize text-xs">Status: {order.payments[0].status}</div>
                            </>
                          ) : (
                            <div className="text-muted-foreground italic">No payment info found</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {items.map((item: any) => {
                          const snap = item.product_snapshot || {};
                          return (
                            <div key={item.id} className="flex gap-4 bg-white p-3 rounded border border-border/50">
                              <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0 border border-border/50">
                                {snap.image && <img src={snap.image} alt={item.product_name} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                <div className="font-semibold text-sm line-clamp-1">{item.product_name}</div>
                                <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                                  <span>Qty: {item.quantity}</span>
                                  {snap.color && <span>Color: {snap.color}</span>}
                                  {snap.size && <span>Size: {snap.size}</span>}
                                </div>
                                <div className="font-semibold text-sm mt-2">₹{item.price.toLocaleString("en-IN")}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Total Breakdown */}
                    <div className="bg-white p-4 rounded border border-border/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="space-y-1 text-sm flex-1">
                        <div className="flex justify-between text-muted-foreground max-w-xs">
                          <span>Items Total</span>
                          <span>₹{(order.total - (order.total > items.reduce((s: number, i: any) => s + i.price * i.quantity, 0) ? (order.total - items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)) : 0)).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground max-w-xs">
                          <span>Shipping</span>
                          <span>₹{(order.total > items.reduce((s: number, i: any) => s + i.price * i.quantity, 0) ? (order.total - items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)) : 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-border/50 max-w-xs text-base">
                          <span>Grand Total</span>
                          <span className="text-maroon">₹{order.total.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      
                      {order.status !== "cancelled" && order.status !== "return_initiated" && order.status !== "return_received" && order.status !== "refund_completed" && (
                        <button 
                          onClick={() => handleCancelOrder(order.id, order.status === "delivered")}
                          disabled={cancellingId === order.id}
                          className="text-sm font-semibold px-6 py-2.5 border border-maroon text-maroon hover:bg-maroon hover:text-white transition-colors rounded disabled:opacity-50"
                        >
                          {cancellingId === order.id 
                            ? "PROCESSING..." 
                            : (order.status === "delivered" ? "RETURN ORDER" : "CANCEL ORDER")}
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
