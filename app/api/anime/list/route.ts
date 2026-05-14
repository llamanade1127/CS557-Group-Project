import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.anime_id, a.title, g.genre_name AS genre, a.release_year, a.episodes, a.description
       FROM Anime a
       JOIN Genre g ON a.genre_id = g.genre_id
       ORDER BY a.anime_id DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[anime list]", error);
    return NextResponse.json({ error: "Failed to fetch anime" }, { status: 500 });
  }
}
