import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Pixel IDs must be read at request time. Next.js inlines `process.env.NEXT_PUBLIC_*`
 * at build, so setting them only as EasyPanel runtime env leaves the client bundle empty.
 * Bracket access here is intentional — it prevents that inlining.
 */
function readEnv(...names: string[]): string {
  const env = process.env;
  for (const name of names) {
    const value = env[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function GET() {
  return NextResponse.json(
    {
      meta: readEnv("NEXT_PUBLIC_META_PIXEL_ID", "META_PIXEL_ID"),
      tiktok: readEnv("NEXT_PUBLIC_TIKTOK_PIXEL_CODE", "TIKTOK_PIXEL_CODE"),
      snap: readEnv("NEXT_PUBLIC_SNAP_PIXEL_ID", "SNAP_PIXEL_ID"),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
