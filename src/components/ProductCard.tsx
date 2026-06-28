import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { useWishlist } from "@/lib/store";

type ProductCardData = {
  id: string;
  name: string;
  brand: string;
  price: number;
  old_price?: number | null;
  stock?: number;
  image?: string | null;
  is_active?: boolean;
  product_images?: { url: string }[];
  variants?: any[];
  // Legacy fields for backward compat
  oldPrice?: number;
  badges?: string[];
  isNew?: boolean;
};

export function ProductCard({ product, layout = "grid" }: { product: ProductCardData, layout?: "grid" | "grid-2" | "list" }) {
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);

  const displayImage =
    product.image ||
    (product.product_images?.length ? product.product_images[0].url : null);

  const oldPrice = product.old_price ?? product.oldPrice ?? null;
  const discount =
    oldPrice && oldPrice > product.price
      ? Math.round(((oldPrice - product.price) / oldPrice) * 100)
      : 0;

  // Derive badges
  const badges: string[] = product.badges ? [...product.badges] : [];
  
  const totalStock = product.variants && product.variants.length > 0
    ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
    : (product.stock || 0);

  const isOutOfStock = totalStock === 0 || product.is_active === false;

  if (!badges.length && product.isNew) {
    badges.push("NEW");
  }

  const badgeColor = (b: string) =>
    b === "NEW" ? "bg-forest text-white" :
    b === "BESTSELLER" ? "bg-gold text-white" :
    b === "PREMIUM" ? "bg-forest text-white" :
    "bg-gold text-white";

  return (
    <div className={`group bg-card rounded-md overflow-hidden border border-border/50 hover:shadow-lg transition ${layout === "list" ? "flex flex-col sm:flex-row sm:h-56" : ""}`}>
      <Link href={`/products/${product.id}`} className={`block relative overflow-hidden bg-muted shrink-0 ${layout === "list" ? "aspect-[3/4] sm:aspect-auto sm:w-48 sm:h-full" : "aspect-[3/4]"}`}>
        {displayImage ? (
          <div className="w-full h-full relative">
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              className={`w-full h-full object-cover transition duration-500 ${isOutOfStock ? "opacity-50" : "group-hover:scale-105"}`}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/20 z-10">
                <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-sm text-xs font-bold tracking-widest text-maroon shadow-sm">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">No Image</div>
        )}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {badges.map((b) => (
              <span key={b} className={`text-[10px] font-semibold px-2 py-1 rounded ${badgeColor(b)}`}>{b}</span>
            ))}
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 grid place-items-center hover:bg-background transition"
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${wished ? "fill-maroon text-maroon" : ""}`} />
        </button>
        <div className="absolute bottom-0 inset-x-0 bg-gold text-white py-2.5 text-xs font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" /> QUICK VIEW
        </div>
      </Link>
      <div className={`p-4 flex flex-col justify-center ${layout === "list" ? "flex-1" : ""}`}>
        <p className="text-[10px] tracking-[0.15em] text-muted-foreground">{product.brand}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display text-base mt-1 hover:text-gold transition">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-gold font-semibold">₹{Number(product.price).toLocaleString("en-IN")}</span>
          {oldPrice && oldPrice > product.price && (
            <>
              <span className="text-xs text-muted-foreground line-through">₹{Number(oldPrice).toLocaleString("en-IN")}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-maroon/10 text-maroon ${layout === "list" ? "" : "ml-auto"}`}>
                {discount}% OFF
              </span>
            </>
          )}
        </div>
        {layout === "list" && (
          <p className="mt-4 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            Premium {product.brand} {product.name.toLowerCase()}. Crafted with fine materials and elegant design, perfect for any occasion.
          </p>
        )}
      </div>
    </div>
  );
}
