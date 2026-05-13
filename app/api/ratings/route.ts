import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const raw = (await cookies()).get("session")?.value;

    if (!raw) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getSessionUser(raw);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { animeId, ratingScore } = body;

    if (!animeId || !ratingScore) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (ratingScore < 1 || ratingScore > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      "CALL proc_update_user_rating(?, ?, ?)",
      [ratingScore, user.user_id, animeId]
    );

    /*
    if (existing.length > 0) {
      await pool.execute<ResultSetHeader>(
        "UPDATE User_Rating SET rating_score = ? WHERE user_id = ? AND anime_id = ?",
        [ratingScore, user.user_id, animeId]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        "INSERT INTO User_Rating (user_id, anime_id, rating_score) VALUES (?, ?, ?)",
        [user.user_id, animeId, ratingScore]
      );
    }*/

    return NextResponse.json({
      success: true,
      rating: {
        userId: user.user_id,
        animeId,
        ratingScore,
      },
    });
  } catch (error) {
    console.error("Rating POST error:", error);
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

    let average = 0;
    let count = ratings.length;

    if (count > 0) {
      const total = ratings.reduce((sum, r) => sum + Number(r.rating_score), 0);
      average = total / count;
    }

    let userRating = 0;

    const raw = (await cookies()).get("session")?.value;

    if (raw) {
      const user = await getSessionUser(raw);

      if (user) {
        const [userRows] = await pool.execute<RowDataPacket[]>(
          "SELECT rating_score FROM User_Rating WHERE user_id = ? AND anime_id = ?",
          [user.user_id, animeId]
        );

        if (userRows.length > 0) {
          userRating = Number(userRows[0].rating_score);
        }
      }
    }

    return NextResponse.json({
      average,
      count,
      userRating,
    });
  } catch (error) {
    console.error("Rating GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
