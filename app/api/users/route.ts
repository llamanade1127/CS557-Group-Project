import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

async function requireAdmin() {
  const raw = (await cookies()).get("session")?.value;
  if (!raw) return null;
  const user = await getSessionUser(raw);
  if (!user || user.role_id !== 2) return null;
  return user;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT user_id, username, email, role_id FROM User ORDER BY created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[users get]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId, username, password, role_id } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT role_id FROM User WHERE user_id = ?",
      [Number(userId)]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existing[0].role_id === 2 && password) {
      return NextResponse.json(
        { error: "Admin passwords must be changed from Settings section" },
        { status: 403 }
      );
    }

    if (role_id !== undefined && role_id !== null) {
      await pool.execute("UPDATE User SET role_id = ? WHERE user_id = ?", [Number(role_id), Number(userId)]);
    }

    if (username && username.trim()) {
      await pool.execute("UPDATE User SET username = ? WHERE user_id = ?", [username.trim(), Number(userId)]);
    }

    if (password && password.length >= 6) {
      const hashed = await hashPassword(password);
      await pool.execute("UPDATE User SET password = ? WHERE user_id = ?", [hashed, Number(userId)]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[users put]", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const id = Number(userId);

    await pool.execute("DELETE FROM Session WHERE userId = ?", [id]);
    await pool.execute("DELETE FROM Watchlist WHERE user_id = ?", [id]);
    await pool.execute("DELETE FROM User_Rating WHERE user_id = ?", [id]);
    await pool.execute("DELETE FROM User WHERE user_id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[users delete]", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
