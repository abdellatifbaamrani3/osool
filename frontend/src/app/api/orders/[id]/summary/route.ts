import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-api";
import { getOrder } from "@/lib/orders-store";
import { maskPhoneLocal } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const backend = await backendFetch(`/api/orders/${encodeURIComponent(id)}/summary`);
    if (backend.ok) {
      return NextResponse.json(await backend.json(), {
        headers: { "Cache-Control": "no-store" },
      });
    }
  } catch (err) {
    console.error("[order-summary] backend unavailable; using local fallback", err);
  }

  const order = getOrder(id);
  if (!order) {
    return NextResponse.json(
      { code: "not_found", message_ar: "الطلب غير موجود" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      phone_masked: maskPhoneLocal(order.phone_national),
      phone_local: order.phone_local,
      phone_e164: order.phone_e164,
      subtotal_sar: order.subtotal_sar,
      shipping_sar: order.shipping_sar,
      total_sar: order.total_sar,
      currency: order.currency,
      items: order.items,
      created_at: order.created_at,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
