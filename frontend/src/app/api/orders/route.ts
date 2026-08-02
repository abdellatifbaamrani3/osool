import { NextResponse } from "next/server";
import { products } from "@/content/products";
import {
  normalizeSaudiMobile,
  phoneForms,
  validateName,
} from "@/lib/phone";
import {
  assertOrderAllowedByIp,
  isPhoneWhitelisted,
} from "@/lib/maxmind";
import { nextOrderNumber, saveOrder, type StoredOrder } from "@/lib/orders-store";

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
};

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
  };

  saveOrder(order);

  return NextResponse.json(
    {
      id: order.id,
      order_number: order.order_number,
      subtotal_sar: order.subtotal_sar,
      shipping_sar: order.shipping_sar,
      total_sar: order.total_sar,
      currency: order.currency,
      event_id: body.event_id ?? id,
      items: order.items,
      upsell: null,
    },
    {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
