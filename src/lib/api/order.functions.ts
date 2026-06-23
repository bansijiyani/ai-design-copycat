import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import Razorpay from "razorpay";
import crypto from "crypto";

// ─── Authenticated: Create Order ────────────────────────────────────────────

const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  product_name: z.string(),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  image: z.string().nullable().optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({
    address_id: z.string().uuid(),
    items: z.array(orderItemSchema).min(1),
    payment_method: z.string().default("cod"),
  }))
  .handler(async ({ data: input, context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Fetch the address for snapshot
    const { data: address, error: addrErr } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("id", input.address_id)
      .eq("user_id", userId)
      .single();
    if (addrErr || !address) throw new Error("Address not found");

    // 2. Calculate total and fetch shipping settings
    const total = input.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    
    const { data: settingsData } = await supabaseAdmin.from("app_settings").select("*");
    let flatShipping = 150;
    if (settingsData) {
      const row = settingsData.find(s => s.key === "flat_shipping_charge");
      if (row && !isNaN(Number(row.value))) {
        flatShipping = Number(row.value);
      }
    }
    const shipping = flatShipping;
    const grandTotal = total + shipping;

    // 3. Build product snapshots and validate stock
    const orderItems = [];
    for (const item of input.items) {
      // Fetch current product data for snapshot
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("id, name, price, image, brand, category, sku")
        .eq("id", item.product_id)
        .single();

      const productSnapshot = {
        ...product,
        purchased_price: item.price,
        purchased_quantity: item.quantity,
        image: item.image ?? product?.image,
      };

      // If variant specified, decrement variant stock
      if (item.variant_id) {
        const { data: variant, error: vErr } = await supabaseAdmin
          .from("product_variants")
          .select("stock")
          .eq("id", item.variant_id)
          .single();
        if (vErr || !variant) throw new Error(`Variant not found: ${item.variant_id}`);
        if (variant.stock < item.quantity) throw new Error(`Insufficient stock for variant ${item.variant_id}`);

        await supabaseAdmin
          .from("product_variants")
          .update({ stock: variant.stock - item.quantity })
          .eq("id", item.variant_id);
      } else {
        // Decrement product-level stock
        const { data: prod, error: pErr } = await supabaseAdmin
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();
        if (pErr || !prod) throw new Error(`Product not found: ${item.product_id}`);
        if (prod.stock < item.quantity) throw new Error(`Insufficient stock for product ${item.product_id}`);

        await supabaseAdmin
          .from("products")
          .update({ stock: prod.stock - item.quantity })
          .eq("id", item.product_id);
      }

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        product_snapshot: productSnapshot,
      });
    }

    // 4. Create the order
    const addressSnapshot = {
      full_name: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    };

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        total: grandTotal,
        status: "pending",
        shipping_address_id: input.address_id,
        shipping_address: `${address.line1}, ${address.city}, ${address.state} ${address.pincode}`,
        address_snapshot: addressSnapshot,
      })
      .select()
      .single();
    if (orderErr) throw new Error(orderErr.message);

    // 5. Insert order items
    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems.map((it) => ({ ...it, order_id: order.id })));
    if (itemsErr) throw new Error(itemsErr.message);

    // 6. Create payment record
    const { error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: order.id,
        method: input.payment_method,
        status: input.payment_method === "cod" ? "pending" : "pending",
        amount: grandTotal,
      });
    if (payErr) throw new Error(payErr.message);

    let razorpayOrderId = null;
    let razorpayKeyId = process.env.RAZORPAY_KEY_ID || null;

    if (input.payment_method === "online") {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay credentials not configured in environment variables");
      }
      
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const rzpOrder = await rzp.orders.create({
        amount: grandTotal * 100, // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: order.id,
      });

      razorpayOrderId = rzpOrder.id;

      // Store razorpay_order_id in payment metadata
      await supabaseAdmin
        .from("payments")
        .update({ metadata: { razorpay_order_id: rzpOrder.id } })
        .eq("order_id", order.id);
    }

    return { order, razorpayOrderId, razorpayKeyId };
  });

// ─── Authenticated: Verify Razorpay Payment ─────────────────────────────────

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({
    order_id: z.string().uuid(),
    razorpay_payment_id: z.string(),
    razorpay_order_id: z.string(),
    razorpay_signature: z.string(),
  }))
  .handler(async ({ data: input, context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret not configured");

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(input.razorpay_order_id + "|" + input.razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== input.razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Update order status
    await supabaseAdmin
      .from("orders")
      .update({ status: "processing" })
      .eq("id", input.order_id);

    // Update payment status
    await supabaseAdmin
      .from("payments")
      .update({ 
        status: "paid", 
        transaction_id: input.razorpay_payment_id,
        metadata: { razorpay_order_id: input.razorpay_order_id, razorpay_signature: input.razorpay_signature }
      })
      .eq("order_id", input.order_id);

    return { success: true };
  });

// ─── Authenticated: My Orders ───────────────────────────────────────────────

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items(*, product_snapshot),
        payments(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const getOrderById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id }, context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items(*, product_snapshot),
        payments(*)
      `)
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);

    // Verify the user owns this order or is admin
    if (data.user_id !== userId) {
      const { data: role } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) throw new Error("Unauthorized");
    }

    return data;
  });

// ─── Admin: All Orders ──────────────────────────────────────────────────────

export const getAllOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items(product_name, quantity, price, product_snapshot),
        payments(method, status, amount)
      `)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator(z.object({
    id: z.string().uuid(),
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "return_initiated", "return_received", "refund_completed"]),
  }))
  .handler(async ({ data: { id, status } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const initiateOrderReturnOrCancel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id }, context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Get order details
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("*, payments(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
      
    if (orderErr || !order) throw new Error("Order not found");

    if (order.status === "cancelled" || order.status === "return_initiated" || order.status === "return_received" || order.status === "refund_completed") {
      throw new Error("Cannot modify this order in its current status");
    }

    const isDelivered = order.status === "delivered";
    const newStatus = isDelivered ? "return_initiated" : "cancelled";

    // Update order
    await supabaseAdmin
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);
      
    // Restore stock if cancelled before shipping
    if (newStatus === "cancelled") {
      const { data: items } = await supabaseAdmin.from("order_items").select("*").eq("order_id", id);
      if (items) {
        for (const item of items) {
          if (item.variant_id) {
             const { data: v } = await supabaseAdmin.from("product_variants").select("stock").eq("id", item.variant_id).single();
             if (v) await supabaseAdmin.from("product_variants").update({ stock: v.stock + item.quantity }).eq("id", item.variant_id);
          } else {
             const { data: p } = await supabaseAdmin.from("products").select("stock").eq("id", item.product_id).single();
             if (p) await supabaseAdmin.from("products").update({ stock: p.stock + item.quantity }).eq("id", item.product_id);
          }
        }
      }
    }

    return { success: true, newStatus };
  });
