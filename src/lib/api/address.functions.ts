import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ─── Authenticated: User Addresses ──────────────────────────────────────────

export const getMyAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

const addressInputSchema = z.object({
  label: z.string().default("Home"),
  full_name: z.string().min(1),
  phone: z.string().nullable().optional(),
  line1: z.string().min(1),
  line2: z.string().nullable().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().default("India"),
  is_default: z.boolean().default(false),
});

export const createAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(addressInputSchema)
  .handler(async ({ data: input, context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // If this is default, clear other defaults
    if (input.is_default) {
      await supabaseAdmin
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data, error } = await supabaseAdmin
      .from("addresses")
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).merge(addressInputSchema.partial()))
  .handler(async ({ data: { id, ...fields }, context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // If setting as default, clear other defaults first
    if (fields.is_default) {
      await supabaseAdmin
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { error } = await supabaseAdmin
      .from("addresses")
      .update(fields)
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id }, context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const setDefaultAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id }, context }) => {
    const userId = (context as any)?.userId;
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Clear all defaults
    await supabaseAdmin
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);

    // Set this one as default
    const { error } = await supabaseAdmin
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
