import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("session")?.value;

    if (raw) await deleteSession(raw);

    cookieStore.delete("session");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[logout]", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
