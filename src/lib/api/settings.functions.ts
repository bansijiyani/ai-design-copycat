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
  if (typeof settings.free_shipping_threshold === "undefined") {
    settings.free_shipping_threshold = "999";
  }
  if (typeof settings.homepage_banner_subtitle === "undefined") {
    settings.homepage_banner_subtitle = "New Season 2026";
  }
  if (typeof settings.homepage_title === "undefined") {
    settings.homepage_title = "Wear the\n<br />\n<span class=\"text-gold italic\">World.</span> Own\n<br />\nEvery <span class=\"text-maroon italic\">Room.</span>";
  }
  if (typeof settings.homepage_subtitle === "undefined") {
    settings.homepage_subtitle = "Premium ethnic and western fashion for India's boldest. Every thread tells a story. Every look makes a statement.";
  }
  if (typeof settings.homepage_banner_image === "undefined") {
    settings.homepage_banner_image = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&h=1100&fit=crop";
  }
  if (typeof settings.homepage_banner_label === "undefined") {
    settings.homepage_banner_label = "NEW ARRIVAL";
  }
  if (typeof settings.homepage_banner_heading === "undefined") {
    settings.homepage_banner_heading = "Bridal Collection 2026";
  }
  if (typeof settings.homepage_banner_price === "undefined") {
    settings.homepage_banner_price = "From ₹4,999";
  }
  if (typeof settings.filter_fabrics === "undefined") {
    settings.filter_fabrics = JSON.stringify(["Cotton", "Silk", "Georgette", "Chiffon", "Velvet", "Organza"]);
  }
  if (typeof settings.filter_colors === "undefined") {
    settings.filter_colors = JSON.stringify([
      { name: "Red", hex: "#ef4444" },
      { name: "Blue", hex: "#3b82f6" },
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#ffffff" },
      { name: "Gold", hex: "#c9a14a" },
      { name: "Maroon", hex: "#800000" }
    ]);
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
