import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Served at /robots.txt.
 *
 * Only routes that must never be fetched are listed here. Everything else that
 * should stay out of search results uses a `noindex` metadata export instead
 * (see NOINDEX in @/lib/seo).
 *
 * The distinction matters: `Disallow` blocks the crawl, so Google never reads
 * the page's noindex directive. A URL already in the index — /cart and /login
 * both were — then stays there permanently, because the instruction to remove
 * it can never be delivered. Those routes are deliberately crawlable now so
 * their noindex can be seen and acted on.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Auth-gated and never useful to a crawler.
        "/admin",
        "/admin/",
        "/profile",
        "/profile/",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
