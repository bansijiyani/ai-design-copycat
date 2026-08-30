import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
  other: {
    // Google AdSense site verification. Must be present on every page, so it
    // lives in the root layout's metadata rather than a single route.
    "google-adsense-account": "ca-pub-6608424869504486",
  },
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
      </head>
      {/* Browser extensions (ColorZilla, Grammarly, MetaMask, …) inject
          attributes onto <body> before React hydrates, which otherwise logs a
          hydration mismatch. Suppression is one level deep and does not affect
          the app's own markup. */}
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
