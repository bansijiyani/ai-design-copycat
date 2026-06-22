import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api/product.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FizTopz — Premium Indian Fashion" },
      { name: "description", content: "Premium ethnic & western fashion. Sarees, lehengas, kurtas, dresses." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const edit = products.slice(0, 8);
  const justDropped = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="container mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="flex items-center gap-3 text-xs tracking-[0.3em] text-gold uppercase">
            <span className="h-px w-10 bg-gold" /> New Season 2026
          </p>
          <h1 className="font-display text-6xl lg:text-7xl xl:text-8xl leading-[0.95] mt-6">
            Wear the
            <br />
            <span className="text-gold italic">World.</span> Own
            <br />
            Every <span className="text-maroon italic">Room.</span>
          </h1>
          <div className="w-16 h-1 bg-gold mt-8" />
          <p className="mt-8 text-muted-foreground max-w-md leading-relaxed">
            Premium ethnic and western fashion for India's boldest. Every thread tells a story. Every look makes a statement.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/products" search={{ category: "sarees" }} className="px-8 py-3.5 border-2 border-gold text-gold font-semibold tracking-wider text-sm hover:bg-gold hover:text-white transition">
              SHOP ETHNIC
            </Link>
            <Link to="/products" search={{ category: "dresses" }} className="px-8 py-3.5 bg-maroon text-white font-semibold tracking-wider text-sm hover:bg-maroon/90 transition">
              SHOP WESTERN
            </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-border grid grid-cols-3 gap-6">
            {[
              { v: "10K+", l: "Happy Customers" },
              { v: "500+", l: "Styles Available" },
              { v: "4.9", l: "Average Rating", star: true },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-3xl font-display text-gold flex items-center gap-1">
                  {s.v}{s.star && <Star className="w-5 h-5 fill-gold" />}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -top-4 -left-4 right-8 bottom-8 border-2 border-gold/40 rounded-sm" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&h=1100&fit=crop" alt="Model in saree" className="w-full h-full object-cover" />
            <div className="absolute bottom-6 left-6 bg-background/95 backdrop-blur px-5 py-4 rounded-sm">
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground">NEW ARRIVAL</p>
              <p className="font-display text-lg mt-1">Bridal Collection 2026</p>
              <p className="text-gold text-sm font-semibold">From ₹4,999</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE EDIT */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-5xl">The Edit</h2>
            <div className="w-20 h-1 bg-gold mt-3" />
          </div>
          <Link to="/products" className="text-gold text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {edit.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-12">
          <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-gold text-gold font-semibold tracking-wider text-sm hover:bg-gold hover:text-white transition">
            EXPLORE ALL STYLES <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* JUST DROPPED */}
      <section className="bg-muted/40 py-20 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Fresh In</p>
              <h2 className="font-display text-5xl mt-2">Just Dropped</h2>
              <div className="w-24 h-1 bg-gold mt-3" />
            </div>
            <Link to="/products" className="text-maroon text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
              See All New <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {justDropped.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] text-muted-foreground">REVIEWS</p>
          <h2 className="font-display text-5xl mt-3">What Our Community Says</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Priya Sharma", city: "Mumbai", text: '"The quality is absolutely stunning. My Zari saree got so many compliments at the wedding. FizTopz is now my go-to for every occasion!"' },
            { name: "Arjun Mehta", city: "Delhi", text: '"Ordered a sherwani for my brother\'s wedding. The fabric, the embroidery, the fit — everything was perfect. Delivered in 3 days too!"' },
            { name: "Kavya Nair", city: "Bangalore", text: '"Love how FizTopz blends ethnic and western so effortlessly. The co-ord set I bought is my most-worn piece this season. Obsessed!"' },
          ].map((r, i) => (
            <div key={i} className="bg-card p-7 rounded-sm border border-border/50">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-4 h-4 fill-gold text-gold" />)}
              </div>
              <p className="text-sm italic text-foreground/80 leading-relaxed">{r.text}</p>
              <div className="mt-5 flex items-center gap-3 pt-5 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-gold/20 grid place-items-center font-display text-gold">{r.name[0]}</div>
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-forest text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <p className="text-xs tracking-[0.3em] text-white/70">NEWSLETTER</p>
          <h2 className="font-display text-5xl mt-3 text-white">Stay Ahead of the Trend</h2>
          <p className="mt-5 text-white/70">Get early access to new drops, exclusive offers & style inspiration — straight to your inbox.</p>
          <form className="mt-8 flex flex-col sm:flex-row gap-3">
            <input type="email" placeholder="Enter your email address" className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-sm text-white placeholder-white/50 focus:outline-none focus:border-gold" />
            <button type="submit" className="px-8 py-3.5 bg-gold text-white font-semibold tracking-wider text-sm hover:bg-gold/90 transition">SUBSCRIBE</button>
          </form>
          <p className="text-xs text-white/50 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
