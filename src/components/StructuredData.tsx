import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SOCIAL_PROFILES,
  CONTACT_PHONE,
  CONTACT_EMAIL,
  LOGO_URL,
} from "@/lib/seo";

/**
 * Site-wide JSON-LD.
 *
 * Organization is what connects the brand name "FizTopz" to this domain, its
 * logo and its verified social profiles — the signal Google uses to decide
 * which result is the official site for a branded query, and what to show in a
 * knowledge panel.
 *
 * WebSite carries the site name used for sitelinks.
 *
 * Rendered as a plain <script> rather than next/script because search crawlers
 * read structured data from the server HTML; a deferred script may be missed.
 */
export function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: LOGO_URL,
        },
        description: SITE_DESCRIPTION,
        sameAs: SOCIAL_PROFILES,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: CONTACT_PHONE,
          email: CONTACT_EMAIL,
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["en", "hi", "gu"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-IN",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
