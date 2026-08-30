import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";

// Must be referenced statically: Next inlines NEXT_PUBLIC_* at build time.
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export const metadata: Metadata = {
  title: "FizTopz — Premium Indian Fashion",
  description: "Premium ethnic and western fashion for India's boldest. Sarees, lehengas, kurtas, dresses & more.",
  openGraph: {
    title: "FizTopz — Premium Indian Fashion",
    description: "Premium ethnic and western fashion for India's boldest.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
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
