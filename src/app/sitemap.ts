import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getProducts } from "@/lib/api/product.functions";

// Rebuild the sitemap hourly so newly added products are discoverable without
// a redeploy.
export const revalidate = 3600;

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/products", priority: 0.9, changeFrequency: "daily" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.4, changeFrequency: "monthly" },
  { path: "/size-guide", priority: 0.4, changeFrequency: "monthly" },
  { path: "/shipping-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/returns-exchanges", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // A database hiccup must not fail the build. Falling back to the static
  // routes keeps a valid sitemap online rather than returning a 500.
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productEntries = (products ?? []).map((product: any) => ({
      url: `${SITE_URL}/products/${product.id}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] Could not load products:", error);
  }

  return [...staticEntries, ...productEntries];
}
