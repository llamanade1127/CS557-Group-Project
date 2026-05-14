import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";

async function requireAdmin() {
  const raw = (await cookies()).get("session")?.value;
  if (!raw) return null;
  const user = await getSessionUser(raw);
  if (!user || user.role_id !== 2) return null;
  return user;
}

async function resolveGenreId(genre: string): Promise<number> {
  await pool.execute("INSERT IGNORE INTO Genre (genre_name) VALUES (?)", [genre]);
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT genre_id FROM Genre WHERE genre_name = ?",
    [genre]
  );
  return rows[0].genre_id;
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, genre, release_year } = await req.json();

    if (!title || !genre || !release_year) {
      return NextResponse.json({ error: "Title, genre, and release year are required" }, { status: 400 });
    }

    const year = Number(release_year);
    const genreId = await resolveGenreId(genre.trim());

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO Anime (title, genre_id, release_year) VALUES (?, ?, ?)",
      [title.trim(), genreId, year]
    );

    return NextResponse.json({ success: true, anime_id: result.insertId });
  } catch (error) {
    console.error("[anime manage POST]", error);
    return NextResponse.json({ error: "Failed to add anime" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { anime_id, title, genre, release_year } = await req.json();

    if (!anime_id || !title || !genre || !release_year) {
      return NextResponse.json({ error: "Anime ID, title, genre, and release year are required" }, { status: 400 });
    }

    const year = Number(release_year);
    const genreId = await resolveGenreId(genre.trim());

    await pool.execute(
      "UPDATE Anime SET title = ?, genre_id = ?, release_year = ? WHERE anime_id = ?",
      [title.trim(), genreId, year, Number(anime_id)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[anime manage PUT]", error);
    return NextResponse.json({ error: "Failed to update anime" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const animeId = searchParams.get("id");

    if (!animeId) {
      return NextResponse.json({ error: "Anime ID is required" }, { status: 400 });
    }

    await pool.execute("DELETE FROM Anime WHERE anime_id = ?", [Number(animeId)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[anime manage DELETE]", error);
    return NextResponse.json({ error: "Failed to delete anime" }, { status: 500 });
  }
}
