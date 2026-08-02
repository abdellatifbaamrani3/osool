/** In-memory order store for the Next.js checkout API (local / demo). */

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
};

const g = globalThis as typeof globalThis & {
  __osoolOrders?: Map<string, StoredOrder>;
  __osoolOrderSeq?: number;
};

function map() {
  if (!g.__osoolOrders) g.__osoolOrders = new Map();
  return g.__osoolOrders;
}

export function nextOrderNumber(): string {
  g.__osoolOrderSeq = (g.__osoolOrderSeq ?? 10400) + 1;
  return `OS-${g.__osoolOrderSeq}`;
}

export function saveOrder(order: StoredOrder) {
  map().set(order.id, order);
}

export function getOrder(id: string) {
  return map().get(id) ?? null;
}
