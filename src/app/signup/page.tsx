"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
export default function SignupPage() {
  const [show, setShow] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const perks = ["Exclusive member-only discounts", "Order tracking & history", "Save your wishlist forever", "Faster checkout with saved addresses"];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signUp(email, password, username, fullName);
    setBusy(false);
    if (error) return toast.error(error);
    toast.success("Account created! You're signed in.");
    setTimeout(() => router.push("/"), 400);
  };

  const onGoogleSignIn = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle();
    setBusy(false);
    if (error) return toast.error(error);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-7rem)]">
        <div className="bg-forest text-white p-12 lg:p-20 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)" }} />
          <div className="relative">
            <Logo variant="footer" className="h-40 scale-[2.5] origin-center" />
            <h2 className="font-display text-4xl mt-10">Join FizTopz</h2>
            <p className="mt-5 text-white/80 max-w-sm">Create your account and unlock exclusive deals, early access to new collections, and a seamless shopping experience.</p>
            <ul className="mt-10 space-y-4 text-left max-w-sm mx-auto">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 grid place-items-center"><Check className="w-3.5 h-3.5" /></span>
                  <span className="text-sm">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h1 className="font-display text-5xl">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-3">Already have an account? <Link href="/login" className="text-gold font-semibold">Sign in</Link></p>
            <form onSubmit={onSubmit} className="mt-10 space-y-5">
              <div>
                <label className="text-xs font-semibold">Full Name</label>
                <div className="mt-2 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your full name" className="w-full pl-10 pr-4 py-3 bg-muted rounded-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold">Username</label>
                <div className="mt-2 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter Your Username" className="w-full pl-10 pr-4 py-3 bg-muted rounded-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold">Email Address</label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 bg-muted rounded-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold">Password</label>
                <div className="mt-2 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} type={show ? "text" : "password"} placeholder="At least 6 characters" className="w-full pl-10 pr-10 py-3 bg-muted rounded-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button disabled={busy} type="submit" className="w-full bg-gold text-white py-3.5 font-semibold tracking-wider text-sm hover:bg-gold/90 transition flex items-center justify-center gap-2 disabled:opacity-60 rounded-sm">
                {busy ? "CREATING..." : "CREATE ACCOUNT"} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">Or continue with</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <button 
                type="button" 
                onClick={onGoogleSignIn}
                disabled={busy} 
                className="w-full bg-white text-black border border-gray-300 py-3.5 font-semibold tracking-wider text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-60 rounded-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                GOOGLE
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
