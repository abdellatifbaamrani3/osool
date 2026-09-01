/**
 * Best-effort mirror of orders to the Google Apps Script webhook.
 *
 * The deployed script (google-apps-script-webhook.js) appends one flat row per
 * order and updates it in place when the same `orderid` arrives again (used
 * after the completion offer is accepted). The payload keys below must match
 * the sheet column order exactly:
 *   date · orderid · country · name · phone · product · sku · quantity ·
 *   total price · currency · status
 *
 * This is fire-and-forget: any failure is swallowed so it can never break
 * checkout. If SHEETS_WEBHOOK_URL is unset (local/demo) it silently no-ops.
 */

import { products } from "@/content/products";
import type { StoredOrder } from "@/lib/orders-store";

const RIYADH_TIME_ZONE = "Asia/Riyadh";

const productsBySlug = new Map(products.map((p) => [p.slug, p]));

/** dd/mm/yyyy in Riyadh time, e.g. 01/05/2026. */
function sheetDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: RIYADH_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function productName(slug: string, fallback: string): string {
  return productsBySlug.get(slug)?.name ?? fallback;
}

function sku(slug: string): string {
  return productsBySlug.get(slug)?.sku ?? slug;
}

function orderPayload(order: StoredOrder) {
  return {
    date: sheetDate(order.created_at),
    // Stable join key so the upsell update lands on the same row.
    orderid: order.order_number,
    country: "KSA",
    name: order.customer_name,
    // 966 + national number, e.g. 96650475233.
    phone: `966${order.phone_national}`,
    product: order.items
      .map((i) => productName(i.slug, i.product_short_name_ar))
      .join("/"),
    sku: order.items.map((i) => sku(i.slug)).join("/"),
    quantity: order.items.map((i) => String(i.total_units)).join("/"),
    "total price": order.total_sar,
    currency: "SAR",
    status: "",
  };
}

/**
 * Push the order to Google Sheets. Awaitable so callers can guarantee it runs
 * to completion — wrap it in `after()` (next/server) to keep it off the
 * checkout critical path while still ensuring the write finishes after the
 * response is sent. If SHEETS_WEBHOOK_URL is unset (local/demo) it no-ops.
 */
export async function sendOrderToSheet(order: StoredOrder): Promise<void> {
  const url = process.env.SHEETS_WEBHOOK_URL?.trim();
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload(order)),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[sheets-webhook] failed: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error("[sheets-webhook] error:", err);
  }
}
