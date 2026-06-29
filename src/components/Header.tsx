"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, User, ChevronDown, Shield, LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useCart, useWishlist } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductsByIds } from "@/lib/api/product.functions";
import { getSettings } from "@/lib/api/settings.functions";

export function TopBar() {
  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => getSettings(),
  });
  
  const threshold = settings?.free_shipping_threshold ?? "999";

  return (
    <div className="bg-gold text-promo-foreground text-xs tracking-wide">
      <div className="container mx-auto px-4 py-2.5 text-center">
        FREE SHIPPING ON ORDERS ABOVE ₹{threshold} &middot; EASY RETURNS ON APPLICABLE ITEMS &middot; PAN-INDIA DELIVERY
      </div>
    </div>
  );
}

export function Header() {
  const cartItems = useCart((s) => s.items);
  const cartCount = cartItems.reduce((a, b) => a + b.qty, 0);
  const syncPrices = useCart((s) => s.syncPrices);
  const wishCount = useWishlist((s) => s.ids.length);
  const { user, isAdmin, signOut } = useAuth();

  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: products } = useQuery({
    queryKey: ["products", "search"],
    queryFn: () => getProducts(),
    enabled: searchOpen,
  });

  const suggestions = query.trim()
    ? products?.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  // Sync Cart Prices
  const productIds = Array.from(new Set(cartItems.map((i) => i.id)));
  const { data: latestCartProducts } = useQuery({
    queryKey: ["cart-prices", productIds],
    queryFn: () => getProductsByIds({ data: { ids: productIds } }),
    enabled: productIds.length > 0,
    staleTime: 60 * 1000, // 1 min
  });

  useEffect(() => {
    if (latestCartProducts && latestCartProducts.length > 0) {
      syncPrices(latestCartProducts);
    }
  }, [latestCartProducts, syncPrices]);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Ethnic", search: { category: "sarees" }, hasMenu: true,
      subMenu: [
        { label: "Sarees", category: "sarees" },
        { label: "Kurtas", category: "kurtas" },
        { label: "Lehengas", category: "lehengas" },
        { label: "Sherwanis", category: "sherwanis" },
      ]
    },
    { to: "/products", label: "Western", search: { category: "dresses" }, hasMenu: true,
      subMenu: [
        { label: "Dresses", category: "dresses" },
        { label: "Tops", category: "tops" },
        { label: "Co-ords", category: "co-ords" },
        { label: "Denim", category: "denim" },
      ]
    },
    { to: "/products", label: "New Arrivals", search: {} },
    { to: "/products", label: "Sale", search: {} },
  ];

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center sm:gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 -ml-2 hover:text-gold transition">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left font-display text-2xl">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-6">
                  {navItems.map((item) => (
                    <div key={item.label}>
                      <Link
                        href={item.search ? { pathname: item.to, query: item.search } : item.to}
                        className="text-lg font-medium hover:text-gold transition block"
                      >
                        {item.label}
                      </Link>
                      {item.hasMenu && item.subMenu && (
                        <div className="mt-4 flex flex-col gap-4 pl-4 border-l-2 border-gold/20">
                          {item.subMenu.map((sub) => (
                            <Link
                              key={sub.label}
                              href={{ pathname: "/products", query: { category: sub.category } }}
                              className="text-sm text-muted-foreground hover:text-gold transition"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Logo className="h-14 sm:h-15 lg:h-20 scale-[1.8] sm:scale-[1.9] lg:scale-[1.8] origin-left ml-1 lg:ml-0" />
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative group py-6 -my-6">
                <Link
                  href={item.search ? { pathname: item.to, query: item.search } : item.to}
                  className="text-sm font-medium text-foreground/80 hover:text-gold transition flex items-center gap-1"
                >
                  {item.label}
                  {item.hasMenu && <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />}
                </Link>
                {item.hasMenu && item.subMenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 hidden group-hover:block z-50">
                    <div className="bg-background border border-border shadow-xl rounded-md py-2 overflow-hidden">
                      {item.subMenu.map((sub) => (
                        <Link
                          key={sub.label}
                          href={{ pathname: "/products", query: { category: sub.category } }}
                          className="block px-5 py-2.5 text-sm font-medium text-foreground/80 hover:text-gold hover:bg-gold/5 transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            {searchOpen ? (
              <div className="relative mr-2">
                <form onSubmit={handleSearch} className="flex items-center border border-border rounded-sm overflow-hidden bg-background">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent text-sm px-3 py-1.5 w-40 outline-none"
                    onBlur={() => {
                      // Small delay to allow click on suggestion to register before closing
                      setTimeout(() => {
                        if (!query) setSearchOpen(false);
                      }, 200);
                    }}
                  />
                  <button type="submit" className="p-1.5 hover:text-gold bg-muted"><Search className="w-4 h-4" /></button>
                </form>
                {suggestions && suggestions.length > 0 && (
                  <div className="absolute top-full right-0 mt-1 w-64 bg-background border border-border shadow-lg rounded-sm py-2 z-50">
                    {suggestions.map(s => (
                      <Link 
                        key={s.id} 
                        href={`/products/${s.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setQuery("");
                        }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-muted transition"
                      >
                        {s.image ? (
                           <img src={s.image} alt={s.name} className="w-8 h-8 object-cover rounded-sm" />
                        ) : (
                           <div className="w-8 h-8 bg-muted rounded-sm" />
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-foreground truncate w-44">{s.name}</span>
                          <span className="text-xs text-muted-foreground">₹{s.price}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:text-gold transition" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
            )}
            <Link href="/wishlist" className="p-2 hover:text-gold transition relative" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-maroon text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="p-2 hover:text-gold transition relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-maroon text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link href="/admin" className="p-2 hover:text-gold transition" aria-label="Admin">
                <Shield className="w-5 h-5" />
              </Link>
            )}
            {user ? (
              <Link href="/profile" className="p-2 hover:text-gold transition" aria-label="Profile">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link href="/login" className="p-2 hover:text-gold transition" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
