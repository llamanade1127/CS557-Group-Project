// proxy.ts  (project root, next to package.json)
// Next.js 16 renamed middleware.ts → proxy.ts and the export middleware → proxy
import { NextRequest, NextResponse } from "next/server";

// ── Which routes require a logged-in user? ────────────────────
const PROTECTED = ["/dashboard", "/watchlist", "/profile"];

// ── Which routes should redirect to dashboard if ALREADY logged in?
const AUTH_ONLY = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const raw = req.cookies.get("session")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname.startsWith(p));

  // Can't query Prisma in the edge runtime, so we do a lightweight check:
  // does the cookie exist and is it the right length?
  // Full DB validation still happens in API routes and pages.
  const hasSessionCookie = !!raw && raw.length === 96;

  if (isProtected && !hasSessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && hasSessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/watchlist/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};