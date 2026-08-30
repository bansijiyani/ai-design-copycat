/**
 * Central SEO configuration.
 *
 * Everything that needs the site's public origin (canonical URLs, sitemap
 * entries, structured data, Open Graph images) reads SITE_URL from here so the
 * domain is defined exactly once.
 */

const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

/**
 * The canonical public origin, without a trailing slash.
 *
 * NEXT_PUBLIC_SITE_URL is "http://localhost:3000" during local development.
 * A localhost value must never reach a canonical tag or a sitemap entry — it
 * would tell Google the real page lives on a host it cannot reach — so
 * localhost is explicitly ignored in favour of the production domain.
 */
export const SITE_URL =
  envUrl && !envUrl.includes("localhost")
    ? envUrl.replace(/\/+$/, "")
    : "https://www.fiztopz.com";

export const SITE_NAME = "FizTopz";

export const SITE_DESCRIPTION =
  "Premium ethnic and western fashion for India's boldest. Shop sarees, lehengas, kurtas, dresses, co-ords and denim with pan-India delivery.";

/** Official profiles. Used for the Organization `sameAs` property, which is how
 *  Google links a brand name to its verified social presence. */
export const SOCIAL_PROFILES = [
  "https://www.instagram.com/fiztopz_saree/",
  "https://www.facebook.com/FizTopz",
];

export const CONTACT_PHONE = "+91-99048-60460";
export const CONTACT_EMAIL = "fiztopzfeb@gmail.com";

export const LOGO_URL = `${SITE_URL}/header-logo.png`;
