/** In-memory order store for the Next.js checkout API (local / demo). */

import type { UpsellOffer } from "@/lib/upsell";

export type StoredOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  phone_national: string;
  phone_e164: string;
  phone_local: string;
  subtotal_sar: number;
  shipping_sar: number;
  total_sar: number;
  currency: "SAR";
  items: {
    product_short_name_ar: string;
    offer_label_ar: string;
    bundles: number;
    total_units: number;
    line_total_sar: number;
    slug: string;
  }[];
  created_at: string;
  upsell_offer: UpsellOffer;
  upsell_expires_at: string;
  upsell_accepted: boolean;
};

const g = globalThis as typeof globalThis & {
  __osoolOrders?: Map<string, StoredOrder>;
};

function map() {
  if (!g.__osoolOrders) g.__osoolOrders = new Map();
  return g.__osoolOrders;
}

/**
 * Unique across restarts/redeploys. A per-order time + random token means a
 * new order can never reuse an existing `orderid`, so the Sheets webhook always
 * appends a new row instead of overwriting an old one. Starts with `osool`.
 */
export function nextOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `osool-${stamp}${rand}`;
}

export function saveOrder(order: StoredOrder) {
  map().set(order.id, order);
}

export function getOrder(id: string) {
  return map().get(id) ?? null;
}

export function updateOrder(id: string, patch: Partial<StoredOrder>) {
  const existing = map().get(id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  map().set(id, next);
  return next;
}
