import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  try {
    const raw = (await cookies()).get("session")?.value;
    if (!raw) return NextResponse.json({ user: null });

    const user = await getSessionUser(raw);
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[me]", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
