"use server";

import { cookies } from "next/headers";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  
  if (!token) {
    throw new Error("Unauthorized");
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    throw new Error("Unauthorized: Invalid token");
  }

  return user.id;
}

export async function requireSupabaseAuth() {
  const userId = await getUserId();
  return { userId };
}