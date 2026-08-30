import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Served at /robots.txt.
 *
 * Account and transactional routes are excluded: they hold no search value,
 * they are per-user, and letting Google spend crawl budget on them slows
 * discovery of the product pages that should rank.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/profile",
        "/profile/",
        "/cart",
        "/wishlist",
        "/login",
        "/signup",
        "/verify-email",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
