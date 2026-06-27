"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Heart, Share2, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronDown, Check, Star, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProductById, getProducts } from "@/lib/api/product.functions";
import { useCart, useWishlist } from "@/lib/store";
export default function PDP() {
  const { id } = useParams() as { id: string };

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById({ data: { id } }),
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="grid place-items-center py-32">
          <p className="text-muted-foreground">Loading product…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="grid place-items-center py-32">
          <p className="text-muted-foreground">Product not found</p>
          <Link href="/products" className="mt-4 text-gold hover:underline">Back to shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return <ProductDetail product={product} allProducts={allProducts} />;
}

function ProductDetail({ product, allProducts }: { product: any; allProducts: any[] }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");

  // Variants
  const variants = product.variants ?? [];
  const colorMap = new Map<string, { name: string; hex: string }>();
  for (const v of variants as any[]) {
    if (v.color_name && !colorMap.has(v.color_name)) {
      colorMap.set(v.color_name, { name: v.color_name, hex: v.color_hex ?? "#000" });
    }
  }
  const colors: { name: string; hex: string }[] = colorMap.size > 0
    ? [...colorMap.values()]
    : (Array.isArray(product.colors) ? (product.colors as { name: string; hex: string }[]) : []);

  const sizeSet = new Set<string>();
  for (const v of variants as any[]) {
    if (v.size) sizeSet.add(v.size as string);
  }
  const sizes: string[] = [...sizeSet];

  const [selectedColor, setSelectedColor] = useState<string>(colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] ?? "");

  // Find the matching variant
  const selectedVariant = variants.find(
    (v: any) =>
      (!v.color_name || v.color_name === selectedColor) &&
      (!v.size || v.size === selectedSize),
  );

  const effectivePrice = selectedVariant?.price_override ?? Number(product.price);
  const oldPrice = Number(product.old_price ?? 0);
  const discount = oldPrice > effectivePrice ? Math.round(((oldPrice - effectivePrice) / oldPrice) * 100) : 0;
  const stockAvailable = selectedVariant ? selectedVariant.stock : product.stock;

  // Images: prefer variant images, then product_images, fall back to image field or placeholder
  const variantImages = selectedVariant?.images?.length ? selectedVariant.images : [];
  const productImages = product.product_images?.length
    ? product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order).map((pi: any) => pi.url)
    : product.image
      ? [product.image]
      : [];
  const images = variantImages.length > 0 ? variantImages : productImages.length > 0 ? productImages : ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop"];

  useEffect(() => {
    setImgIdx(0); // Reset to first image when changing variants
  }, [selectedVariant?.id]);

  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);

  const handleAddToCart = () => {
    add({
      id: product.id,
      variantId: selectedVariant?.id,
      qty,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      price: effectivePrice,
      productName: product.name,
      image: images[0],
    });
    toast.success(`${product.name} added to cart`);
  };

  const accordions = [
    { title: "Product Highlights", content: "Premium fabric with hand-finished details. Crafted by skilled artisans. Designed for comfort and elegance." },
    { title: "Description", content: product.description || `The ${product.name} is part of our 2026 collection. Made from carefully sourced materials with attention to every detail.` },
    { title: "Care Instructions", content: "Dry clean only. Store in a cool, dry place. Iron on low heat. Avoid direct sunlight." },
  ];

  const reviews = [
    { name: "Priya Sharma", date: "12 May 2026", rating: 5, text: "Absolutely stunning! The work is so intricate and quality is top-notch. Got so many compliments at my cousin's wedding. Will definitely buy again!" },
    { name: "Meera Iyer", date: "3 Apr 2026", rating: 5, text: "The colour is exactly as shown in the photos. Packaging was beautiful too — came in a lovely box. Highly recommend FizTopz for ethnic wear." },
  ];

  const related = allProducts
    .filter((p: any) => p.id !== product.id && p.section === product.section)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-gold">Home</Link> / <Link href="/products" className="hover:text-gold">Products</Link> / <Link href={{ pathname: "/products", query: { category: product.category } }} className="hover:text-gold capitalize">{product.category}</Link> / <span className="text-foreground">{product.name}</span>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[100px_1fr_1fr] gap-8">
        {/* thumbs */}
        <div className="hidden lg:flex flex-col gap-3">
          {images.map((src: string, i: number) => {
            const isVideo = !!src.match(/\.(mp4|webm|mov)(\?.*)?$/i);
            return (
              <button key={i} onClick={() => setImgIdx(i)} className={`aspect-[3/4] rounded-sm overflow-hidden border-2 bg-black ${imgIdx === i ? "border-gold" : "border-transparent"}`}>
                {isVideo ? (
                  <video src={src} className="w-full h-full object-cover" muted loop playsInline />
                ) : (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>

        {/* main image */}
        <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-black">
          {images[imgIdx]?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
            <video src={images[imgIdx]} className="w-full h-full object-cover" autoPlay loop muted playsInline />
          ) : (
            <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
          )}
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-maroon text-white text-xs font-bold px-3 py-1.5 rounded">{discount}% OFF</span>
          )}
          <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 grid place-items-center"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 grid place-items-center"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* info */}
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground">{product.brand}</p>
          <h1 className="font-display text-4xl mt-2">{product.name}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-gold text-gold" : "text-muted-foreground"}`} />
              ))}
            </div>
            <span className="font-semibold">4.8</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground text-xs">SKU: {product.sku ?? "—"}</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6 pb-6 border-b border-border">
            <span className="text-4xl font-display text-gold">₹{effectivePrice.toLocaleString("en-IN")}</span>
            {oldPrice > effectivePrice && (
              <>
                <span className="text-muted-foreground line-through">₹{oldPrice.toLocaleString("en-IN")}</span>
                <span className="px-2 py-1 bg-maroon/10 text-maroon text-xs font-semibold rounded">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Color picker */}
          {colors.length > 0 && (
            <div className="mt-6">
              <p className="text-sm"><span className="font-semibold">Colour:</span> <span className="text-muted-foreground">{selectedColor}</span></p>
              <div className="flex gap-3 mt-3">
                {colors.map((c) => (
                  <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`w-10 h-10 rounded-full border-2 grid place-items-center transition ${selectedColor === c.name ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: c.hex }}>
                    {selectedColor === c.name && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size picker */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold">Size:</p>
              <div className="flex gap-2 mt-3">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-sm border rounded-sm transition ${selectedSize === s ? "border-gold bg-gold/10 text-gold font-medium" : "border-border hover:border-gold"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-semibold">Qty:</span>
            <div className="flex items-center border border-border rounded-sm">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted"><Minus className="w-3 h-3" /></button>
              <span className="px-5 text-sm">{qty}</span>
              <button onClick={() => setQty(Math.min(qty + 1, stockAvailable || 99))} className="p-2 hover:bg-muted"><Plus className="w-3 h-3" /></button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={stockAvailable === 0}
              className="flex-1 bg-gold text-white py-4 font-semibold tracking-wider text-sm hover:bg-gold/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" /> ADD TO CART
            </button>
            <button onClick={() => toggleWish(product.id)} className="w-14 grid place-items-center border border-border rounded-sm hover:border-gold transition">
              <Heart className={`w-5 h-5 ${wished ? "fill-maroon text-maroon" : ""}`} />
            </button>
            <button className="w-14 grid place-items-center border border-border rounded-sm hover:border-gold transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <button className="w-full mt-3 border-2 border-gold text-gold py-4 font-semibold tracking-wider text-sm hover:bg-gold hover:text-white transition">
            BUY NOW
          </button>

          <div className="mt-6 p-5 bg-muted/40 rounded-sm">
            <p className="text-sm font-semibold mb-3">Check Delivery</p>
            <div className="flex gap-2">
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter pincode" className="flex-1 px-4 py-2.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-gold" />
              <button className="px-6 bg-gold text-white text-sm font-semibold rounded-sm hover:bg-gold/90">Check</button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { i: Truck, t: "Free Shipping", s: "Above ₹999" },
              { i: RotateCcw, t: "Easy Returns", s: "7-day policy" },
              { i: ShieldCheck, t: "100% Genuine", s: "Verified quality" },
            ].map((f) => (
              <div key={f.t} className="bg-muted/40 p-4 rounded-sm text-center">
                <f.i className="w-5 h-5 text-gold mx-auto" />
                <p className="text-xs font-semibold mt-2">{f.t}</p>
                <p className="text-[10px] text-muted-foreground">{f.s}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            {accordions.map((a) => <Accordion key={a.title} {...a} />)}
          </div>
        </div>
      </div>

      {/* YOU MAY ALSO LIKE */}
      {related.length > 0 && (
        <div className="container mx-auto px-4 pb-16">
          <h2 className="font-display text-4xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function Accordion({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-sm font-semibold">
        <span className="flex items-center gap-2"><span className="text-gold">●</span> {title}</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-sm text-muted-foreground pb-4">{content}</p>}
    </div>
  );
}
