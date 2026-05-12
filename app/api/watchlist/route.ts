import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export async function GET(req: NextRequest)
{
  try
  {
    const raw = (await cookies()).get("session")?.value;
    if (!raw)
    {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getSessionUser(raw);
    if (!user)
    {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         w.watchlist_id AS id,
         a.anime_id,
         a.title,
         a.genre,
         a.episodes,
         a.release_year,
         a.description,
         w.status
       FROM Watchlist w
       JOIN Anime a ON a.anime_id = w.anime_id
       WHERE w.user_id = ?
       ORDER BY w.watchlist_id DESC`,
      [user.user_id],
    );

    const items = rows.map((row) => ({
      id: row.id.toString(),
      anime_id: row.anime_id,
      title: row.title,
      genre: row.genre,
      episodes: row.episodes,
      release_year: row.release_year,
      description: row.description,
      status: row.status,
    }));

    return NextResponse.json(items);
  }
  catch (error)
  {
    console.error("Watchlist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest)
{
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await pool.execute<ResultSetHeader>(
    "DELETE FROM Watchlist WHERE watchlist_id = ?",
    [parseInt(id)],
  );

  return NextResponse.json({ success: true });
}

export async function POST(req: Request)
{
  try
  {
    const raw = (await cookies()).get("session")?.value;
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getSessionUser(raw);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { anime_id } = await req.json();
    if (!anime_id) return NextResponse.json({ error: "Missing Anime ID" }, { status: 400 });

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO Watchlist (user_id, anime_id, status) VALUES (?, ?, 'PLAN_TO_WATCH')",
      [user.user_id, parseInt(anime_id)],
    );

    return NextResponse.json({ success: true, watchlist_id: result.insertId });
  }
  catch (err: unknown)
  {
    if (err instanceof Error && (err as any).code === "ER_DUP_ENTRY")
    {
      return NextResponse.json({ error: "Already in your watchlist" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}
