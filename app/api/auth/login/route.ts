import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

/**
 * Used to prevent timing attacks.
 */
const DUMMY_HASH =
  "$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    const valid = user
      ? await verifyPassword(password, user.password)
      : await verifyPassword(password, DUMMY_HASH).then(() => false);

    if (!user || !valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const raw = await createSession(user.id);

    (await cookies()).set("session", raw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
