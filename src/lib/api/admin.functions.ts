"use server";

import { z } from "zod";

export async function getAdminStats() {
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
}

export async function getAllUsers() {
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
}

export async function promoteToAdmin({ data: { userId } }: { data: { userId: string } }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role: "admin" });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getCategories() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory({ data: input }: { data: any }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory({ data: { id, ...fields } }: { data: any }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("categories")
    .update(fields)
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteCategory({ data: { id } }: { data: { id: string } }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}
