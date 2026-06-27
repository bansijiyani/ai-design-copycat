"use server";

import { z } from "zod";
import { getUserId } from "@/integrations/supabase/auth-middleware";

export async function getProfile() {
  const userId = await getUserId();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile({ data: input }: { data: any }) {
  const userId = await getUserId();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(input)
    .eq("id", userId);
  if (error) throw new Error(error.message);
  return { success: true };
}
