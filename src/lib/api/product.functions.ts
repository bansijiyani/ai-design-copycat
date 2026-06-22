import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Public: Fetch Products ─────────────────────────────────────────────────

export const getProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        category_data:categories(*),
        variants:product_variants(*),
        product_images(*)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const getProductById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        category_data:categories(*),
        variants:product_variants(*),
        product_images(*)
      `)
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const getProductsByCategory = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data: { slug } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // First get category id from slug
    const { data: cat } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!cat) return [];

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        category_data:categories(*),
        variants:product_variants(*),
        product_images(*)
      `)
      .eq("category_id", cat.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

// ─── Admin: Product CRUD ────────────────────────────────────────────────────

const productInputSchema = z.object({
  name: z.string().min(1),
  brand: z.string().default("FIZTOPZ"),
  category: z.string(),
  category_id: z.string().uuid().nullable().optional(),
  section: z.string().default("ethnic"),
  price: z.number().min(0),
  old_price: z.number().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  images: z.array(z.string()).optional(),
  variants: z.array(z.object({
    id: z.string().uuid().optional(),
    sku: z.string().nullable().optional(),
    size: z.string().nullable().optional(),
    color_name: z.string().nullable().optional(),
    color_hex: z.string().nullable().optional(),
    price_override: z.number().nullable().optional(),
    stock: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
    images: z.array(z.string()).optional(),
  })).optional(),
});

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator(productInputSchema)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Insert the product
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert({
        name: input.name,
        brand: input.brand,
        category: input.category,
        category_id: input.category_id ?? null,
        section: input.section,
        price: input.price,
        old_price: input.old_price ?? null,
        stock: input.stock,
        sku: input.sku ?? null,
        image: input.image ?? null,
        description: input.description ?? null,
        is_active: input.is_active,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Insert variants if provided
    if (input.variants?.length) {
      const { error: vErr } = await supabaseAdmin
        .from("product_variants")
        .insert(input.variants.map((v) => ({
          product_id: product.id,
          sku: v.sku ?? null,
          size: v.size ?? null,
          color_name: v.color_name ?? null,
          color_hex: v.color_hex ?? null,
          price_override: v.price_override ?? null,
          stock: v.stock,
          is_active: v.is_active,
          images: v.images ?? [],
        })));
      if (vErr) throw new Error(vErr.message);
    }

    // Insert images if provided
    if (input.images?.length) {
      const { error: iErr } = await supabaseAdmin
        .from("product_images")
        .insert(input.images.map((url, idx) => ({
          product_id: product.id,
          url,
          sort_order: idx,
        })));
      if (iErr) throw new Error(iErr.message);
    }

    return product;
  });

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }).merge(productInputSchema.partial()))
  .handler(async ({ data: { id, variants, images, ...fields } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Update the product fields — build a typed payload
    const updatePayload: any = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updatePayload[key] = value;
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabaseAdmin
        .from("products")
        .update(updatePayload)
        .eq("id", id);
      if (error) throw new Error(error.message);
    }

    // Replace variants if provided
    if (variants !== undefined) {
      // Delete existing variants
      await supabaseAdmin.from("product_variants").delete().eq("product_id", id);
      // Insert new variants
      if (variants.length > 0) {
        const { error: vErr } = await supabaseAdmin
          .from("product_variants")
          .insert(variants.map((v) => ({
            product_id: id,
            sku: v.sku ?? null,
            size: v.size ?? null,
            color_name: v.color_name ?? null,
            color_hex: v.color_hex ?? null,
            price_override: v.price_override ?? null,
            stock: v.stock,
            is_active: v.is_active,
            images: v.images ?? [],
          })));
        if (vErr) throw new Error(vErr.message);
      }
    }

    // Replace images if provided
    if (images !== undefined) {
      await supabaseAdmin.from("product_images").delete().eq("product_id", id);
      if (images.length > 0) {
        const { error: iErr } = await supabaseAdmin
          .from("product_images")
          .insert(images.map((url, idx) => ({
            product_id: id,
            url,
            sort_order: idx,
          })));
        if (iErr) throw new Error(iErr.message);
      }
    }

    return { success: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data: { id } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Soft delete — just hide the product
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ─── Admin: Fetch All Products (including inactive) ─────────────────────────

export const getAdminProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        category_data:categories(id, name, slug),
        variants:product_variants(*),
        product_images(*)
      `)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });
