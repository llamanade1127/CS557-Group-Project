import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows] = await pool.execute(
      "SELECT * FROM Anime WHERE anime_id = ?",
      [id]
    );

    const anime = Array.isArray(rows) ? rows[0] : null;

    if (!anime) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }

    return NextResponse.json(anime);
  } catch (error) {
    console.error("Anime detail fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch anime details" },
      { status: 500 }
    );
  }
}