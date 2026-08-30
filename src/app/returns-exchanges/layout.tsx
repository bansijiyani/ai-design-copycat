import type { Metadata } from "next";

// A layout stays a Server Component even when its page.tsx is "use client",
// which is what makes a metadata export possible here.
export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "FizTopz return and exchange policy: eligible orders can be returned within 3 days of delivery.",
  alternates: { canonical: "/returns-exchanges" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
