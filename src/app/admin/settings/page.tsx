"use client";


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getSettings, updateSetting } from "@/lib/api/settings.functions";
import { toast } from "sonner";
import { Settings, Save, Plus, Trash2, Truck, Layout, Image as ImageIcon, Filter } from "lucide-react";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"shipping" | "content" | "banner" | "filters">("shipping");

  const [shippingCharge, setShippingCharge] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [homepageBannerSubtitle, setHomepageBannerSubtitle] = useState("");
  const [homepageTitle, setHomepageTitle] = useState("");
  const [homepageSubtitle, setHomepageSubtitle] = useState("");
  const [homepageBannerImage, setHomepageBannerImage] = useState("");
  const [homepageBannerLabel, setHomepageBannerLabel] = useState("");
  const [homepageBannerHeading, setHomepageBannerHeading] = useState("");
  const [homepageBannerPrice, setHomepageBannerPrice] = useState("");
  const [filterFabrics, setFilterFabrics] = useState<string[]>([]);
  const [filterColors, setFilterColors] = useState<{name: string; hex: string}[]>([]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => getSettings(),
  });

  useEffect(() => {
    if (settings) {
      if (settings.flat_shipping_charge) setShippingCharge(settings.flat_shipping_charge);
      if (settings.free_shipping_threshold) setFreeShippingThreshold(settings.free_shipping_threshold);
      if (settings.homepage_banner_subtitle) setHomepageBannerSubtitle(settings.homepage_banner_subtitle);
      if (settings.homepage_title) setHomepageTitle(settings.homepage_title);
      if (settings.homepage_subtitle) setHomepageSubtitle(settings.homepage_subtitle);
      if (settings.homepage_banner_image) setHomepageBannerImage(settings.homepage_banner_image);
      if (settings.homepage_banner_label) setHomepageBannerLabel(settings.homepage_banner_label);
      if (settings.homepage_banner_heading) setHomepageBannerHeading(settings.homepage_banner_heading);
      if (settings.homepage_banner_price) setHomepageBannerPrice(settings.homepage_banner_price);
      if (settings.filter_fabrics) {
        try { setFilterFabrics(JSON.parse(settings.filter_fabrics)); } catch(e) {}
      }
      if (settings.filter_colors) {
        try { setFilterColors(JSON.parse(settings.filter_colors)); } catch(e) {}
      }
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (payload: { 
      shippingCharge: string; threshold: string; bannerSubtitle: string; title: string; subtitle: string;
      bannerImage: string; bannerLabel: string; bannerHeading: string; bannerPrice: string;
      fabrics: string[]; colors: {name: string, hex: string}[];
    }) => {
      await updateSetting({ data: { key: "flat_shipping_charge", value: payload.shippingCharge } });
      await updateSetting({ data: { key: "free_shipping_threshold", value: payload.threshold } });
      await updateSetting({ data: { key: "homepage_banner_subtitle", value: payload.bannerSubtitle } });
      await updateSetting({ data: { key: "homepage_title", value: payload.title } });
      await updateSetting({ data: { key: "homepage_subtitle", value: payload.subtitle } });
      await updateSetting({ data: { key: "homepage_banner_image", value: payload.bannerImage } });
      await updateSetting({ data: { key: "homepage_banner_label", value: payload.bannerLabel } });
      await updateSetting({ data: { key: "homepage_banner_heading", value: payload.bannerHeading } });
      await updateSetting({ data: { key: "homepage_banner_price", value: payload.bannerPrice } });
      await updateSetting({ data: { key: "filter_fabrics", value: JSON.stringify(payload.fabrics) } });
      await updateSetting({ data: { key: "filter_colors", value: JSON.stringify(payload.colors) } });
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["app_settings"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update settings");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingCharge || isNaN(Number(shippingCharge))) {
      toast.error("Please enter a valid numeric value for flat shipping charge");
      return;
    }
    if (!freeShippingThreshold || isNaN(Number(freeShippingThreshold))) {
      toast.error("Please enter a valid numeric value for free shipping threshold");
      return;
    }
    updateMutation.mutate({ 
      shippingCharge, 
      threshold: freeShippingThreshold,
      bannerSubtitle: homepageBannerSubtitle,
      title: homepageTitle,
      subtitle: homepageSubtitle,
      bannerImage: homepageBannerImage,
      bannerLabel: homepageBannerLabel,
      bannerHeading: homepageBannerHeading,
      bannerPrice: homepageBannerPrice,
      fabrics: filterFabrics,
      colors: filterColors
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-white rounded-lg shadow-sm border border-border">
          <Settings className="w-6 h-6 text-maroon" />
        </div>
        <div>
          <h1 className="font-display text-3xl">Store Settings</h1>
          <p className="text-muted-foreground text-sm">Configure global application settings</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-4">Checkout & Shipping</h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* TABS HEADER */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === "shipping" ? "bg-muted text-maroon border-b-2 border-maroon" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Truck className="w-4 h-4" /> Checkout & Shipping
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === "content" ? "bg-muted text-maroon border-b-2 border-maroon" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Layout className="w-4 h-4" /> Homepage Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("banner")}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === "banner" ? "bg-muted text-maroon border-b-2 border-maroon" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <ImageIcon className="w-4 h-4" /> Banner Image & Overlay
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("filters")}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === "filters" ? "bg-muted text-maroon border-b-2 border-maroon" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Filter className="w-4 h-4" /> Product Filters
            </button>
          </div>

          {/* SHIPPING TAB */}
          <div className={activeTab === "shipping" ? "block" : "hidden"}>
            <div className="max-w-sm space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Flat Shipping Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={shippingCharge}
                    onChange={(e) => setShippingCharge(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                    placeholder="150"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This amount will be added to the cart subtotal for all orders.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Free Shipping Threshold (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                    placeholder="999"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Orders above this amount will have free shipping.
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT TAB */}
          <div className={activeTab === "content" ? "block" : "hidden"}>
            <div className="max-w-xl space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Banner Subtitle
                </label>
                <input
                  type="text"
                  required
                  value={homepageBannerSubtitle}
                  onChange={(e) => setHomepageBannerSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                  placeholder="New Season 2026"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  The small text appearing above the main title.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Main Title
                </label>
                <textarea
                  required
                  rows={5}
                  value={homepageTitle}
                  onChange={(e) => setHomepageTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                  placeholder="Wear the World. Own Every Room."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  The large main heading. You can use standard HTML like &lt;br /&gt; or &lt;span class="text-gold italic"&gt;...&lt;/span&gt; for styling.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Subtitle Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={homepageSubtitle}
                  onChange={(e) => setHomepageSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                  placeholder="Premium ethnic and western fashion..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  The description paragraph below the main title.
                </p>
              </div>
            </div>
          </div>

          {/* BANNER TAB */}
          <div className={activeTab === "banner" ? "block" : "hidden"}>
            <div className="max-w-xl space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Banner Image
                </label>
                <CloudinaryUpload
                  multiple={false}
                  maxFiles={1}
                  value={homepageBannerImage ? [homepageBannerImage] : []}
                  onUpload={(url) => setHomepageBannerImage(url)}
                  onRemove={() => setHomepageBannerImage("")}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a high-quality vertical image (e.g. 900x1100).
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Overlay Label
                  </label>
                  <input
                    type="text"
                    required
                    value={homepageBannerLabel}
                    onChange={(e) => setHomepageBannerLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                    placeholder="NEW ARRIVAL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Overlay Price Text
                  </label>
                  <input
                    type="text"
                    required
                    value={homepageBannerPrice}
                    onChange={(e) => setHomepageBannerPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                    placeholder="From ₹4,999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Overlay Heading
                </label>
                <input
                  type="text"
                  required
                  value={homepageBannerHeading}
                  onChange={(e) => setHomepageBannerHeading(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                  placeholder="Bridal Collection 2026"
                />
              </div>
            </div>
          </div>

          {/* FILTERS TAB */}
          <div className={activeTab === "filters" ? "block" : "hidden"}>
            <p className="text-sm text-muted-foreground mb-6">Manage the options available in the storefront product filters.</p>
            <div className="max-w-xl space-y-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Fabric Options</label>
                <button 
                  type="button" 
                  onClick={() => setFilterFabrics([...filterFabrics, "New Fabric"])}
                  className="text-xs text-gold font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Fabric
                </button>
              </div>
              <div className="space-y-2">
                {filterFabrics.map((fabric, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={fabric}
                      onChange={(e) => {
                        const newF = [...filterFabrics];
                        newF[idx] = e.target.value;
                        setFilterFabrics(newF);
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                    />
                    <button 
                      type="button" 
                      onClick={() => setFilterFabrics(filterFabrics.filter((_, i) => i !== idx))}
                      className="px-3 text-muted-foreground hover:text-maroon transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {filterFabrics.length === 0 && <p className="text-sm text-muted-foreground italic">No fabrics added.</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Color Options</label>
                <button 
                  type="button" 
                  onClick={() => setFilterColors([...filterColors, { name: "New Color", hex: "#000000" }])}
                  className="text-xs text-gold font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Color
                </button>
              </div>
              <div className="space-y-2">
                {filterColors.map((color, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      value={color.name}
                      onChange={(e) => {
                        const newC = [...filterColors];
                        newC[idx].name = e.target.value;
                        setFilterColors(newC);
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                      placeholder="Color Name"
                    />
                    <input
                      type="color"
                      required
                      value={color.hex}
                      onChange={(e) => {
                        const newC = [...filterColors];
                        newC[idx].hex = e.target.value;
                        setFilterColors(newC);
                      }}
                      className="w-12 h-10 border border-border rounded p-1 cursor-pointer"
                    />
                    <button 
                      type="button" 
                      onClick={() => setFilterColors(filterColors.filter((_, i) => i !== idx))}
                      className="px-3 text-muted-foreground hover:text-maroon transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {filterColors.length === 0 && <p className="text-sm text-muted-foreground italic">No colors added.</p>}
              </div>
            </div>
          </div>
          </div>

          <div className="pt-8 border-t border-border mt-8">
            <button
              type="submit"
              disabled={updateMutation.isPending || isLoading}
              className="flex items-center gap-2 bg-maroon text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-maroon/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
              <Save className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
