import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT anime_id, title, genre_name AS genre, genre_id, description, release_year, episodes, avg_rating
       FROM anime_detailed_info
       ORDER BY anime_id DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[anime list]", error);
    return NextResponse.json({ error: "Failed to fetch anime" }, { status: 500 });
  }
}
