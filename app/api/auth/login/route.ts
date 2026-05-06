import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

const DUMMY_HASH =
  "$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";

type UserRow = RowDataPacket & {
  user_id: number;
  username: string;
  password: string;
  role_id: number;
};

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const cleanUsername = username?.trim();

    if (!cleanUsername || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute<UserRow[]>(
      "SELECT * FROM User WHERE username = ?",
      [cleanUsername]
    );

    const user = rows[0] ?? null;

    const valid = user
      ? await verifyPassword(password, user.password)
      : await verifyPassword(password, DUMMY_HASH).then(() => false);

    if (!user || !valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const raw = await createSession(user.user_id);
    (await cookies()).set("session", raw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
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
