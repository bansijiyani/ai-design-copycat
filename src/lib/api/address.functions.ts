"use server";

import { z } from "zod";
import { getUserId } from "@/integrations/supabase/auth-middleware";

export async function getMyAddresses() {
  const userId = await getUserId();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createAddress({ data: input }: { data: any }) {
  const userId = await getUserId();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
}

export async function updateAddress({ data: { id, ...fields } }: { data: any }) {
  const userId = await getUserId();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
}

export async function deleteAddress({ data: { id } }: { data: { id: string } }) {
  const userId = await getUserId();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function setDefaultAddress({ data: { id } }: { data: { id: string } }) {
  const userId = await getUserId();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  await supabaseAdmin
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);

  const { error } = await supabaseAdmin
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { success: true };
}
