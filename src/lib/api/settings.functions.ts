"use server";

import { z } from "zod";

export async function getSettings() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("*");

  if (error) {
    console.error("Failed to load settings:", error);
    return {};
  }

  const settings: Record<string, string> = {};
  if (data) {
    data.forEach((row: any) => {
      settings[row.key] = row.value;
    });
  }
  
  if (typeof settings.flat_shipping_charge === "undefined") {
    settings.flat_shipping_charge = "150";
  }

  return settings;
}

export async function updateSetting({ data: input }: { data: { key: string; value: string } }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: input.key, value: input.value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);

  return { success: true };
}
