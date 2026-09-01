import { NextResponse, after } from "next/server";
import { getProduct } from "@/content/products";
import { getOrder, updateOrder } from "@/lib/orders-store";
import { sendOrderToSheet } from "@/lib/sheets-webhook";
import { upsellPriceFor } from "@/lib/upsell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) {
    return NextResponse.json(
      { code: "not_found", message_ar: "الطلب غير موجود" },
      { status: 404 },
    );
  }

  if (order.upsell_accepted) {
    return NextResponse.json(
      { code: "already_applied", message_ar: "العرض مضاف مسبقاً" },
      { status: 409 },
    );
  }

  if (Date.now() > new Date(order.upsell_expires_at).getTime()) {
    return NextResponse.json(
      { code: "expired", message_ar: "انتهى العرض" },
      { status: 410 },
    );
  }

  let body: { slug?: string } = {};
  try {
    body = (await req.json()) as { slug?: string };
  } catch {
    /* empty body ok — use offer on the order */
  }

  const slug = body.slug || order.upsell_offer.slug;
  if (slug !== order.upsell_offer.slug) {
    return NextResponse.json(
      { code: "invalid_upsell", message_ar: "العرض غير صالح" },
      { status: 422 },
    );
  }

  const product = getProduct(slug);
  if (!product) {
    return NextResponse.json(
      { code: "unknown_product", message_ar: "منتج غير موجود" },
      { status: 422 },
    );
  }

  const lineTotal = upsellPriceFor(product);
  const items = [
    ...order.items,
    {
      product_short_name_ar: product.shortName,
      offer_label_ar: "إكمال النظام · قطعة واحدة",
      bundles: 1,
      total_units: 1,
      line_total_sar: lineTotal,
      slug: product.slug,
    },
  ];
  const total = order.subtotal_sar + lineTotal;
  const eventId = crypto.randomUUID();

  const updated = updateOrder(id, {
    items,
    subtotal_sar: total,
    total_sar: total,
    upsell_accepted: true,
  });

  if (!updated) {
    return NextResponse.json(
      { code: "not_found", message_ar: "الطلب غير موجود" },
      { status: 404 },
    );
  }

  after(() => sendOrderToSheet(updated));

  return NextResponse.json(
    {
      id: updated.id,
      order_number: updated.order_number,
      total_sar: updated.total_sar,
      items: updated.items,
      upsell_accepted: true,
      event_id: eventId,
      order_id: `${updated.order_number}-upsell`,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
