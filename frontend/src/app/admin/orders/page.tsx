"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone_e164: string;
  total_sar: number;
  status: string;
  payment_method: string;
  upsell_accepted: boolean;
  risk_flag: string | null;
  created_at: string;
  items: { name: string; sku: string; qty: number; total_sar: number }[];
};

const statuses = ["", "new", "confirmed", "shipped", "delivered", "no_answer", "cancelled", "returned"];

function formatSar(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

function startFor(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [days, setDays] = useState(30);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const start = useMemo(() => startFor(days), [days]);

  async function load() {
    setError(null);
    const params = new URLSearchParams({ start });
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    if (!res.ok) {
      setError("Could not load orders. Make sure you are logged in.");
      return;
    }
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, start]);

  function submit(e: FormEvent) {
    e.preventDefault();
    void load();
  }

  return (
    <main dir="ltr" className="section-pad bg-ivory text-left">
      <div className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-label font-medium tracking-wide text-gold-600">COD Operations</p>
            <h1 className="mt-2 text-display text-brand-900">Orders</h1>
            <p className="mt-2 text-body text-ink-soft">
              Track COD operations, confirmations, delivery, returns, and support notes.
            </p>
          </div>
          <Link href="/admin" className="text-body-sm font-medium text-brand-700 underline">
            Back to dashboard
          </Link>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-3 rounded-[var(--radius-lg)] bg-white p-4 ring-1 ring-sand-200 md:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, phone, or order number"
              className="h-12 w-full rounded-[var(--radius-md)] border border-sand-200 bg-ivory px-12 text-body outline-none focus:border-brand-600"
            />
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-12 rounded-[var(--radius-md)] border border-sand-200 bg-ivory px-4 text-body outline-none focus:border-brand-600"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s || "All statuses"}
              </option>
            ))}
          </select>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-12 rounded-[var(--radius-md)] border border-sand-200 bg-ivory px-4 text-body outline-none focus:border-brand-600"
          >
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button type="submit" className="md:col-start-3">Search</Button>
        </form>

        {error ? <p className="mt-4 text-body-sm text-urgent">{error}</p> : null}

        <section className="mt-6 overflow-hidden rounded-[var(--radius-lg)] bg-white ring-1 ring-sand-200">
          <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
            <h2 className="text-h3 text-brand-900">All Orders</h2>
            <p className="text-body-sm text-muted">{total} orders</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] text-start text-body-sm">
              <thead className="bg-sand-100 text-muted">
                <tr>
                  <th className="p-4 text-start">Order</th>
                  <th className="p-4 text-start">Customer</th>
                  <th className="p-4 text-start">Products</th>
                  <th className="p-4 text-start">Total</th>
                  <th className="p-4 text-start">Status</th>
                  <th className="p-4 text-start">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-50/40">
                    <td className="p-4">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium text-brand-700 underline">
                        <LTR>{o.order_number}</LTR>
                      </Link>
                      <p className="mt-1 text-muted"><LTR>{new Date(o.created_at).toLocaleString("en-GB")}</LTR></p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-brand-900">{o.customer_name}</p>
                      <p className="text-muted"><LTR>{o.phone_e164}</LTR></p>
                    </td>
                    <td className="p-4">
                      {o.items.map((i) => (
                        <p key={i.sku + i.qty}>{i.name} × {i.qty}</p>
                      ))}
                    </td>
                    <td className="p-4 font-medium text-brand-900">{formatSar(o.total_sar)} SAR</td>
                    <td className="p-4">{o.status}</td>
                    <td className="p-4">
                      {o.risk_flag ? (
                        <span className="rounded-full bg-urgent-bg px-3 py-1 text-label font-medium text-urgent">
                          {o.risk_flag}
                        </span>
                      ) : (
                        <span className="text-muted">Clean</span>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted">No orders in this range.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
