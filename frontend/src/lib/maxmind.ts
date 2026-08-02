/**
 * MaxMind GeoIP Insights gate — KSA only, block VPN / proxy / hosting.
 * Auth: HTTP Basic with account ID + license key (server-only env).
 * Docs: https://dev.maxmind.com/geoip/docs/web-services/
 */

const INSIGHTS_URL = "https://geoip.maxmind.com/geoip/v2.1/insights";

/** National form of 0500 00 0102 — prod order-test bypass. */
export const ORDER_PHONE_WHITELIST = new Set(["500000102"]);

export type GeoBlockCode =
  | "geo_blocked"
  | "vpn_blocked"
  | "suspicious_ip"
  | "ip_unavailable";

export type GeoCheckResult =
  | { ok: true; ip: string; country: string | null; skipped?: boolean }
  | {
      ok: false;
      code: GeoBlockCode;
      message_ar: string;
      ip: string | null;
      country?: string | null;
    };

type InsightsTraits = {
  is_anonymous?: boolean;
  is_anonymous_vpn?: boolean;
  is_hosting_provider?: boolean;
  is_public_proxy?: boolean;
  is_residential_proxy?: boolean;
  is_tor_exit_node?: boolean;
  ip_risk_snapshot?: number;
  user_type?: string;
};

type InsightsResponse = {
  country?: { iso_code?: string };
  registered_country?: { iso_code?: string };
  traits?: InsightsTraits;
  anonymizer?: {
    is_anonymous?: boolean;
    is_anonymous_vpn?: boolean;
    is_hosting_provider?: boolean;
    is_public_proxy?: boolean;
    is_residential_proxy?: boolean;
    is_tor_exit_node?: boolean;
  };
};

function credentials(): { accountId: string; licenseKey: string } | null {
  const accountId = process.env.MAXMIND_ACCOUNT_ID?.trim();
  const licenseKey =
    process.env.MAXMIND_LICENSE_KEY?.trim() ||
    process.env.MAXMIND_API_KEY?.trim();
  if (!accountId || !licenseKey) return null;
  return { accountId, licenseKey };
}

export function isPhoneWhitelisted(national: string): boolean {
  if (ORDER_PHONE_WHITELIST.has(national)) return true;
  const extra = process.env.ORDER_PHONE_WHITELIST?.trim();
  if (!extra) return false;
  return extra
    .split(",")
    .map((p) => p.trim().replace(/^0/, ""))
    .filter(Boolean)
    .includes(national);
}

/** Best-effort client IP behind EasyPanel / reverse proxies. */
export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  return null;
}

function isPrivateOrLocal(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254."))
    return true;
  const m = /^172\.(\d+)\./.exec(ip);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

function isVpnOrSuspicious(data: InsightsResponse): GeoBlockCode | null {
  const t = data.traits ?? {};
  const a = data.anonymizer ?? {};

  if (t.is_anonymous_vpn || a.is_anonymous_vpn) return "vpn_blocked";
  if (t.is_tor_exit_node || a.is_tor_exit_node) return "vpn_blocked";
  if (t.is_public_proxy || a.is_public_proxy) return "vpn_blocked";
  if (t.is_residential_proxy || a.is_residential_proxy) return "vpn_blocked";

  if (t.is_anonymous || a.is_anonymous) return "suspicious_ip";
  if (t.is_hosting_provider || a.is_hosting_provider) return "suspicious_ip";
  if (t.user_type === "hosting" || t.user_type === "content_delivery_network") {
    return "suspicious_ip";
  }
  // Insights risk score 0–100; treat elevated risk as suspicious.
  if (typeof t.ip_risk_snapshot === "number" && t.ip_risk_snapshot >= 50) {
    return "suspicious_ip";
  }
  return null;
}

function messageFor(code: GeoBlockCode): string {
  switch (code) {
    case "geo_blocked":
      return "الطلب متاح داخل السعودية فقط";
    case "vpn_blocked":
      return "عطل الـ VPN أو البروكسي وأعد المحاولة";
    case "suspicious_ip":
      return "ما قدرنا نكمل الطلب من هالجهاز — جرّب شبكة ثانية";
    case "ip_unavailable":
      return "ما قدرنا نتحقق من موقعك — أعد المحاولة";
  }
}

export async function assertOrderAllowedByIp(
  headers: Headers,
): Promise<GeoCheckResult> {
  const creds = credentials();
  if (!creds) {
    console.warn(
      "[osool] WARN: MaxMind credentials missing — geo/VPN gate disabled",
    );
    return { ok: true, ip: clientIpFromHeaders(headers) ?? "unknown", country: null, skipped: true };
  }

  const ip = clientIpFromHeaders(headers);
  if (!ip || isPrivateOrLocal(ip)) {
    return {
      ok: false,
      code: "ip_unavailable",
      message_ar: messageFor("ip_unavailable"),
      ip,
    };
  }

  const auth = Buffer.from(`${creds.accountId}:${creds.licenseKey}`).toString(
    "base64",
  );

  let data: InsightsResponse;
  try {
    const res = await fetch(`${INSIGHTS_URL}/${encodeURIComponent(ip)}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      console.error(`[osool] MaxMind Insights HTTP ${res.status} for ${ip}`);
      return {
        ok: false,
        code: "ip_unavailable",
        message_ar: messageFor("ip_unavailable"),
        ip,
      };
    }
    data = (await res.json()) as InsightsResponse;
  } catch (err) {
    console.error("[osool] MaxMind Insights request failed", err);
    return {
      ok: false,
      code: "ip_unavailable",
      message_ar: messageFor("ip_unavailable"),
      ip,
    };
  }

  const country =
    data.country?.iso_code?.toUpperCase() ??
    data.registered_country?.iso_code?.toUpperCase() ??
    null;

  if (country !== "SA") {
    return {
      ok: false,
      code: "geo_blocked",
      message_ar: messageFor("geo_blocked"),
      ip,
      country,
    };
  }

  const risk = isVpnOrSuspicious(data);
  if (risk) {
    return {
      ok: false,
      code: risk,
      message_ar: messageFor(risk),
      ip,
      country,
    };
  }

  return { ok: true, ip, country };
}
