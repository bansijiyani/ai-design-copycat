/**
 * Shared product types derived from the database schema.
 * Replaces the old static Product type from products.ts.
 */

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  size: string | null;
  color_name: string | null;
  color_hex: string | null;
  price_override: number | null;
  stock: number;
  is_active: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  section: string;
  image: string | null;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  category_id: string | null;
  section: string;
  price: number;
  old_price: number | null;
  stock: number;
  sku: string | null;
  image: string | null;
  images: unknown;
  colors: unknown;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations (may be absent depending on query)
  category_rel?: Category | null;
  variants?: ProductVariant[];
  product_images?: ProductImage[];
};

/**
 * Flattened product type returned by server functions that join relations.
 * The `category` field from the join is renamed to avoid collision with the text column.
 */
export type ProductWithRelations = Omit<Product, "category_rel"> & {
  category: string; // the text column
  variants: ProductVariant[];
  product_images: ProductImage[];
};
