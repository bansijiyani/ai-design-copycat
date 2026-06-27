"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { sendOtpEmail, verifyOtp } from "@/lib/api/auth.functions";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";



export default function VerifyAdminMfa() {
  const { user, isAdmin, isAdminMfaVerified, setAdminMfaVerified } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/");
    } else if (isAdminMfaVerified) {
      router.push("/admin");
    }
  }, [user, isAdmin, isAdminMfaVerified, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      await sendOtpEmail({ data: { email: user.email, type: "admin_login" } });
      toast.success("2FA code sent to your admin email!");
      setCountdown(30);
    } catch (err: any) {
      toast.error(err.message || "Failed to send code");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (otp.length < 6) return toast.error("Please enter a valid 6-digit code");

    setVerifying(true);
    try {
      await verifyOtp({ data: { email: user.email, otp, type: "admin_login" } });
      toast.success("Admin access granted!");
      setAdminMfaVerified(true);
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded shadow-sm border border-border">
          <h1 className="font-display text-3xl font-bold mb-2">Admin Security</h1>
          <p className="text-muted-foreground text-sm mb-6">
            To access the admin dashboard, we need to verify your identity.
            Click below to send a secure code to <strong>{user.email}</strong>.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">2FA Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-maroon tracking-widest text-center text-lg font-mono"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={verifying || !otp}
                className="w-full bg-black text-white py-2.5 rounded font-semibold hover:bg-black/90 transition-colors disabled:opacity-50"
              >
                {verifying ? "VERIFYING..." : "VERIFY CODE"}
              </button>
              
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sending || countdown > 0}
                className="w-full bg-muted text-foreground py-2.5 rounded font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                {sending ? "SENDING..." : countdown > 0 ? `RESEND IN ${countdown}s` : "SEND CODE"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
