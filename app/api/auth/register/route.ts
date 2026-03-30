// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email?.trim() || !password)
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );

    if (password.length < 8)
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );

    // Check for existing account
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing)
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: await hashPassword(password),
      },
    });

    // Start session
    const raw = await createSession(user.id);

    (await cookies()).set("session", raw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}