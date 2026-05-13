import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(_req: NextRequest) {
  try {
    const raw = (await cookies()).get("session")?.value;
    if (!raw) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getSessionUser(raw);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.created_at,
        r.role_name,
        (
          SELECT COUNT(*)
          FROM Watchlist w
          WHERE w.user_id = u.user_id
        ) AS watchlist_count,
        (
          SELECT COUNT(*)
          FROM User_Rating ur
          WHERE ur.user_id = u.user_id
        ) AS ratings_count
      FROM User u
      JOIN Role r ON u.role_id = r.role_id
      WHERE u.user_id = ?
      `,
      [user.user_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[profile GET]", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const raw = (await cookies()).get("session")?.value;
    if (!raw) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getSessionUser(raw);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, email } = await req.json();

    if (!username || !email) {
      return NextResponse.json(
        { error: "Username and email required" },
        { status: 400 }
      );
    }

    await pool.execute(
      `CALL update_user_profile(?, ?, ?)`,
      [user.user_id, username, email]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[profile PUT]", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}