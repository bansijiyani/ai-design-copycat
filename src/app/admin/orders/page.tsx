"use client";


import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/lib/api/order.functions";
import { DownloadInvoiceButton } from "@/components/DownloadInvoiceButton";
import { ChevronDown, ChevronUp, MapPin, CreditCard } from "lucide-react";



const STATUSES = ["pending", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "return_initiated", "return_received", "refund_completed"] as const;

export default function AdminOrders() {
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
            {(orders as any[])?.map((o: any) => {
              const address = o.address_snapshot as any || {};
              const items = o.order_items || [];
              const isExpanded = expandedId === o.id;

              return (
                <React.Fragment key={o.id}>
                  <tr 
                    className="border-t border-border align-top cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : o.id)}
                  >
                    <td className="p-3 font-mono text-xs flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      {o.id.slice(0, 8)}
                    </td>
                    <td className="p-3">
                      {items.length ? (
                        <ul className="space-y-1">
                          {items.map((it: any, i: number) => (
                            <li key={i} className="text-xs">{it.quantity}× {it.product_name}</li>
                          ))}
                        </ul>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-right font-semibold">₹{Number(o.total).toLocaleString("en-IN")}</td>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
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
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      <button onClick={() => del(o.id)} className="text-xs text-maroon hover:underline">Delete</button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-muted/10">
                      <td colSpan={7} className="p-0 border-b border-border/50">
                        <div className="p-6 border-x border-border/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Left Col: Customer & Shipping */}
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Shipping & Customer Details
                              </h4>
                              <div className="bg-white p-4 rounded border border-border/50 text-sm space-y-1">
                                <div className="font-semibold">{address.full_name || "N/A"}</div>
                                <div className="text-muted-foreground mt-1">{address.line1}</div>
                                {address.line2 && <div className="text-muted-foreground">{address.line2}</div>}
                                <div className="text-muted-foreground">{address.city}, {address.state} {address.pincode}</div>
                                <div className="text-muted-foreground mt-3 text-xs pt-3 border-t border-border/50">
                                  Phone: {address.phone} <br/>
                                  Email: {o.profiles?.email || "Unknown"}
                                </div>
                              </div>
                            </div>

                            {/* Right Col: Price Breakdown & Actions */}
                            <div className="flex flex-col h-full">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Order Summary
                              </h4>
                              
                              <div className="bg-white p-4 rounded border border-border/50 text-sm flex-1">
                                <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Items Total ({items.length} items)</span>
                                    <span>₹{(o.total - (o.total > items.reduce((s: number, i: any) => s + i.price * i.quantity, 0) ? (o.total - items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)) : 0)).toLocaleString("en-IN")}</span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>₹{(o.total > items.reduce((s: number, i: any) => s + i.price * i.quantity, 0) ? (o.total - items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)) : 0).toLocaleString("en-IN")}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between font-semibold text-base mb-6">
                                  <span>Grand Total</span>
                                  <span className="text-maroon">₹{Number(o.total).toLocaleString("en-IN")}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <DownloadInvoiceButton order={o} className="w-full justify-center py-2.5" />
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {(orders as any[])?.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
