import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Account — FizTopz" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [show, setShow] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const perks = ["Exclusive member-only discounts", "Order tracking & history", "Save your wishlist forever", "Faster checkout with saved addresses"];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signUp(email, password, username, fullName);
    setBusy(false);
    if (error) return toast.error(error);
    toast.success("Account created! You're signed in.");
    setTimeout(() => navigate({ to: username === "fiztopz_admin" ? "/admin" : "/" }), 400);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-7rem)]">
        <div className="bg-forest text-white p-12 lg:p-20 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)" }} />
          <div className="relative">
            <Logo className="!text-white !text-4xl" />
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
            <p className="text-sm text-muted-foreground mt-3">Already have an account? <Link to="/login" className="text-gold font-semibold">Sign in</Link></p>
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
                  <input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="username (use fiztopz_admin for admin)" className="w-full pl-10 pr-4 py-3 bg-muted rounded-sm focus:outline-none focus:ring-1 focus:ring-gold" />
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
              <button disabled={busy} type="submit" className="w-full bg-gold text-white py-3.5 font-semibold tracking-wider text-sm hover:bg-gold/90 transition flex items-center justify-center gap-2 disabled:opacity-60">
                {busy ? "CREATING..." : "CREATE ACCOUNT"} <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-center text-muted-foreground">Tip: Sign up with username <span className="font-semibold text-gold">fiztopz_admin</span> to get admin access.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
