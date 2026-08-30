import type { Metadata } from "next";

// A layout stays a Server Component even when its page.tsx is "use client",
// which is what makes a metadata export possible here.
export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with FizTopz for order help, sizing advice or wholesale enquiries. Pan-India delivery and easy returns.",
  alternates: { canonical: "/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
