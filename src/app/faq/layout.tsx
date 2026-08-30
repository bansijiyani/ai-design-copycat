import type { Metadata } from "next";

// A layout stays a Server Component even when its page.tsx is "use client",
// which is what makes a metadata export possible here.
export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about FizTopz orders, shipping, sizing, returns and payments.",
  alternates: { canonical: "/faq" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
