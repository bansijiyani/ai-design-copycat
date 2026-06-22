import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/store";
import { getProducts } from "@/lib/api/product.functions";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — FizTopz" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);

  // Fetch all products and filter by wishlisted IDs
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const items = (allProducts as any[]).filter((p) => ids.includes(p.id));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-12 flex-1">
        <h1 className="font-display text-5xl">Your Wishlist</h1>
        <p className="text-sm text-muted-foreground mt-2">{items.length} items saved</p>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted grid place-items-center">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-3xl mt-6">Nothing saved yet</h2>
            <p className="text-muted-foreground mt-3">Start adding pieces you love to your wishlist.</p>
            <Link to="/products" className="mt-8 inline-flex items-center gap-2 bg-gold text-white px-8 py-3.5 font-semibold tracking-wider text-sm hover:bg-gold/90 transition">
              EXPLORE PRODUCTS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {items.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
