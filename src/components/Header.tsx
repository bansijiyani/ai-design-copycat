import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User, ChevronDown, Shield, LogOut } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart, useWishlist } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export function TopBar() {
  return (
    <div className="bg-gold text-promo-foreground text-xs tracking-wide">
      <div className="container mx-auto px-4 py-2.5 text-center">
        FREE SHIPPING ON ORDERS ABOVE ₹999 &middot; EASY 30-DAY RETURNS &middot; PAN-INDIA DELIVERY
      </div>
    </div>
  );
}

export function Header() {
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const { user, isAdmin, signOut } = useAuth();

  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/products", search: { search: query.trim() } as any });
      setSearchOpen(false);
      setQuery("");
    }
  };

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
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
          <Logo />
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative group py-6 -my-6">
                <Link
                  to={item.to as any}
                  search={item.search as any}
                  className="text-sm font-medium text-foreground/80 hover:text-gold transition flex items-center gap-1"
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-gold" }}
                >
                  {item.label}
                  {item.hasMenu && <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />}
                </Link>
                {item.hasMenu && item.subMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border shadow-lg rounded-sm py-2 hidden group-hover:block z-50">
                    {item.subMenu.map((sub) => (
                      <Link
                        key={sub.label}
                        to="/products"
                        search={{ category: sub.category }}
                        className="block px-4 py-2 text-sm text-foreground/80 hover:text-gold hover:bg-muted transition"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center border border-border rounded-sm overflow-hidden mr-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent text-sm px-3 py-1.5 w-40 outline-none"
                  onBlur={() => !query && setSearchOpen(false)}
                />
                <button type="submit" className="p-1.5 hover:text-gold bg-muted"><Search className="w-4 h-4" /></button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:text-gold transition" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
            )}
            <Link to="/wishlist" className="p-2 hover:text-gold transition relative" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-maroon text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 hover:text-gold transition relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-maroon text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="p-2 hover:text-gold transition" aria-label="Admin">
                <Shield className="w-5 h-5" />
              </Link>
            )}
            {user ? (
              <button onClick={() => signOut()} className="p-2 hover:text-gold transition" aria-label="Sign out">
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link to="/login" className="p-2 hover:text-gold transition" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
