"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, ShieldAlert, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone_e164: string;
  subtotal_sar: number;
  shipping_sar: number;
  total_sar: number;
  currency: string;
  status: string;
  payment_method: string;
  upsell_accepted: boolean;
  risk_flag: string | null;
  client_ip: string | null;
  user_agent: string | null;
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
  items: {
    name: string;
    sku: string;
    offer: string | null;
    kind: string;
    total_units: number;
    unit_price_sar: number;
    line_total_sar: number;
  }[];
};

const statuses = ["new", "confirmed", "shipped", "delivered", "no_answer", "cancelled", "returned"];

function formatSar(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void params.then((p) => setId(p.id));
  }, [params]);

  async function load(orderId: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`);
    if (!res.ok) {
      setError("Could not load order.");
      return;
    }
    const data = await res.json();
    setOrder(data);
    setNotes(data.notes ?? "");
  }

  useEffect(() => {
    if (id) void load(id);
  }, [id]);

  async function update(patch: { status?: string; notes?: string }) {
    if (!id) return;
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not update order.");
      return;
    }
    await load(id);
  }

  if (error) {
    return (
      <main dir="ltr" className="section-pad bg-ivory text-left">
        <div className="container-page">
          <p className="text-urgent">{error}</p>
          <Link href="/admin/orders" className="mt-4 inline-block text-brand-700 underline">Back to orders</Link>
        </div>
      </main>
    );
  }

  if (!order) return <main className="section-pad bg-ivory" />;

  const wa = `https://wa.me/${order.phone_e164}?text=${encodeURIComponent(`Hello ${order.customer_name}, this is OSOOL support regarding your order ${order.order_number}.`)}`;

  return (
    <main dir="ltr" className="section-pad bg-ivory text-left">
      <div className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/admin/orders" className="text-body-sm font-medium text-brand-700 underline">
              Back to orders
            </Link>
            <h1 className="mt-3 text-display text-brand-900">
              Order <LTR>{order.order_number}</LTR>
            </h1>
            <p className="mt-2 text-body text-ink-soft">
              {order.customer_name} · <LTR>{order.phone_e164}</LTR>
            </p>
          </div>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-700 px-5 text-body font-medium text-ivory"
          >
            <MessageCircle className="size-5" aria-hidden />
            WhatsApp Customer
          </a>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-[var(--radius-xl)] bg-white p-6 ring-1 ring-sand-200">
            <div className="flex items-center justify-between border-b border-sand-200 pb-4">
              <h2 className="text-h3 text-brand-900">Order Summary</h2>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-label font-medium text-brand-700">
                {order.status}
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={item.sku + item.kind} className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] bg-sand-100 p-4">
                  <div>
                    <p className="font-medium text-brand-900">{item.name}</p>
                    <p className="mt-1 text-body-sm text-muted">
                      <LTR>{item.sku}</LTR> · {item.offer} · {item.kind === "upsell" ? "Upsell" : "Offer"}
                    </p>
                    <p className="mt-1 text-body-sm text-ink-soft">Quantity: {item.total_units}</p>
                  </div>
                  <p className="font-medium text-brand-900">{formatSar(item.line_total_sar)} SAR</p>
                </div>
              ))}
            </div>
            <dl className="mt-6 space-y-2 border-t border-sand-200 pt-4 text-body">
              <div className="flex justify-between"><dt>Products</dt><dd>{formatSar(order.subtotal_sar)} SAR</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{formatSar(order.shipping_sar)} SAR</dd></div>
              <div className="flex justify-between text-h3 text-brand-900"><dt>Total</dt><dd>{formatSar(order.total_sar)} SAR</dd></div>
            </dl>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[var(--radius-xl)] bg-white p-6 ring-1 ring-sand-200">
              <h2 className="text-h3 text-brand-900">Update Status</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => void update({ status: s })}
                    className={`rounded-[var(--radius-md)] px-3 py-2 text-body-sm font-medium ${
                      order.status === s ? "bg-brand-700 text-ivory" : "bg-sand-100 text-brand-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[var(--radius-xl)] bg-white p-6 ring-1 ring-sand-200">
              <h2 className="text-h3 text-brand-900">Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="mt-3 w-full rounded-[var(--radius-md)] border border-sand-200 bg-ivory p-3 text-body outline-none focus:border-brand-600"
                placeholder="Example: prefers WhatsApp, does not answer calls..."
              />
              <Button disabled={busy} onClick={() => void update({ notes })} className="mt-3" fullWidth>
                Save Notes
              </Button>
            </section>

            <section className="rounded-[var(--radius-xl)] bg-white p-6 ring-1 ring-sand-200">
              <h2 className="text-h3 text-brand-900">Operations & Risk</h2>
              <div className="mt-4 space-y-3 text-body-sm text-ink-soft">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-brand-600" aria-hidden />
                  Payment method: {order.payment_method}
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="size-4 text-brand-600" aria-hidden />
                  Upsell: {order.upsell_accepted ? "Accepted" : "Not accepted"}
                </p>
                <p className="flex items-center gap-2">
                  <ShieldAlert className="size-4 text-gold-600" aria-hidden />
                  Risk flag: {order.risk_flag || "None"}
                </p>
                <p>IP: <LTR>{order.client_ip || "Not available"}</LTR></p>
                <p className="break-words text-muted">{order.user_agent}</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
