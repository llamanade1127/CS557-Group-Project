import { pool } from "@/lib/db";
import { ResultSetHeader } from "mysql2";

type JikanAnime = {
  title: string;
  episodes?: number;
  year?: number;
  synopsis?: string;
  genres?: { name: string }[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return new Response(JSON.stringify({ error: "Missing query param: q" }), { status: 400 });
  }

  try {
    // 1. Search our DB first
    const [dbResults] = await pool.execute(
      `SELECT anime_id, title, genre_name AS genre, genre_id, description, release_year, episodes, avg_rating
       FROM anime_detailed_info WHERE title LIKE ? ORDER BY title ASC`,
      [`%${q.toLowerCase()}%`]
    );

    const results = dbResults as any[];

    // 2. If we have enough, skip the external API
    if (results.length >= 5) {
      return new Response(JSON.stringify(results), { status: 200 });
    }

    // 3. Query Jikan for additional results
    const jikanRes = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10`,
      { headers: { "User-Agent": "anime-watchlist-app/1.0" } }
    );

    console.log("Jikan status: " + jikanRes.status);

    if (!jikanRes.ok || !jikanRes.headers.get("content-type")?.includes("application/json")) {
      return new Response(JSON.stringify(results), { status: 200 });
    }

    const jikanData = await jikanRes.json();
    const apiShows: JikanAnime[] = jikanData.data ?? [];

    // 4. Upsert shows that don't exist yet
    for (const anime of apiShows) {
      const episodes = anime.episodes || 0;
      if (episodes <= 0) continue; // CHECK constraint requires episodes > 0

      const release_year = anime.year || new Date().getFullYear();
      const genreName = anime.genres?.[0]?.name || "Unknown";
      const description = anime.synopsis || "";

      await pool.execute(
        `INSERT IGNORE INTO Genre (genre_name) VALUES (?)`,
        [genreName]
      );

      const [genreRows] = await pool.execute(
        `SELECT genre_id FROM Genre WHERE genre_name = ?`,
        [genreName]
      ) as any[];

      const genre_id = genreRows[0]?.genre_id;
      if (!genre_id) continue;

      await pool.execute(
        `INSERT INTO Anime (title, genre_id, episodes, release_year, description)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = title`,
        [anime.title, genre_id, episodes, release_year, description]
      );
    }

    // 5. Re-query DB to get merged de-duped list
    const [merged] = await pool.execute(
      `SELECT anime_id, title, genre_name AS genre, genre_id, description, release_year, episodes, avg_rating
       FROM anime_detailed_info WHERE title LIKE ? ORDER BY title ASC`,
      [`%${q.toLowerCase()}%`]
    );

    return new Response(JSON.stringify(merged), { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
