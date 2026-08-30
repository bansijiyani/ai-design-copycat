import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// A layout stays a Server Component even when its page.tsx is "use client",
// which is what makes a metadata export possible here.
export const metadata: Metadata = NOINDEX;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
