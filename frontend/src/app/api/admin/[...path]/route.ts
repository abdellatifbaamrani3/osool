import { backendFetch, proxyBackendResponse } from "@/lib/backend-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path: string[] }> };

function forwardHeaders(req: Request): Headers {
  const headers = new Headers();
  headers.set("Content-Type", req.headers.get("Content-Type") || "application/json");
  for (const name of [
    "cookie",
    "user-agent",
    "cf-connecting-ip",
    "x-forwarded-for",
    "x-real-ip",
    "true-client-ip",
  ]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function proxy(req: Request, ctx: Ctx) {
  const { path } = await ctx.params;
  const url = new URL(req.url);
  const target = `/api/admin/${path.join("/")}${url.search}`;
  const body = req.method === "GET" ? undefined : await req.text();
  const res = await backendFetch(target, {
    method: req.method,
    headers: forwardHeaders(req),
    body,
  });
  return proxyBackendResponse(res);
}

export function GET(req: Request, ctx: Ctx) {
  return proxy(req, ctx);
}

export function POST(req: Request, ctx: Ctx) {
  return proxy(req, ctx);
}

export function PATCH(req: Request, ctx: Ctx) {
  return proxy(req, ctx);
}
