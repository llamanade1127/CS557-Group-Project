import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const raw = (await cookies()).get("session")?.value;
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getSessionUser(raw);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT w.watchlist_id, w.status, w.user_id, w.anime_id,
              a.title, a.genre, a.episodes, a.release_year, a.description
       FROM Watchlist w
       JOIN Anime a ON w.anime_id = a.anime_id
       WHERE w.user_id = ?
       ORDER BY a.title ASC`,
      [user.user_id]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[watchlist]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
