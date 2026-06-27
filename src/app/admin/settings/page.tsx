"use client";


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getSettings, updateSetting } from "@/lib/api/settings.functions";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";
export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [shippingCharge, setShippingCharge] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => getSettings(),
  });

  useEffect(() => {
    if (settings && settings.flat_shipping_charge) {
      setShippingCharge(settings.flat_shipping_charge);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (val: string) => updateSetting({ data: { key: "flat_shipping_charge", value: val } }),
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
      toast.error("Please enter a valid numeric value");
      return;
    }
    updateMutation.mutate(shippingCharge);
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
          <div className="max-w-sm">
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

          <button
            type="submit"
            disabled={updateMutation.isPending || isLoading}
            className="flex items-center gap-2 bg-maroon text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-maroon/90 disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
            <Save className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
