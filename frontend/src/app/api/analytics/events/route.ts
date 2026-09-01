import { backendFetch, proxyBackendResponse } from "@/lib/backend-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  for (const name of [
    "user-agent",
    "cf-connecting-ip",
    "x-forwarded-for",
    "x-real-ip",
    "true-client-ip",
  ]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const res = await backendFetch("/api/analytics/events", {
    method: "POST",
    headers,
    body: await req.text(),
  });
  return proxyBackendResponse(res);
}
