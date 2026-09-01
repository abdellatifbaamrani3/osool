"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "osool_admin_analytics_session";

function sessionId(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function utmFrom(search: URLSearchParams) {
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = search.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}

function productSlug(path: string): string | null {
  const match = /^\/products\/([^/?#]+)/.exec(path);
  return match ? decodeURIComponent(match[1]) : null;
}

function eventNameFromCta(cta: string): string {
  if (cta.includes("add")) return "add_to_cart";
  if (cta.includes("checkout-submit")) return "checkout_submit";
  if (cta.includes("checkout")) return "checkout_open";
  if (cta.includes("upsell-accept")) return "upsell_accepted";
  if (cta.includes("upsell")) return "upsell_shown";
  return "cta_click";
}

function send(event_name: string, extra: Record<string, unknown> = {}) {
  const payload = {
    event_name,
    session_id: sessionId(),
    path: window.location.pathname,
    product_slug: productSlug(window.location.pathname),
    referrer: document.referrer || null,
    utm: utmFrom(new URLSearchParams(window.location.search)),
    ...extra,
  };
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/events", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function AnalyticsProvider() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    send("page_view");
    if (productSlug(pathname)) send("product_view");
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("[data-cta]");
      const cta = el?.getAttribute("data-cta");
      if (!cta) return;
      send(eventNameFromCta(cta), { cta_id: cta });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
