import { NextResponse, after } from "next/server";
import { getProduct, products } from "@/content/products";
import {
  maskPhoneLocal,
  normalizeSaudiMobile,
  phoneForms,
  validateName,
} from "@/lib/phone";
import {
  assertOrderAllowedByIp,
  isPhoneWhitelisted,
} from "@/lib/maxmind";
import { nextOrderNumber, saveOrder, type StoredOrder } from "@/lib/orders-store";
import { sendOrderToSheet } from "@/lib/sheets-webhook";
import { pickUpsell, upsellExpiresAt, upsellPriceFor } from "@/lib/upsell";
import { backendFetch } from "@/lib/backend-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BodyLine = {
  slug: string;
  offer_qty: number;
  bundles: number;
};

type Body = {
  name?: string;
  phone?: string;
  lines?: BodyLine[];
  honeypot?: string;
  event_id?: string;
  upsell_accepted?: boolean;
  upsell_slug?: string;
};

function forwardedHeaders(req: Request): Headers {
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const name of [
    "user-agent",
    "cf-connecting-ip",
    "x-forwarded-for",
    "x-real-ip",
    "true-client-ip",
  ]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { code: "bad_json", message_ar: "طلب غير صالح" },
      { status: 400 },
    );
  }

  if (body.honeypot) {
    return NextResponse.json(
      { code: "honeypot", message_ar: "طلب مرفوض" },
      { status: 422 },
    );
  }

  const nameErr = validateName(body.name ?? "");
  if (nameErr) {
    return NextResponse.json(
      { code: "invalid_name", message_ar: nameErr },
      { status: 422 },
    );
  }

  const national = normalizeSaudiMobile(body.phone ?? "");
  if (!national) {
    return NextResponse.json(
      {
        code: "invalid_phone",
        message_ar: "تأكد من الرقم — لازم جوال سعودي يبدأ بـ 05",
      },
      { status: 422 },
    );
  }

  // Whitelisted test phone (0500 00 0102) skips MaxMind geo/VPN gate in prod.
  if (!isPhoneWhitelisted(national)) {
    const geo = await assertOrderAllowedByIp(req.headers);
    if (!geo.ok) {
      return NextResponse.json(
        { code: geo.code, message_ar: geo.message_ar },
        { status: 403 },
      );
    }
  }

  const lines = body.lines ?? [];
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 10) {
    return NextResponse.json(
      { code: "invalid_lines", message_ar: "السلة فاضية أو غير صالحة" },
      { status: 422 },
    );
  }

  const items: StoredOrder["items"] = [];
  let subtotal = 0;

  for (const line of lines) {
    const product = products.find((p) => p.slug === line.slug);
    if (!product) {
      return NextResponse.json(
        { code: "unknown_product", message_ar: "منتج غير موجود" },
        { status: 422 },
      );
    }
    const offer = product.offers.find((o) => o.qty === line.offer_qty);
    if (!offer) {
      return NextResponse.json(
        { code: "unknown_offer", message_ar: "العرض غير موجود" },
        { status: 422 },
      );
    }
    const bundles = Math.min(10, Math.max(1, Number(line.bundles) || 1));
    const lineTotal = offer.priceSar * bundles;
    subtotal += lineTotal;
    items.push({
      product_short_name_ar: product.shortName,
      offer_label_ar: `${offer.title} · ${offer.duration}`,
      bundles,
      total_units: offer.qty * bundles,
      line_total_sar: lineTotal,
      slug: product.slug,
    });
  }

  const phones = phoneForms(national);
  const id = crypto.randomUUID();
  const upsell = pickUpsell(items.map((i) => i.slug));
  const expires = upsellExpiresAt();
  let accepted = Boolean(body.upsell_accepted);

  if (accepted) {
    if (body.upsell_slug && body.upsell_slug !== upsell.slug) {
      accepted = false;
    } else {
      const product = getProduct(upsell.slug);
      if (product) {
        const lineTotal = upsellPriceFor(product);
        items.push({
          product_short_name_ar: product.shortName,
          offer_label_ar: "إكمال النظام · قطعة واحدة",
          bundles: 1,
          total_units: 1,
          line_total_sar: lineTotal,
          slug: product.slug,
        });
        subtotal += lineTotal;
      } else {
        accepted = false;
      }
    }
  }
  const order: StoredOrder = {
    id,
    order_number: nextOrderNumber(),
    customer_name: (body.name ?? "").trim(),
    phone_national: phones.phone_national,
    phone_e164: phones.phone_e164,
    phone_local: phones.phone_local,
    subtotal_sar: subtotal,
    shipping_sar: 0,
    total_sar: subtotal,
    currency: "SAR",
    items,
    created_at: new Date().toISOString(),
    upsell_offer: upsell,
    upsell_expires_at: expires,
    upsell_accepted: accepted,
  };

  saveOrder(order);

  try {
    const backend = await backendFetch("/api/orders", {
      method: "POST",
      headers: forwardedHeaders(req),
      body: JSON.stringify(body),
    });
    if (backend.ok) {
      const payload = await backend.json();
      after(() => sendOrderToSheet(order));
      return NextResponse.json(payload, {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      });
    }
    console.error(`[orders] backend persistence failed: HTTP ${backend.status}`);
  } catch (err) {
    console.error("[orders] backend persistence unavailable; using local fallback", err);
  }

  // Runs after the response is sent, but the runtime guarantees it completes —
  // so the row (including any accepted upsell) always reaches Google Sheets.
  after(() => sendOrderToSheet(order));

  return NextResponse.json(
    {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      phone_masked: maskPhoneLocal(order.phone_national),
      phone_local: order.phone_local,
      subtotal_sar: order.subtotal_sar,
      shipping_sar: order.shipping_sar,
      total_sar: order.total_sar,
      currency: order.currency,
      event_id: body.event_id ?? id,
      items: order.items,
      upsell,
      upsell_expires_at: expires,
    },
    {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
