import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const raw = (await cookies()).get("session")?.value;
  if (!raw) return null;
  const user = await getSessionUser(raw);
  if (!user || user.role_id !== 2) return null;
  return user;
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId, currentPassword, newPassword, confirmPassword } = await req.json();

    if (!userId || !currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT password FROM User WHERE user_id = ?",
      [Number(userId)]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) {
      return NextResponse.json({ error: "Current password incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.execute("UPDATE User SET password = ? WHERE user_id = ?", [hashed, Number(userId)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[change-password]", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
