// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  const raw = (await cookies()).get("session")?.value;
  if (!raw) return NextResponse.json({ user: null });
  const user = await getSessionUser(raw);
  return NextResponse.json({ user });
}