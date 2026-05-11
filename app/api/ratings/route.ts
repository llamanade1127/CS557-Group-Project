import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, animeId, ratingScore } = body;

    if (!userId || !animeId || !ratingScore) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (ratingScore < 1 || ratingScore > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    // TODO: This would be a good place for a procedure
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT rating_id FROM User_Rating WHERE user_id = ? AND anime_id = ?",
      [userId, animeId]
    );

    if ((existing as RowDataPacket[]).length > 0) {
      await pool.execute<ResultSetHeader>(
        "UPDATE User_Rating SET rating_score = ? WHERE user_id = ? AND anime_id = ?",
        [ratingScore, userId, animeId]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        "INSERT INTO User_Rating (user_id, anime_id, rating_score) VALUES (?, ?, ?)",
        [userId, animeId, ratingScore]
      );
    }

    return NextResponse.json({ success: true, rating: { userId, animeId, ratingScore } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const animeId = Number(searchParams.get("animeId"));

    if (!animeId) {
      return NextResponse.json({ error: "animeId is required" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT rating_score FROM User_Rating WHERE anime_id = ?",
      [animeId]
    );

    const ratings = rows as RowDataPacket[];

    if (ratings.length === 0) {
      return NextResponse.json({ average: 0, count: 0 });
    }

    const total = ratings.reduce((sum, r) => sum + r.rating_score, 0);
    const average = total / ratings.length;

    return NextResponse.json({ average, count: ratings.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
