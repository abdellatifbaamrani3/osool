"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Offer, Product } from "@/content/products";
import { getProduct } from "@/content/products";

export type CartLine = {
  key: string;
  slug: string;
  productId: string;
  offerId: string;
  shortName: string;
  offerTitle: string;
  offerDuration: string;
  offerQty: number;
  unitPriceSar: number;
  bundles: number;
  causeNumber: number;
};

type CartState = {
  lines: CartLine[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addOffer: (product: Product, offer: Offer, bundles?: number) => void;
  setBundles: (key: string, bundles: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  totalSar: () => number;
  itemCount: () => number;
};

function lineKey(slug: string, offerQty: number) {
  return `${slug}:${offerQty}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isCartOpen: false,
      isCheckoutOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),

      addOffer: (product, offer, bundles = 1) => {
        const key = lineKey(product.slug, offer.qty);
        const existing = get().lines.find((l) => l.key === key);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.key === key ? { ...l, bundles: l.bundles + bundles } : l,
            ),
            isCartOpen: true,
          });
          return;
        }
        const line: CartLine = {
          key,
          slug: product.slug,
          productId: product.sku,
          offerId: `${product.slug}-q${offer.qty}`,
          shortName: product.shortName,
          offerTitle: offer.title,
          offerDuration: offer.duration,
          offerQty: offer.qty,
          unitPriceSar: offer.priceSar,
          bundles,
          causeNumber: product.causeNumber,
        };
        set({ lines: [...get().lines, line], isCartOpen: true });
      },

      setBundles: (key, bundles) => {
        if (bundles < 1) {
          get().removeLine(key);
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.key === key ? { ...l, bundles } : l,
          ),
        });
      },

      removeLine: (key) =>
        set({ lines: get().lines.filter((l) => l.key !== key) }),

      clear: () => set({ lines: [], isCartOpen: false, isCheckoutOpen: false }),

      totalSar: () =>
        get().lines.reduce((sum, l) => sum + l.unitPriceSar * l.bundles, 0),

      itemCount: () => get().lines.reduce((sum, l) => sum + l.bundles, 0),
    }),
    {
      name: "osool_cart_v1",
      partialize: (s) => ({ lines: s.lines }),
      // Avoid SSR/localStorage races that can 500 product pages in next dev.
      skipHydration: true,
    },
  ),
);

export function addDefaultOffer(slug: string) {
  const product = getProduct(slug);
  if (!product) return;
  const offer =
    product.offers.find((o) => o.isDefault) ?? product.offers[1] ?? product.offers[0];
  useCart.getState().addOffer(product, offer, 1);
}

export function addSingleUnit(slug: string) {
  const product = getProduct(slug);
  if (!product) return;
  const offer = product.offers.find((o) => o.qty === 1) ?? product.offers[0];
  useCart.getState().addOffer(product, offer, 1);
}
