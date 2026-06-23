import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Admin: Dashboard Stats ─────────────────────────────────────────────────

export const getAdminStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [products, orders, users, lowStock] = await Promise.all([
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("total", { count: "exact" }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }).lt("stock", 10),
    ]);

    const revenue = (orders.data ?? []).reduce(
      (sum, row: any) => sum + Number(row.total || 0),
      0,
    );

    return {
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      users: users.count ?? 0,
      lowStock: lowStock.count ?? 0,
      revenue,
    };
  });

// ─── Admin: All Users ───────────────────────────────────────────────────────

export const getAllUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, username, full_name, email, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);

    return (profiles ?? []).map((p: any) => ({
      ...p,
      roles: (roles ?? [])
        .filter((r: any) => r.user_id === p.id)
        .map((r: any) => r.role),
    }));
  });

export const promoteToAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data: { userId } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ─── Categories ─────────────────────────────────────────────────────────────

export const getCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return data;
  });

export const createCategory = createServerFn({ method: "POST" })
  .validator(z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    section: z.string().default("ethnic"),
    image: z.string().nullable().optional(),
    is_active: z.boolean().default(true).optional(),
  }))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateCategory = createServerFn({ method: "POST" })
  .validator(z.object({
    id: z.string().uuid(),
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    section: z.string().optional(),
    image: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
  }))
  .handler(async ({ data: { id, ...fields } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("categories")
      .update(fields)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
