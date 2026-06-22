import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Grid3x3, List, ArrowUpDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api/product.functions";
import { getCategories } from "@/lib/api/admin.functions";

type Search = { category?: string; search?: string };

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    search: typeof s.search === "string" ? s.search : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — FizTopz" },
      { name: "description", content: "Browse our collection of ethnic and western fashion." },
    ],
  }),
  component: ProductsPage,
});

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-sm font-semibold tracking-wide">
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function ProductsPage() {
  const { category, search } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sizes, setSizes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(search || "");
  const [sortOption, setSortOption] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);

  const sortLabels: Record<string, string> = {
    "featured": "Featured",
    "price-low": "Price: Low to High",
    "price-high": "Price: High to Low",
    "newest": "Newest"
  };

  useEffect(() => {
    if (search !== undefined) {
      setSearchQuery(search);
    }
  }, [search]);

  // Fetch products from database
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const active = category ?? "all";

  // Filter products
  let filtered = products as any[];
  if (active !== "all") {
    filtered = filtered.filter(
      (p) => p.category === active || p.category?.slug === active,
    );
  }
  filtered = filtered.filter((p) => Number(p.price) <= maxPrice);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    );
  }

  // Sort products
  if (sortOption === "price-low") {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortOption === "price-high") {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortOption === "newest") {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const setCategory = (c: string) => navigate({ search: c === "all" ? {} : { category: c } });

  // Build category list: "all" + active database categories
  const categoryList = ["all", ...categories.filter((c: any) => c.is_active !== false).map((c: any) => c.slug)];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-gold">Home</Link> / <span className="text-foreground capitalize">{active}</span>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[280px_1fr] gap-10">
        {/* Sidebar */}
        <aside>
          <div>
            <h1 className="font-display text-5xl capitalize">{active === "all" ? "Shop" : active}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {productsLoading ? "Loading…" : `${filtered.length} products found`}
            </p>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs tracking-[0.2em] font-semibold">FILTERS</span>
              <span className="w-6 h-6 rounded-full bg-gold text-white text-xs grid place-items-center">{active !== "all" ? 1 : 0}</span>
            </div>

            <input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mt-4 px-4 py-2.5 text-sm bg-muted rounded-sm focus:outline-none focus:ring-1 focus:ring-gold"
            />

            <Section title="Category">
              <ul className="space-y-2">
                {categoryList.map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => setCategory(c)}
                      className={`w-full text-left px-3 py-2 text-sm capitalize rounded-sm transition ${active === c ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted"}`}
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Price Range">
              <div className="flex justify-between text-xs text-muted-foreground"><span>₹0</span><span>₹20,000</span></div>
              <input type="range" min={0} max={20000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full mt-2 accent-[var(--gold)]" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <input value={0} readOnly className="px-3 py-1.5 text-sm bg-muted rounded-sm" />
                <input value={maxPrice} readOnly className="px-3 py-1.5 text-sm bg-muted rounded-sm" />
              </div>
            </Section>

            <Section title="Size">
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((s) => {
                  const on = sizes.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => setSizes(on ? sizes.filter((x) => x !== s) : [...sizes, s])}
                      className={`px-3 py-1.5 text-xs border rounded-sm transition ${on ? "border-gold bg-gold/10 text-gold" : "border-border hover:border-gold"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            {active !== "all" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-sm text-sm capitalize">
                {active} <button onClick={() => setCategory("all")}><X className="w-3 h-3" /></button>
              </div>
            ) : <div />}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setSortOpen(!sortOpen)}
                  onBlur={() => setTimeout(() => setSortOpen(false), 200)}
                  className="flex items-center gap-2 pl-4 pr-3 py-2 border border-border hover:border-gold rounded-sm text-sm bg-background transition outline-none min-w-[180px] justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {sortLabels[sortOption]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>

                {sortOpen && (
                  <div className="absolute top-full right-0 mt-1 w-full bg-background border border-border shadow-lg rounded-sm py-1 z-10">
                    {Object.entries(sortLabels).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => {
                          setSortOption(val);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition hover:text-gold hover:bg-muted ${sortOption === val ? "text-gold bg-gold/5 font-medium" : ""}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex border border-border rounded-sm">
                <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-gold text-white" : ""}`}><Grid3x3 className="w-4 h-4" /></button>
                <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-gold text-white" : ""}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          {productsLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No products match your filters.</div>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
              {filtered.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
