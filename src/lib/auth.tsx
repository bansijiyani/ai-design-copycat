"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isVerified: boolean;
  isAdminMfaVerified: boolean;
  setAdminMfaVerified: (val: boolean) => void;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdminMfaVerified, setAdminMfaVerifiedState] = useState(false);

  const setAdminMfaVerified = (val: boolean) => {
    setAdminMfaVerifiedState(val);
    if (val) {
      localStorage.setItem("admin_mfa_verified", "true");
    } else {
      localStorage.removeItem("admin_mfa_verified");
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      
      if (s?.access_token) {
        document.cookie = `sb-access-token=${s.access_token}; path=/; max-age=86400; SameSite=Lax; secure`;
      } else {
        document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }

      if (s?.user) {
        setTimeout(() => {
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", s.user.id)
            .eq("role", "admin")
            .maybeSingle()
            .then(({ data }) => setIsAdmin(!!data));
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        // Token is invalid or user was deleted
        supabase.auth.signOut();
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
      } else {
        // User is valid, grab the full session for tokens
        supabase.auth.getSession().then(({ data }) => {
          setSession(data.session);
          if (data.session?.user) {
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", data.session.user.id)
              .eq("role", "admin")
              .maybeSingle()
              .then(({ data: r }) => setIsAdmin(!!r));
          }
          setLoading(false);
        });
      }
    });

    const storedMfa = localStorage.getItem("admin_mfa_verified");
    if (storedMfa === "true") {
      setAdminMfaVerifiedState(true);
    }

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthCtx = {
    user: session?.user ?? null,
    session,
    isAdmin,
    isVerified: session?.user?.user_metadata?.is_verified === true || (session?.user?.app_metadata?.providers?.includes('google') ?? false),
    isAdminMfaVerified: isAdminMfaVerified || (session?.user?.app_metadata?.providers?.includes('google') ?? false),
    setAdminMfaVerified,
    loading,
    async signIn(email, password) {
      setAdminMfaVerified(false); // Force OTP on new manual login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message };
    },
    async signUp(email, password, username, fullName) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: siteUrl,
          data: { username, full_name: fullName },
        },
      });
      return { error: error?.message };
    },
    async signInWithGoogle() {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: siteUrl,
        },
      });
      return { error: error?.message };
    },
    async signOut() {
      setAdminMfaVerified(false);
      await supabase.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
