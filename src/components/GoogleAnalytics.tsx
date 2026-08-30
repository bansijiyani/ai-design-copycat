import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js).
 *
 * The measurement ID is read from NEXT_PUBLIC_GA_MEASUREMENT_ID. When it is
 * unset — which is the normal state for local development — this renders
 * nothing, so dev traffic never reaches the production property.
 *
 * Page views on client-side navigation are handled by GA4's Enhanced
 * Measurement ("Page changes based on browser history events", on by default),
 * which fires on the History API pushes that the Next.js router performs.
 * Do not also send manual page_view events here or every navigation is counted
 * twice.
 */

// Must be referenced statically: Next inlines NEXT_PUBLIC_* at build time.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
