import { createAPIFileRoute } from "@tanstack/react-start/api";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const APIRoute = createAPIFileRoute("/api/cron/refunds")({
  GET: async ({ request }) => {
    // Basic security: require a CRON_SECRET header to prevent unauthorized runs
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized cron execution" }), { status: 401 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Razorpay credentials not configured" }), { status: 500 });
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 1. Fetch eligible orders: return_received OR cancelled
    // We also select updated_at to ensure the delay has passed
    const { data: eligibleOrders, error } = await supabaseAdmin
      .from("orders")
      .select("*, payments(*), order_items(*)")
      .in("status", ["return_received", "cancelled"]);

    if (error || !eligibleOrders) {
      return new Response(JSON.stringify({ error: "Failed to fetch orders" }), { status: 500 });
    }

    const delaySeconds = parseInt(process.env.REFUND_DELAY_SECONDS || "86400", 10);
    const now = new Date().getTime();

    const results = [];

    for (const order of eligibleOrders) {
      const updatedAt = order.updated_at ? new Date(order.updated_at).getTime() : new Date(order.created_at).getTime();
      const elapsedSeconds = (now - updatedAt) / 1000;

      // Skip if the configured delay hasn't passed yet
      if (elapsedSeconds < delaySeconds) {
        results.push({ order_id: order.id, status: "skipped", reason: `Waiting for delay (${elapsedSeconds}s < ${delaySeconds}s)` });
        continue;
      }

      const payment = order.payments?.[0];
      if (payment && payment.method === "online" && payment.status === "paid" && payment.transaction_id) {
        try {
          // Calculate refund amount: Total paid minus shipping
          const itemsTotal = order.order_items?.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0) || 0;
          const shippingPaid = order.total > itemsTotal ? order.total - itemsTotal : 0;
          
          const refundAmount = Math.floor(order.total - shippingPaid); // 100% of item total

          // Issue Razorpay Refund
          await rzp.payments.refund(payment.transaction_id, {
            amount: refundAmount * 100, // paise
          });

          // Update Payment status
          await supabaseAdmin
            .from("payments")
            .update({ status: "refunded" })
            .eq("id", payment.id);

          // Update Order status
          await supabaseAdmin
            .from("orders")
            .update({ status: "refund_completed" })
            .eq("id", order.id);

          results.push({ order_id: order.id, status: "success", refund_amount: refundAmount });
        } catch (err: any) {
          console.error(`Refund failed for order ${order.id}:`, err);
          results.push({ order_id: order.id, status: "failed", reason: err.message });
        }
      } else {
        // If it was COD or already refunded, just skip or mark as completed.
        // E.g. COD orders marked as returned don't get online refunds.
        // We could just update the status so they don't get picked up again.
        if (order.status === "return_received" && payment?.method === "cod") {
            await supabaseAdmin
              .from("orders")
              .update({ status: "refund_completed" })
              .eq("id", order.id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
