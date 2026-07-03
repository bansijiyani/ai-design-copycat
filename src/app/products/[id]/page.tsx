"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Heart, Share2, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronDown, Check, Star, Plus, Minus, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProductById, getProducts, getProductReviews, submitProductReview } from "@/lib/api/product.functions";
import { getSettings } from "@/lib/api/settings.functions";
import { useCart, useWishlist } from "@/lib/store";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
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
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "", name: "", images: [] as string[] });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  const effectivePrice = selectedVariant?.price_override ?? (product.price || 0);
  const oldPrice = Number(product.old_price ?? 0);
  const discount = oldPrice > effectivePrice ? Math.round(((oldPrice - effectivePrice) / oldPrice) * 100) : 0;
  const stockAvailable = selectedVariant ? selectedVariant.stock : product.stock;

  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => getSettings(),
  });
  const freeShippingThreshold = settings?.free_shipping_threshold ?? "999";

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

  const { data: reviewsData = [], refetch: refetchReviews } = useQuery({
    queryKey: ["product-reviews", product.id],
    queryFn: () => getProductReviews({ data: { productId: product.id } }),
  });

  const averageRating = reviewsData.length > 0 
    ? (reviewsData.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsData.length).toFixed(1) 
    : "4.8"; // Default fallback if no reviews

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

  const router = useRouter();
  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  let descText = product.description || `The ${product.name} is part of our 2026 collection. Made from carefully sourced materials with attention to every detail.`;
  let descDetails: Record<string, string> | null = null;
  if (product.description?.startsWith("{")) {
    try {
      const obj = JSON.parse(product.description);
      if (obj.text !== undefined && obj.details !== undefined) {
        descText = obj.text;
        descDetails = obj.details;
      }
    } catch (e) {}
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) {
      toast.error("Please fill in your name and review text");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await submitProductReview({
        data: {
          productId: product.id,
          rating: reviewForm.rating,
          reviewText: reviewForm.text,
          images: reviewForm.images,
          reviewerName: reviewForm.name,
        }
      });
      toast.success("Review submitted and pending approval!");
      setReviewForm({ rating: 5, text: "", name: "", images: [] });
      refetchReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const DescriptionContent = () => (
    <div className="space-y-6">
      <p className="whitespace-pre-wrap">{descText}</p>
      {descDetails && (
        <div className="space-y-4 pt-2">
          {descDetails.item && <p><span className="text-foreground">Item:</span> {descDetails.item}</p>}
          {descDetails.fabric && <p><span className="text-foreground">Fabric :</span> {descDetails.fabric}</p>}
          {descDetails.work_technique && <p><span className="text-foreground">Technique for Work :</span> {descDetails.work_technique}</p>}
          {descDetails.value_edition && <p><span className="text-foreground">Technique For value edition :</span> {descDetails.value_edition}</p>}
          {descDetails.style && <p><span className="text-foreground">Style :</span> {descDetails.style}</p>}
          {descDetails.length && <p><span className="text-foreground">Length :</span> {descDetails.length}</p>}
          {descDetails.width && <p><span className="text-foreground">Width :</span> {descDetails.width}</p>}
          {descDetails.wash_care && <p><span className="text-foreground">Wash Care :</span> {descDetails.wash_care}</p>}
        </div>
      )}
    </div>
  );

  const accordions = [
    { title: "Product Description", content: <DescriptionContent /> },
    { title: "Care Instructions", content: <p>Dry clean only. Store in a cool, dry place. Iron on low heat. Avoid direct sunlight.</p> },
  ];

  if (descDetails?.return_window || descDetails?.exchange_window || descDetails?.return_exchange) {
    const rw = descDetails.return_window || (descDetails.return_exchange?.includes("No return") ? "No Return" : "7 Days");
    const ew = descDetails.exchange_window || (descDetails.return_exchange?.includes("no return and exchange") ? "No Exchange" : "7 Days");
    
    accordions.push({
      title: "Return and Exchange",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {rw !== 'No Return' ? <Check className="w-4 h-4 text-green-600"/> : <X className="w-4 h-4 text-maroon"/>} 
              Return {rw !== 'No Return' ? 'Available' : 'Not Available'}
            </h3>
            {rw !== 'No Return' && <p className="text-sm mt-1">Return Window: {rw}</p>}
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {ew !== 'No Exchange' ? <Check className="w-4 h-4 text-green-600"/> : <X className="w-4 h-4 text-maroon"/>} 
              Exchange {ew !== 'No Exchange' ? 'Available' : 'Not Available'}
            </h3>
            {ew !== 'No Exchange' && <p className="text-sm mt-1">Exchange Window: {ew}</p>}
          </div>
        </div>
      )
    });
  }

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
        <div className="relative aspect-[4/6] rounded-sm overflow-hidden bg-black">
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
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <h1 className="font-display text-4xl">{product.name}</h1>
            {(stockAvailable === 0 || product.is_active === false) && (
              <span className="text-xs font-sans font-bold tracking-widest bg-zinc-800 text-white px-3 py-1 rounded-sm uppercase">Out of Stock</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? "fill-gold text-gold" : "text-muted-foreground"}`} />
              ))}
            </div>
            <span className="font-semibold">{averageRating}</span>
            <span className="text-muted-foreground text-xs ml-1">({reviewsData.length} reviews)</span>
            <span className="text-muted-foreground mx-1">|</span>
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

          <button 
            onClick={handleBuyNow}
            disabled={stockAvailable === 0 || product.is_active === false}
            className="w-full mt-3 border-2 border-gold text-gold py-4 font-semibold tracking-wider text-sm hover:bg-gold hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold"
          >
            BUY NOW
          </button>

          {/* <div className="mt-6 p-5 bg-muted/40 rounded-sm">
            <p className="text-sm font-semibold mb-3">Check Delivery</p>
            <div className="flex gap-2">
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter pincode" className="flex-1 px-4 py-2.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-gold" />
              <button className="px-6 bg-gold text-white text-sm font-semibold rounded-sm hover:bg-gold/90">Check</button>
            </div>
          </div> */}

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { i: Truck, t: "Free Shipping", s: `Above ₹${freeShippingThreshold}` },
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

      {/* REVIEWS SECTION */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="font-display text-4xl mb-8">Customer Reviews</h2>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Reviews List */}
          <div className="space-y-6">
            {reviewsData.length === 0 ? (
              <p className="text-muted-foreground italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviewsData.map((review: any) => (
                <div key={review.id} className="border-b border-border pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{review.reviewer_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mt-3">{review.review_text}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {review.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt="Review attachment" className="h-20 w-20 object-cover rounded-sm border border-border flex-shrink-0" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Write a Review */}
          <div className="bg-muted/30 p-6 md:p-8 rounded-sm border border-border h-fit">
            <h3 className="font-display text-2xl mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Rating</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${i < reviewForm.rating ? "fill-gold text-gold" : "text-muted-foreground stroke-1"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-gold text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-gold text-sm resize-none"
                  placeholder="Tell us what you think..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Add Images (Optional)</label>
                <CloudinaryUpload
                  value={reviewForm.images}
                  onUpload={(url) => setReviewForm(prev => ({ ...prev, images: [...prev.images, url] }))}
                  onRemove={(url) => setReviewForm(prev => ({ ...prev, images: prev.images.filter((u) => u !== url) }))}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-gold text-white py-3 text-sm font-semibold tracking-wide rounded-sm hover:bg-gold/90 transition disabled:opacity-50"
              >
                {isSubmittingReview ? "SUBMITTING..." : "SUBMIT REVIEW"}
              </button>
            </form>
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

function Accordion({ title, content }: { title: string; content: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-sm font-semibold">
        <span className="flex items-center gap-2"><span className="text-gold">●</span> {title}</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="text-sm text-muted-foreground pb-4">{content}</div>}
    </div>
  );
}
