"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { sendOtpEmail, verifyOtp } from "@/lib/api/auth.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";



export default function VerifyEmail() {
  const { user, isVerified, signOut } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const autoSentRef = useRef(false);

  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (isVerified) {
      router.push("/");
    }
  }, [user, isVerified, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (targetEmail: string = user?.email || "") => {
    if (!targetEmail) return;
    setSending(true);
    try {
      await sendOtpEmail({ data: { email: targetEmail, type: "signup" } });
      toast.success("Verification code sent to your email!");
      setCountdown(30); // 30s cooldown
    } catch (err: any) {
      toast.error(err.message || "Failed to send code");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (user?.email && !isVerified && !autoSentRef.current) {
      autoSentRef.current = true;
      handleSendOtp(user.email);
    }
  }, [user, isVerified]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (otp.length < 6) return toast.error("Please enter a valid 6-digit code");

    setVerifying(true);
    try {
      await verifyOtp({ data: { email: user.email, otp, type: "signup" } });
      // Refresh the local session so `isVerified` metadata updates instantly
      await supabase.auth.refreshSession();
      toast.success("Email verified successfully!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === user?.email) return;
    setUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Email address updated!");
      setIsChangingEmail(false);
      autoSentRef.current = false; // will trigger auto-send to new email
      setOtp("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update email");
    } finally {
      setUpdatingEmail(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded shadow-sm border border-border">
          {isChangingEmail ? (
            <>
              <h1 className="font-display text-3xl font-bold mb-2">Change Email</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Enter your correct email address below.
              </p>
              <form onSubmit={handleChangeEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">New Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-maroon"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={updatingEmail || !newEmail}
                    className="w-full bg-maroon text-white py-2.5 rounded font-semibold hover:bg-maroon/90 transition-colors disabled:opacity-50"
                  >
                    {updatingEmail ? "UPDATING..." : "UPDATE EMAIL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingEmail(false)}
                    className="w-full bg-muted text-foreground py-2.5 rounded font-semibold hover:bg-muted/80 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold mb-2">Verify Email</h1>
              <p className="text-muted-foreground text-sm mb-6">
                We need to verify your email address before you can continue.
                A code has been sent to <strong>{user.email}</strong>.
              </p>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Verification Code</label>
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
                    className="w-full bg-maroon text-white py-2.5 rounded font-semibold hover:bg-maroon/90 transition-colors disabled:opacity-50"
                  >
                    {verifying ? "VERIFYING..." : "VERIFY CODE"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleSendOtp(user.email)}
                    disabled={sending || countdown > 0}
                    className="w-full bg-muted text-foreground py-2.5 rounded font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    {sending ? "SENDING..." : countdown > 0 ? `RESEND IN ${countdown}s` : "RESEND CODE"}
                  </button>

                  <div className="pt-4 flex items-center justify-between text-sm">
                    <button 
                      type="button" 
                      onClick={() => setIsChangingEmail(true)} 
                      className="text-maroon hover:underline font-medium"
                    >
                      Wrong email?
                    </button>
                    <button 
                      type="button" 
                      onClick={() => signOut().then(() => router.push("/login"))} 
                      className="text-muted-foreground hover:underline"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
