import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import { StructuredData } from "@/components/StructuredData";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

// Must be referenced statically: Next inlines NEXT_PUBLIC_* at build time.
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  // Resolves every relative canonical / Open Graph URL below against the real
  // domain. Without it Next emits relative OG URLs, which crawlers and social
  // scrapers cannot fetch.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Premium Indian Fashion`,
    // Child pages set only their own name; the brand is appended automatically.
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Reinforces the brand ↔ domain association for branded searches.
  keywords: [
    "FizTopz",
    "FizTopz sarees",
    "Indian ethnic wear",
    "sarees online",
    "lehengas",
    "kurtas",
    "western dresses",
    "Sharara pair",
    "Gharara Pair",
    "Kurtis"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} - Premium Indian Fashion`,
    description: SITE_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [{ url: "/header-logo.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Premium Indian Fashion`,
    description: SITE_DESCRIPTION,
    images: ["/header-logo.png"],
  },
  // Google Search Console ownership. Renders
  // <meta name="google-site-verification" content="…" />.
  // Removing this un-verifies the property and revokes Search Console access,
  // so the static file in /public acts as a redundant second proof.
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/header-logo.png",
  },
  // Google AdSense site verification. Must be present on every page, so it
  // lives in the root layout's metadata rather than a single route.
  // Omitted entirely when NEXT_PUBLIC_ADSENSE_ID is unset, so a missing
  // environment variable never renders an empty content="" tag.
  ...(ADSENSE_ID
    ? { other: { "google-adsense-account": ADSENSE_ID } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <GoogleTagManager />
        <StructuredData />
      </head>
      {/* Browser extensions (ColorZilla, Grammarly, MetaMask, …) inject
          attributes onto <body> before React hydrates, which otherwise logs a
          hydration mismatch. Suppression is one level deep and does not affect
          the app's own markup. */}
      <body suppressHydrationWarning>
        {/* Must be the first element inside <body> per GTM's install spec. */}
        <GoogleTagManagerNoScript />
        <Providers>
          {children}
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
