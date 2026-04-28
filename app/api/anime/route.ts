// app/api/anime

import { prisma } from "@/lib/prisma";

type JikanAnime = {
  title: string;
  episodes?: number;
  year?: number;
  synopsis?: string;
  genres?: { name: string }[];
};

export async function GET() {
  try {
    // 1. Fetch data from an external API (example: Jikan API)
    const response = await fetch("https://api.jikan.moe/v4/anime?limit=10"); 
    const data = await response.json();

    // 2. Map API data into your Prisma Anime model
    const animeToInsert = data.data.map((anime: JikanAnime) => ({
      title: anime.title,
      genre: anime.genres?.map((g) => g.name).join(", ") || "Unknown",
      episodes: anime.episodes || 0,
      release_year: anime.year || 0,
      description: anime.synopsis || "",
    }));

    // 3. Insert into database (upsert to avoid duplicates by title)
    for (const anime of animeToInsert) {
      await prisma.anime.upsert({
        where: { title: anime.title }, // unique field to avoid duplicates
        update: {},                   // do nothing if it exists
        create: anime,                // create if it doesn’t exist
      });
    }

    return new Response(JSON.stringify({ success: true, inserted: animeToInsert.length }), {
      status: 200,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    } else {
      console.error(err);
      return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 });
    }
  }
}

// POST for users adding in Anime entries
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, genre, episodes, release_year, description } = body;

    if (!title || !genre || !episodes || !release_year) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const anime = await prisma.anime.upsert({
      where: {
        title_release_year: { title, release_year },
      },
      update: { genre, episodes, description },
      create: { title, genre, episodes, release_year, description },
    });

    return new Response(JSON.stringify(anime), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 });
  }
}