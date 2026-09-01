function trimSlash(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function looksLikeStorefront(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "osool.shop";
  } catch {
    return false;
  }
}

export function backendBaseUrl(): string {
  const configured = trimSlash(
    process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      "",
  );
  const publicApi = trimSlash(process.env.NEXT_PUBLIC_API_URL || "");
  // Strip a dashboard path if someone set BACKEND_API_URL=https://…/admin
  const withoutAdmin = configured.replace(/\/admin$/i, "");
  const candidate = withoutAdmin || publicApi || "http://localhost:8000";
  if (publicApi && looksLikeStorefront(candidate) && !looksLikeStorefront(publicApi)) {
    return publicApi;
  }
  return candidate;
}

export async function backendFetch(
  path: string,
  init: RequestInit & { incomingCookie?: string | null } = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.incomingCookie) headers.set("Cookie", init.incomingCookie);
  return fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function proxyBackendResponse(res: Response): Promise<Response> {
  const body = await res.text();
  const headers = new Headers();
  headers.set("Content-Type", res.headers.get("Content-Type") || "application/json");
  headers.set("Cache-Control", "no-store");
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) headers.set("set-cookie", setCookie);
  return new Response(body, { status: res.status, headers });
}
