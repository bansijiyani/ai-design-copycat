import Script from "next/script";

/**
 * Google AdSense ad-serving script (Auto ads).
 *
 * Reuses NEXT_PUBLIC_ADSENSE_ID — the same publisher ID that powers the
 * site-verification meta tag in the root layout — so the value is defined once.
 * Renders nothing when unset, keeping ads off local development.
 *
 * Where ads actually appear is controlled in the AdSense dashboard, not here.
 * Auto ads will happily inject units into the cart and checkout flow unless
 * those paths are listed under Ad settings → Excluded pages.
 */

// Must be referenced statically: Next inlines NEXT_PUBLIC_* at build time.
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export function GoogleAdSense() {
  if (!ADSENSE_ID) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
