import Script from "next/script";

/**
 * Google Tag Manager.
 *
 * The container ID is read from NEXT_PUBLIC_GTM_ID. When it is unset — the
 * normal state for local development — both halves render nothing, so dev
 * activity never reaches the production container.
 *
 * GTM ships in two parts that must live in different places:
 *   <GoogleTagManager />         — the loader, in <head>
 *   <GoogleTagManagerNoScript /> — the iframe fallback, first child of <body>
 *
 * IMPORTANT: GA4 is already installed directly in GoogleAnalytics.tsx. Do not
 * also create a GA4 Configuration tag inside the GTM UI, or every page view is
 * counted twice. Either keep GA4 direct (current setup) or move it into GTM —
 * never both.
 */

// Must be referenced statically: Next inlines NEXT_PUBLIC_* at build time.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}

/**
 * Fallback for visitors with JavaScript disabled. Must be rendered as the
 * first element inside <body>.
 */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
