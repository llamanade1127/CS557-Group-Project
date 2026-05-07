// app/api/anime

import { prisma } from "@/lib/prisma";

type JikanAnime = {
  title: string;
  episodes?: number;
  year?: number;
  synopsis?: string;
  genres?: { name: string }[];
  images?: {
    jpg?: {
      large_image_url?: string;
    };
  };
};

export async function GET() {
  try {
    // 1. Fetch data from an external API (example: Jikan API)
    const response = await fetch("https://api.jikan.moe/v4/anime?limit=10", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (response.status === 403) {
      return new Response(JSON.stringify({ error: "Access Forbidden: Try adding a User-Agent or checking your IP." }), { status: 403 });
    }

    const data = await response.json();

    // 2. Map API data into your Prisma Anime model
    const animeToInsert = data.data.map((anime: JikanAnime) => ({
      title: anime.title,
      cover_image: anime.images?.jpg?.large_image_url || "",
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
    const { title, cover_image, genre, episodes, release_year, description } = body;

    if (!title || !genre || !episodes || !release_year) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const anime = await prisma.anime.create({
      data: { title, cover_image, genre, episodes, release_year, description },
    });

    return new Response(JSON.stringify(anime), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).code === "P2002") {
      return new Response(JSON.stringify({ error: "This anime already exists." }), { status: 409 });
    }
    if (err instanceof Error) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 });
  }
}