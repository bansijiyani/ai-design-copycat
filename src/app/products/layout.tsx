import type { Metadata } from "next";

// A layout stays a Server Component even when its page.tsx is "use client",
// which is what makes a metadata export possible here.
export const metadata: Metadata = {
  title: "Shop All — Sarees, Lehengas, Kurtas & Dresses",
  description:
    "Browse the full FizTopz collection: sarees, lehengas, kurtas, kurtis, shararas, ghararas, co-ords, dresses and denim. Pan-India delivery.",
  alternates: { canonical: "/products" },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
