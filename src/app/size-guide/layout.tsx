import type { Metadata } from "next";

// A layout stays a Server Component even when its page.tsx is "use client",
// which is what makes a metadata export possible here.
export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your fit with the FizTopz size guide for sarees, lehengas, kurtas, dresses and co-ords.",
  alternates: { canonical: "/size-guide" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
