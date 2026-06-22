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
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string, variantId?: string) => void;
  updateQty: (id: string, qty: number, variantId?: string) => void;
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
