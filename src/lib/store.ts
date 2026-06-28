import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;           // product_id
  variantId?: string;   // product_variant id
  qty: number;
  color?: string;
  size?: string;
  price: number;        // locked-in price at time of add
  productName: string;  // locked-in name
  image?: string;       // locked-in image URL
  stock?: number;
  isActive?: boolean;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string, variantId?: string) => void;
  updateQty: (id: string, qty: number, variantId?: string) => void;
  syncPrices: (products: any[]) => void;
  clear: () => void;
};

/**
 * Cart items are keyed by product_id + variantId combination.
 * Each item stores a snapshot of the price/name/image at time of add,
 * so the cart is self-contained and doesn't need to look up product data.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const key = `${item.id}__${item.variantId ?? ""}`;
          const existing = s.items.find(
            (i) => `${i.id}__${i.variantId ?? ""}` === key,
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                `${i.id}__${i.variantId ?? ""}` === key
                  ? { ...i, qty: i.qty + item.qty }
                  : i,
              ),
            };
          }
          return { items: [...s.items, item] };
        }),
      remove: (id, variantId) =>
        set((s) => ({
          items: s.items.filter(
            (i) =>
              !(i.id === id && (i.variantId ?? "") === (variantId ?? "")),
          ),
        })),
      updateQty: (id, qty, variantId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id && (i.variantId ?? "") === (variantId ?? "")
              ? { ...i, qty }
              : i,
          ),
        })),
      syncPrices: (products) => set((s) => {
        let changed = false;
        const newItems = s.items.map((i) => {
          const dbProduct = products.find((p) => p.id === i.id);
          if (!dbProduct) {
            if (i.stock !== 0 || i.isActive !== false) {
              changed = true;
              return { ...i, stock: 0, isActive: false };
            }
            return i;
          }
          
          let newPrice = dbProduct.price;
          let newVariantId = i.variantId;
          let newStock = dbProduct.stock ?? 0;
          let newIsActive = dbProduct.is_active ?? true;

          if (i.variantId || i.color || i.size) {
            let v = undefined;
            if (i.variantId && dbProduct.variants) {
              v = dbProduct.variants.find((v: any) => v.id === i.variantId);
            }
            
            // Auto-heal variant ID if Admin deleted and recreated it
            if (!v && dbProduct.variants) {
              v = dbProduct.variants.find((v: any) => 
                (!i.color || v.color_name === i.color) && 
                (!i.size || v.size === i.size)
              );
            }

            if (v) {
              if (v.price_override !== null) newPrice = v.price_override;
              newVariantId = v.id;
              newStock = v.stock ?? 0;
              newIsActive = v.is_active ?? true;
            } else {
              // Variant deleted and not replaceable
              newStock = 0;
              newIsActive = false;
            }
          }
          
          if (
            newPrice !== i.price || 
            newVariantId !== i.variantId || 
            newStock !== i.stock || 
            newIsActive !== i.isActive
          ) {
            changed = true;
            return { ...i, price: newPrice, variantId: newVariantId, stock: newStock, isActive: newIsActive };
          }
          return i;
        });
        return changed ? { items: newItems } : {};
      }),
      clear: () => set({ items: [] }),
    }),
    { name: "fiztopz-cart" },
  ),
);

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "fiztopz-wishlist" },
  ),
);
