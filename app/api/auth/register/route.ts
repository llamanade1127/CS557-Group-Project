import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();
    const cleanUsername = username?.trim();
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanUsername || !cleanEmail || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT user_id FROM User WHERE email = ? OR username = ? LIMIT 1",
      [cleanEmail, cleanUsername]
    );

    if ((existing as RowDataPacket[]).length > 0) {
      return NextResponse.json(
        { error: "An account with that email or username already exists." },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const [result] = await pool.execute<RowDataPacket[]>(
      "INSERT INTO User (username, email, password, role_id) VALUES (?, ?, ?, 1)",
      [cleanUsername, cleanEmail, hashed]
    );

    const insertId = (result as any).insertId;
    const raw = await createSession(insertId);

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
