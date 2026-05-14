import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

const PROTECTED = ["/app"];
const AUTH_ONLY  = ["/login", "/register", "/admin_login"];

async function sessionIsValid(raw: string): Promise<boolean> {
  try {
    const tokenHash = createHash("sha256").update(raw).digest("hex");
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT 1 FROM Session WHERE tokenHash = ? AND expiresAt > NOW()",
      [tokenHash]
    );
    return (rows as RowDataPacket[]).length > 0;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const raw = req.cookies.get("session")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname.startsWith(p));

  const valid = raw ? await sessionIsValid(raw) : false;

  if (isProtected && !valid) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthOnly && valid) {
    return NextResponse.redirect(new URL("/app/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register", "/admin_login"],
};
