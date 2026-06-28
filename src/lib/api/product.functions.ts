"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getProducts() {
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
}

export async function getProductById({ data: { id } }: { data: { id: string } }) {
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
}

export async function getProductsByIds({ data: { ids } }: { data: { ids: string[] } }) {
  if (!ids || ids.length === 0) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      price,
      stock,
      is_active,
      variants:product_variants(id, price_override, stock, is_active, color_name, size)
    `)
    .in("id", ids);
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductsByCategory({ data: { slug } }: { data: { slug: string } }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
}

export async function createProduct({ data: input }: { data: any }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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

  if (input.variants?.length) {
    const { error: vErr } = await supabaseAdmin
      .from("product_variants")
      .insert(input.variants.map((v: any) => ({
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

  if (input.images?.length) {
    const { error: iErr } = await supabaseAdmin
      .from("product_images")
      .insert(input.images.map((url: string, idx: number) => ({
        product_id: product.id,
        url,
        sort_order: idx,
      })));
    if (iErr) throw new Error(iErr.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return product;
}

export async function updateProduct({ data: { id, variants, images, ...fields } }: { data: any }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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

  if (variants !== undefined) {
    await supabaseAdmin.from("product_variants").delete().eq("product_id", id);
    if (variants.length > 0) {
      const { error: vErr } = await supabaseAdmin
        .from("product_variants")
        .insert(variants.map((v: any) => ({
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

  if (images !== undefined) {
    await supabaseAdmin.from("product_images").delete().eq("product_id", id);
    if (images.length > 0) {
      const { error: iErr } = await supabaseAdmin
        .from("product_images")
        .insert(images.map((url: string, idx: number) => ({
          product_id: id,
          url,
          sort_order: idx,
        })));
      if (iErr) throw new Error(iErr.message);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true };
}

export async function deleteProduct({ data: { id } }: { data: { id: string } }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true };
}

export async function getAdminProducts() {
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
}
