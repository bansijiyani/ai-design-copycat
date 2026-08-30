import type { Metadata } from "next";

// A layout stays a Server Component even when its page.tsx is "use client",
// which is what makes a metadata export possible here.
export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Free shipping on orders above Rs 1999. National delivery across India in 7 to 15 business days.",
  alternates: { canonical: "/shipping-policy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
