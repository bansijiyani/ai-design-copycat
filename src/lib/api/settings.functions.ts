import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth } from "@/integrations/supabase/auth-middleware";

export const getSettings = createServerFn({ method: "GET" })
  .handler(async () => {
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
    
    // Default fallback if not in DB yet
    if (typeof settings.flat_shipping_charge === "undefined") {
      settings.flat_shipping_charge = "150";
    }

    return settings;
  });

export const updateSetting = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator(z.object({
    key: z.string(),
    value: z.string(),
  }))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: input.key, value: input.value, updated_at: new Date().toISOString() });

    if (error) throw new Error(error.message);

    return { success: true };
  });
