import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — FizTopz" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) return toast.error(error);
    toast.success("Welcome back!");
    // brief delay to let auth state settle for role check
    setTimeout(() => navigate({ to: "/admin" }).catch(() => navigate({ to: "/" })), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-7rem)]">
        <div className="bg-gold text-white p-12 lg:p-20 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)" }} />
          <div className="relative">
            <Logo className="!text-white !text-4xl" />
            <h2 className="font-display text-5xl mt-10">Welcome Back</h2>
            <p className="mt-5 text-white/80 max-w-sm">Sign in to track your orders, manage your wishlist, and enjoy a personalised shopping experience.</p>
            <div className="grid grid-cols-3 gap-3 mt-12 max-w-sm">
              {[{ v: "50K+", l: "Happy Customers" }, { v: "10K+", l: "Products" }, { v: "4.8★", l: "Avg Rating" }].map((s) => (
                <div key={s.l} className="bg-white/10 p-4 rounded-sm">
                  <p className="font-display text-xl">{s.v}</p>
                  <p className="text-[10px] mt-1 text-white/70">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h1 className="font-display text-5xl">Sign In</h1>
            <p className="text-sm text-muted-foreground mt-3">New to FizTopz? <Link to="/signup" className="text-gold font-semibold">Create an account</Link></p>
            <form onSubmit={onSubmit} className="mt-10 space-y-5">
              <div>
                <label className="text-xs font-semibold">Email Address</label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 bg-muted rounded-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold"><span>Password</span><a href="#" className="text-gold">Forgot password?</a></div>
                <div className="mt-2 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} required type={show ? "text" : "password"} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 bg-muted rounded-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button disabled={busy} type="submit" className="w-full bg-gold text-white py-3.5 font-semibold tracking-wider text-sm hover:bg-gold/90 transition flex items-center justify-center gap-2 disabled:opacity-60">
                {busy ? "SIGNING IN..." : "SIGN IN"} <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-center text-muted-foreground">Admin? Sign in with the <span className="text-gold font-semibold">fiztopz_admin</span> account to access the admin panel.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
