"use client";

export type Attribution = {
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  ttclid?: string;
  ttp?: string;
  sc_click_id?: string;
  sc_cookie1?: string;
  event_source_url?: string;
  landing_path?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type PixelIds = {
  meta: string;
  tiktok: string;
  snap: string;
};

const ATTR_KEY = "osool_attr";
const INTERACTIONS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...a: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
};

type TtqFn = {
  push: (...args: unknown[]) => number;
  track: (...args: unknown[]) => void;
  identify?: (...args: unknown[]) => void;
  page?: () => void;
  methods?: string[];
  setAndDefer?: (obj: TtqFn, method: string) => void;
  instance?: (id: string) => TtqFn;
  load?: (id: string, opts?: Record<string, unknown>) => void;
  _i?: Record<string, TtqFn & { _u?: string }>;
  _t?: Record<string, number>;
  _o?: Record<string, unknown>;
} & Array<unknown>;

type SnaptrFn = ((...args: unknown[]) => void) & {
  handleRequest?: (...args: unknown[]) => void;
  queue: unknown[];
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
    ttq?: TtqFn;
    TiktokAnalyticsObject?: string;
    snaptr?: SnaptrFn;
  }
}

function cookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function readStored(): Attribution {
  try {
    const raw = sessionStorage.getItem(ATTR_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const existing = readStored();
  const next: Attribution = {
    ...existing,
    fbclid: params.get("fbclid") || existing.fbclid,
    ttclid: params.get("ttclid") || existing.ttclid,
    sc_click_id: params.get("ScCid") || params.get("sccid") || existing.sc_click_id,
    utm_source: params.get("utm_source") || existing.utm_source,
    utm_medium: params.get("utm_medium") || existing.utm_medium,
    utm_campaign: params.get("utm_campaign") || existing.utm_campaign,
    landing_path: existing.landing_path || window.location.pathname,
  };
  try {
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getAttribution(): Attribution {
  const stored = readStored();
  const fbclid = stored.fbclid;
  return {
    ...stored,
    fbp: cookie("_fbp") || stored.fbp,
    fbc:
      cookie("_fbc") ||
      stored.fbc ||
      (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined),
    ttp: cookie("_ttp") || stored.ttp,
    sc_cookie1: cookie("_scid") || stored.sc_cookie1,
    event_source_url: typeof window !== "undefined" ? window.location.href : stored.event_source_url,
  };
}

let bootstrapped = false;
let launchScheduled = false;
let pixelsReady = false;
let pixelIds: PixelIds = { meta: "", tiktok: "", snap: "" };
const queued: Array<() => void> = [];

function injectScript(src: string) {
  const el = document.createElement("script");
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
}

function injectMeta(pixelId: string) {
  if (window.fbq) {
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
    return;
  }
  const fbq: FbqFn = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as FbqFn;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;
  window._fbq = fbq;
  injectScript("https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

function injectTikTok(pixelId: string) {
  const name = "ttq";
  window.TiktokAnalyticsObject = name;
  const ttq = (window.ttq = (window.ttq || []) as TtqFn);
  ttq.methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
    "holdConsent",
    "revokeConsent",
    "grantConsent",
  ];
  ttq.setAndDefer = function setAndDefer(target, method) {
    (target as unknown as Record<string, unknown>)[method] = function (...args: unknown[]) {
      target.push([method, ...args]);
    };
  };
  for (const method of ttq.methods) ttq.setAndDefer(ttq, method);
  ttq.instance = function instance(id: string) {
    const existing = (ttq._i ||= {})[id] || ((ttq._i[id] = [] as unknown as TtqFn));
    for (const method of ttq.methods || []) ttq.setAndDefer?.(existing, method);
    return existing;
  };
  ttq.load = function load(id: string, opts?: Record<string, unknown>) {
    ttq._i = ttq._i || {};
    ttq._i[id] = [] as unknown as TtqFn & { _u?: string };
    ttq._i[id]._u = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._t = ttq._t || {};
    ttq._t[id] = Date.now();
    ttq._o = ttq._o || {};
    ttq._o[id] = opts || {};
    injectScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=${name}`);
  };
  ttq.load(pixelId);
  ttq.page?.();
}

function injectSnap(pixelId: string) {
  if (!window.snaptr) {
    const snaptr: SnaptrFn = function (...args: unknown[]) {
      if (snaptr.handleRequest) snaptr.handleRequest(...args);
      else snaptr.queue.push(args);
    };
    snaptr.queue = [];
    window.snaptr = snaptr;
    injectScript("https://sc-static.net/scevent.min.js");
  }
  window.snaptr("init", pixelId);
  window.snaptr("track", "PAGE_VIEW");
}

function injectPixels() {
  if (pixelsReady || typeof window === "undefined") return;
  pixelsReady = true;

  if (pixelIds.meta) injectMeta(pixelIds.meta);
  if (pixelIds.tiktok) injectTikTok(pixelIds.tiktok);
  if (pixelIds.snap) injectSnap(pixelIds.snap);

  queued.splice(0).forEach((fn) => fn());
}

async function loadPixelIds(): Promise<PixelIds> {
  try {
    const res = await fetch("/api/tracking/config", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as Partial<PixelIds>;
      return {
        meta: String(data.meta || "").trim(),
        tiktok: String(data.tiktok || "").trim(),
        snap: String(data.snap || "").trim(),
      };
    }
  } catch {
    /* fall through to build-time env (local next dev) */
  }
  return {
    meta: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_CODE || "",
    snap: process.env.NEXT_PUBLIC_SNAP_PIXEL_ID || "",
  };
}

export function initTracking() {
  if (typeof window === "undefined" || bootstrapped) return;
  bootstrapped = true;
  captureAttribution();
  const idsReady = loadPixelIds();

  const start = () => {
    if (launchScheduled) return;
    launchScheduled = true;
    INTERACTIONS.forEach((type) => window.removeEventListener(type, start));
    void idsReady.then((ids) => {
      pixelIds = ids;
      injectPixels();
    });
  };

  INTERACTIONS.forEach((type) => window.addEventListener(type, start, { passive: true, once: true }));
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(start, { timeout: 3000 });
  } else {
    window.setTimeout(start, 2000);
  }
}

function whenReady(fn: () => void) {
  if (pixelsReady) fn();
  else queued.push(fn);
}

export function firePurchase(opts: {
  eventId: string;
  value: number;
  currency?: string;
  orderNumber?: string;
  contentIds?: string[];
}) {
  const currency = opts.currency || "SAR";
  whenReady(() => {
    window.fbq?.("track", "Purchase", { value: opts.value, currency }, { eventID: opts.eventId });
    window.ttq?.track(
      "CompletePayment",
      { value: opts.value, currency, contents: (opts.contentIds || []).map((id) => ({ content_id: id })) },
      { event_id: opts.eventId },
    );
    window.snaptr?.("track", "PURCHASE", {
      price: opts.value,
      currency,
      transaction_id: opts.orderNumber,
      client_dedup_id: opts.eventId,
    });
  });
}

export function firePageView(path: string) {
  whenReady(() => {
    const id = crypto.randomUUID();
    window.fbq?.("track", "PageView", {}, { eventID: id });
    window.ttq?.track("Pageview", {}, { event_id: id });
    if (path !== "/") window.snaptr?.("track", "PAGE_VIEW", { client_dedup_id: id });
  });
}

export function fireViewContent(sku: string, name: string, value: number) {
  whenReady(() => {
    const id = crypto.randomUUID();
    window.fbq?.(
      "track",
      "ViewContent",
      { content_ids: [sku], content_type: "product", content_name: name, value, currency: "SAR" },
      { eventID: id },
    );
    window.ttq?.track(
      "ViewContent",
      { contents: [{ content_id: sku, content_name: name, price: value }], value, currency: "SAR" },
      { event_id: id },
    );
    window.snaptr?.("track", "VIEW_CONTENT", {
      item_ids: [sku],
      price: value,
      currency: "SAR",
      client_dedup_id: id,
    });
  });
}
