"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Lock, PackageCheck, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

type Metrics = {
  kpis: {
    visitors: number;
    page_views: number;
    cta_clicks: number;
    add_to_cart: number;
    checkout_open: number;
    orders: number;
    revenue_sar: number;
    aov_sar: number;
    conversion_rate: number;
    add_to_cart_rate: number;
    checkout_rate: number;
    upsell_acceptance_rate: number;
  };
  orders_by_status: { status: string; count: number }[];
  top_products: { product_sku: string; product_name_ar: string; units: number; revenue: number }[];
  daily: { day: string; orders: number; revenue_sar: number }[];
};

const ranges = [
  { label: "Today", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
];

function formatSar(value: number) {
  return new Intl.NumberFormat("ar-SA").format(Math.round(value));
}

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function startFor(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function Kpi({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: typeof Users;
}) {
  return (
    <article className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-sand-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-body-sm text-muted">{title}</p>
          <p className="mt-2 text-h2 text-brand-900">{value}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-600">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-body-sm text-ink-soft">{sub}</p>
    </article>
  );
}

export default function AdminDashboardPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [days, setDays] = useState(7);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const start = useMemo(() => startFor(days), [days]);

  useEffect(() => {
    void fetch("/api/admin/me")
      .then((r) => {
        setAuthed(r.ok);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!authed) return;
    void fetch(`/api/admin/metrics?start=${encodeURIComponent(start)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setMetrics)
      .catch(() => setError("Could not load dashboard data."));
  }, [authed, start]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError("Invalid login details or admin dashboard is not enabled.");
      return;
    }
    setAuthed(true);
  }

  if (!ready) return <main className="section-pad bg-ivory" />;

  if (!authed) {
    return (
      <main dir="ltr" className="section-pad bg-brand-50 text-left">
        <div className="container-page">
          <form
            onSubmit={login}
            className="mx-auto max-w-md rounded-[var(--radius-xl)] bg-white p-7 shadow-[var(--shadow-md)] ring-1 ring-sand-200"
          >
            <span className="flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-600">
              <Lock className="size-6" aria-hidden />
            </span>
            <h1 className="mt-5 text-h1 text-brand-900">OSOOL Admin Dashboard</h1>
            <p className="mt-2 text-body text-ink-soft">
              Team-only access. You can log in from anywhere; Saudi/non-VPN
              filtering applies only to customer analytics.
            </p>
            <label className="mt-6 block text-body-sm font-medium text-brand-900">
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 h-12 w-full rounded-[var(--radius-md)] border border-sand-200 bg-ivory px-4 text-body outline-none focus:border-brand-600"
                autoComplete="username"
              />
            </label>
            <label className="mt-4 block text-body-sm font-medium text-brand-900">
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-2 h-12 w-full rounded-[var(--radius-md)] border border-sand-200 bg-ivory px-4 text-body outline-none focus:border-brand-600"
                autoComplete="current-password"
              />
            </label>
            {error ? <p className="mt-4 text-body-sm text-urgent">{error}</p> : null}
            <Button type="submit" size="xl" fullWidth className="mt-6">
              Log in
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main dir="ltr" className="section-pad bg-ivory text-left">
      <div className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-label font-medium tracking-wide text-gold-600">
              COD Admin Dashboard
            </p>
            <h1 className="mt-2 text-display text-brand-900">Performance Dashboard</h1>
            <p className="mt-2 text-body text-ink-soft">
              Visitors and clicks are counted only when MaxMind verifies a Saudi,
              non-VPN customer IP.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ranges.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => setDays(r.days)}
                className={`rounded-[var(--radius-pill)] px-4 py-2 text-body-sm font-medium ${
                  days === r.days ? "bg-brand-700 text-ivory" : "bg-white text-brand-700 ring-1 ring-sand-200"
                }`}
              >
                {r.label}
              </button>
            ))}
            <Link
              href="/admin/orders"
              className="rounded-[var(--radius-pill)] bg-gold-500 px-4 py-2 text-body-sm font-medium text-brand-900"
            >
              Orders
            </Link>
          </div>
        </div>

        {error ? <p className="mt-6 text-body-sm text-urgent">{error}</p> : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi title="Visitors" value={formatSar(metrics?.kpis.visitors ?? 0)} sub={`${formatSar(metrics?.kpis.page_views ?? 0)} page views`} icon={Users} />
          <Kpi title="Orders" value={formatSar(metrics?.kpis.orders ?? 0)} sub={`CR ${pct(metrics?.kpis.conversion_rate ?? 0)}`} icon={ShoppingBag} />
          <Kpi title="Revenue" value={`${formatSar(metrics?.kpis.revenue_sar ?? 0)} SAR`} sub={`AOV ${formatSar(metrics?.kpis.aov_sar ?? 0)} SAR`} icon={TrendingUp} />
          <Kpi title="Upsell" value={pct(metrics?.kpis.upsell_acceptance_rate ?? 0)} sub={`${formatSar(metrics?.kpis.cta_clicks ?? 0)} CTA clicks`} icon={PackageCheck} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <section className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200 lg:col-span-2">
            <h2 className="text-h3 text-brand-900">Daily Performance</h2>
            <div className="mt-5 space-y-3">
              {(metrics?.daily ?? []).map((d) => (
                <div key={d.day} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-body-sm">
                  <LTR className="text-muted">{d.day}</LTR>
                  <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{
                        width: `${Math.min(100, (d.revenue_sar / Math.max(1, metrics?.kpis.revenue_sar ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="font-medium text-brand-900">{formatSar(d.revenue_sar)} SAR</span>
                </div>
              ))}
              {metrics?.daily.length === 0 ? <p className="text-body-sm text-muted">No data yet.</p> : null}
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200">
            <h2 className="text-h3 text-brand-900">Order Statuses</h2>
            <div className="mt-5 space-y-3">
              {(metrics?.orders_by_status ?? []).map((s) => (
                <div key={s.status} className="flex items-center justify-between rounded-[var(--radius-md)] bg-sand-100 px-4 py-3 text-body-sm">
                  <span>{s.status}</span>
                  <span className="font-medium text-brand-900">{s.count}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-h3 text-brand-900">Top Products</h2>
            <BarChart3 className="size-5 text-brand-600" aria-hidden />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-start text-body-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 text-start">Product</th>
                  <th className="pb-3 text-start">SKU</th>
                  <th className="pb-3 text-start">Units</th>
                  <th className="pb-3 text-start">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {(metrics?.top_products ?? []).map((p) => (
                  <tr key={p.product_sku}>
                    <td className="py-3 font-medium text-brand-900">{p.product_name_ar}</td>
                    <td className="py-3"><LTR>{p.product_sku}</LTR></td>
                    <td className="py-3">{p.units}</td>
                    <td className="py-3">{formatSar(p.revenue)} SAR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
