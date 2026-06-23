import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-display">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold/90 transition">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-display">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold/90 transition"
          >
            Try again
          </button>
          <a href="/" className="rounded border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FizTopz — Premium Indian Fashion" },
      { name: "description", content: "Premium ethnic and western fashion for India's boldest. Sarees, lehengas, kurtas, dresses & more." },
      { property: "og:title", content: "FizTopz — Premium Indian Fashion" },
      { property: "og:description", content: "Premium ethnic and western fashion for India's boldest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <Outlet />
        </AuthGuard>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isVerified, isAdmin, isAdminMfaVerified, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const path = router.state.location.pathname;

    // Check custom Registration OTP verification
    if (user && !isVerified && path !== "/verify-email") {
      router.navigate({ to: "/verify-email", replace: true });
      return;
    }

    // Check Admin MFA verification
    if (isAdmin && path.startsWith("/admin") && !isAdminMfaVerified && path !== "/admin/verify-mfa") {
      router.navigate({ to: "/admin/verify-mfa", replace: true });
      return;
    }
  }, [user, isVerified, isAdmin, isAdminMfaVerified, loading, router.state.location.pathname]);

  return <>{children}</>;
}
