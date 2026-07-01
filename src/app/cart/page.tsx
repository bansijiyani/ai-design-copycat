"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingBag, ArrowRight, X, Plus, Minus, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getMyAddresses, createAddress } from "@/lib/api/address.functions";
import { createOrder, verifyRazorpayPayment } from "@/lib/api/order.functions";
import { getSettings } from "@/lib/api/settings.functions";
import { useQueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    Razorpay: any;
  }
}
export default function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const updateQty = useCart((s) => s.updateQty);
  const clear = useCart((s) => s.clear);
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online");
  const [submitting, setSubmitting] = useState(false);

  // Address form state
  const [addrForm, setAddrForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: true,
  });

  // Fetch addresses when checking out
  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ["my-addresses"],
    queryFn: () => getMyAddresses(),
    enabled: !!user && checkingOut,
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Force sync cart prices when visiting cart or toggling checkout
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["cart-prices"] });
  }, [checkingOut, queryClient]);

  // Fetch app settings for shipping charge
  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => getSettings(),
  });

  // Filter out corrupted items from previous sessions
  const validItems = items.filter((i) => typeof i.price === "number" && !isNaN(i.price));
  
  // Find items that are out of stock
  const outOfStockItems = validItems.filter(i => (i.stock !== undefined && i.stock < i.qty) || i.isActive === false);
  const canCheckout = outOfStockItems.length === 0 && validItems.length > 0;

  // Cart uses self-contained item data (price, productName, image)
  const subtotal = validItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal === 0 ? 0 : Number(settings?.flat_shipping_charge ?? 150);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }
    setCheckingOut(true);
    
    // Load Razorpay Script dynamically
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const handleSaveAddress = async () => {
    try {
      await createAddress({ data: addrForm });
      toast.success("Address saved!");
      setShowAddressForm(false);
      refetchAddresses();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createOrder({
        data: {
          address_id: selectedAddressId,
          items: items.map((i) => ({
            product_id: i.id,
            variant_id: i.variantId ?? null,
            product_name: i.productName,
            price: i.price,
            quantity: i.qty,
            image: i.image ?? null,
          })),
          payment_method: paymentMethod,
        },
      });

      if (paymentMethod === "online" && res.razorpayOrderId) {
        if (!window.Razorpay) {
          throw new Error("Razorpay SDK not loaded");
        }
        
        const options = {
          key: res.razorpayKeyId,
          amount: (subtotal + shipping) * 100,
          currency: "INR",
          name: "FizTopz",
          description: "Premium Fashion E-Commerce",
          order_id: res.razorpayOrderId,
          handler: async function (response: any) {
            try {
              toast.loading("Verifying payment...", { id: "verify-pay" });
              await verifyRazorpayPayment({
                data: {
                  order_id: res.order.id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }
              });
              toast.success("Payment successful! Order placed! 🎉", { id: "verify-pay" });
              clear();
              setCheckingOut(false);
            } catch (err: any) {
              toast.error(err.message || "Payment verification failed", { id: "verify-pay" });
            }
          },
          prefill: {
            name: addrForm.full_name || user?.user_metadata?.full_name || "",
            email: user?.email || "",
            contact: addrForm.phone || "",
          },
          theme: {
            color: "#b8924a"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          toast.error(`Payment Failed: ${response.error.description}`);
        });
        rzp.open();
      } else {
        toast.success("Order placed successfully! 🎉");
        clear();
        setCheckingOut(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {validItems.length === 0 && !checkingOut ? (
        <div className="flex-1 grid place-items-center py-32">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted grid place-items-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-4xl mt-8">Your cart is empty</h1>
            <p className="mt-4 text-muted-foreground">Looks like you haven't added anything yet. Explore our latest collections!</p>
            <Link href="/products" className="mt-8 inline-flex items-center gap-2 bg-gold text-white px-8 py-3.5 font-semibold tracking-wider text-sm hover:bg-gold/90 transition">
              START SHOPPING <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12 grid lg:grid-cols-[1fr_380px] gap-10">
          <div>
            <h1 className="font-display text-4xl mb-8">
              {checkingOut ? "Checkout" : `Your Cart (${validItems.length})`}
            </h1>

            {/* Cart Items */}
            {!checkingOut && (
              <div className="space-y-4">
                {validItems.map((i) => (
                  <div key={`${i.id}__${i.variantId ?? ""}`} className="flex gap-4 p-4 border border-border rounded-sm">
                    {i.image && (
                      <img src={i.image} alt={i.productName} className="w-28 aspect-[3/4] object-cover rounded-sm" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-display text-lg">{i.productName}</h3>
                      {i.color && <p className="text-xs text-muted-foreground mt-1">Color: {i.color}</p>}
                      {i.size && <p className="text-xs text-muted-foreground">Size: {i.size}</p>}
                      <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center border border-border rounded-sm">
                          <button onClick={() => updateQty(i.id, Math.max(1, i.qty - 1), i.variantId)} className="p-2 cursor-pointer"><Minus className="w-3 h-3" /></button>
                          <span className="px-4 text-sm">{i.qty}</span>
                          <button onClick={() => updateQty(i.id, i.qty + 1, i.variantId)} className="p-2 cursor-pointer"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="text-gold font-semibold">₹{(i.price * i.qty).toLocaleString("en-IN")}</span>
                      </div>
                      {((i.stock !== undefined && i.stock === 0) || i.isActive === false) ? (
                        <p className="text-xs font-semibold text-maroon mt-3">Out of Stock</p>
                      ) : (i.stock !== undefined && i.stock < i.qty) ? (
                        <p className="text-xs font-semibold text-maroon mt-3">Only {i.stock} left in stock</p>
                      ) : null}
                    </div>
                    <button onClick={() => remove(i.id, i.variantId)} className="self-start p-1 hover:text-maroon"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Address Selection (Checkout) */}
            {checkingOut && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gold" /> Delivery Address
                  </h2>
                  {addresses.length === 0 && !showAddressForm ? (
                    <div className="p-6 border border-dashed border-border rounded text-center">
                      <p className="text-muted-foreground mb-3">No saved addresses</p>
                      <button onClick={() => setShowAddressForm(true)} className="text-gold text-sm font-semibold hover:underline">+ Add New Address</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr: any) => (
                        <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition ${selectedAddressId === addr.id ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"}`}>
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-[var(--gold)]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{addr.full_name}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-muted rounded uppercase">{addr.label}</span>
                              {addr.is_default && <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold rounded">DEFAULT</span>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.pincode}</p>
                            {addr.phone && <p className="text-xs text-muted-foreground mt-1">📞 {addr.phone}</p>}
                          </div>
                        </label>
                      ))}
                      {!showAddressForm && (
                        <button onClick={() => setShowAddressForm(true)} className="text-gold text-sm font-semibold hover:underline">+ Add New Address</button>
                      )}
                    </div>
                  )}
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <div className="border border-border rounded-sm p-5">
                    <h3 className="font-semibold text-sm mb-4">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <AddrField label="Full Name" className="col-span-2"><input value={addrForm.full_name} onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors" /></AddrField>
                      <AddrField label="Phone"><input value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors" /></AddrField>
                      <AddrField label="Label"><input value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors" placeholder="Home / Work" /></AddrField>
                      <AddrField label="Address Line 1" className="col-span-2"><input value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors" /></AddrField>
                      <AddrField label="Address Line 2" className="col-span-2"><input value={addrForm.line2} onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors" /></AddrField>
                      <AddrField label="City"><input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors" /></AddrField>
                      <AddrField label="State"><input value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors" /></AddrField>
                      <AddrField label="Pincode"><input value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-colors" /></AddrField>
                    </div>
                    <div className="mt-4 flex gap-2 justify-end">
                      <button onClick={() => setShowAddressForm(false)} className="px-4 py-2 text-sm border border-border rounded">Cancel</button>
                      <button onClick={handleSaveAddress} className="px-4 py-2 text-sm bg-gold text-white font-semibold rounded">Save Address</button>
                    </div>
                  </div>
                )}

                <button onClick={() => setCheckingOut(false)} className="text-sm text-muted-foreground hover:text-gold">← Back to cart</button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <aside className="bg-muted/40 p-6 rounded-sm h-fit sticky top-28">
            <h2 className="font-display text-2xl mb-6">Order Summary</h2>
            {checkingOut && (
              <>
                <div className="mb-4 space-y-2 border-b border-border pb-4">
                  {items.map((i) => (
                    <div key={`${i.id}__${i.variantId ?? ""}`} className="flex justify-between text-sm">
                      <span className="truncate mr-2">{i.productName} × {i.qty}</span>
                      <span>₹{(i.price * i.qty).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-3">Payment Method</h3>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition ${paymentMethod === "online" ? "border-gold bg-gold/5" : "border-border"}`}>
                      <input type="radio" name="payment_method" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="accent-[var(--gold)]" />
                      <span className="text-sm font-medium">Pay Online</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition ${paymentMethod === "cod" ? "border-gold bg-gold/5" : "border-border"}`}>
                      <input type="radio" name="payment_method" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-[var(--gold)]" />
                      <span className="text-sm font-medium">Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
              <div className="flex justify-between pt-3 border-t border-border font-semibold text-base">
                <span>Total</span><span className="text-gold">₹{(subtotal + shipping).toLocaleString("en-IN")}</span>
              </div>
            </div>
            {checkingOut ? (
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || !selectedAddressId || !canCheckout}
                className="w-full mt-6 bg-gold text-white py-4 font-semibold tracking-wider text-sm hover:bg-gold/90 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "PROCESSING…" : `PLACE ORDER (${paymentMethod === "online" ? "PAY NOW" : "COD"})`}
              </button>
            ) : (
              <button onClick={handleCheckout} disabled={!canCheckout} className="w-full mt-6 bg-gold text-white py-4 font-semibold tracking-wider text-sm hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {canCheckout ? "CHECKOUT" : "UPDATE CART TO CHECKOUT"}
              </button>
            )}
            <Link href="/products" className="block text-center text-sm text-muted-foreground mt-4 hover:text-gold">Continue Shopping</Link>
          </aside>
        </div>
      )}
      <Footer />
    </div>
  );
}

function AddrField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
