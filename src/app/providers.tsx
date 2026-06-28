"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isVerified, isAdmin, isAdminMfaVerified, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    
    // Check custom Registration OTP verification
    if (user && !isVerified && pathname !== "/verify-email") {
      router.replace("/verify-email");
      return;
    }

    // Check Admin MFA verification
    if (isAdmin && pathname?.startsWith("/admin") && !isAdminMfaVerified && pathname !== "/admin/verify-mfa") {
      router.replace("/admin/verify-mfa");
      return;
    }
  }, [user, isVerified, isAdmin, isAdminMfaVerified, loading, pathname, router]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          {children}
        </AuthGuard>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
