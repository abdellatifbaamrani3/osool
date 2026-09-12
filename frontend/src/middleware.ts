import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/api/tracking/config") {
    return NextResponse.next();
  }

  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/tracking/config"],
};
