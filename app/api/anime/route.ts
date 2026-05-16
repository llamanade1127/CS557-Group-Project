import {pool} from "@/lib/db"
import {ResultSetHeader, RowDataPacket} from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT anime_id, title, genre_name AS genre, genre_id, description, release_year, episodes, avg_rating
       FROM anime_detailed_info
       ORDER BY title ASC`
    );


    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

// POST for users adding in Anime entries
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, cover_image, genre, episodes, release_year, description } = body;

    if (!title || !genre || !episodes || !release_year) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const [existingGenres] = await pool.execute<RowDataPacket[]>("SELECT genre_id FROM Genre WHERE genre_name = ?", [genre]);

    let genre_id: number;

    if(existingGenres.length > 0 ) {
      genre_id = existingGenres[0].id;
    } else {
      const [genreResult] = await pool.execute<ResultSetHeader>("INSERT INTO Genre (genre_name) VALUES (?)", [genre]);
      genre_id = genreResult.insertId;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO Anime (title, genre_id, episodes, release_year, description) VALUES (?, ?, ?, ?, ?)",
      [title, genre_id, episodes, release_year, description ?? ""]
    );

    return new Response(JSON.stringify({anime_id: result.insertId, title, genre, episodes, release_year, description}), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).code === "ER_DUP_ENTRY") {
      return new Response(JSON.stringify({ error: "This anime already exists." }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 });
  }
}
