import { prisma } from "@/lib/prisma";

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
  // This determines how many shows we get from the DB before having to query the API
  // If we have less than this ammount, we query the API
  const maxDb = 5;
  if (!q) {
    return new Response(JSON.stringify({ error: "Missing query param: q" }), { status: 400 });
  }

  try {
    // 1. Search our DB first
    const dbResults = await prisma.anime.findMany({
      where: {
        title: { contains: q.toLowerCase()  },
      },
      orderBy: { title: "asc" },
    });

    // 2. If we have enough, skip the external API
    if (dbResults.length >= 5) {
      return new Response(JSON.stringify(dbResults), { status: 200 });
    }

    // 3. Query Jikan for additional results
    const jikanRes = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10`
    );
    const jikanData = await jikanRes.json();

    const apiShows: JikanAnime[] = jikanData.data ?? [];

    // 4. Upsert shows that don't exist yet (matched by title + release_year)
    for (const anime of apiShows) {
      const release_year = anime.year || 0;
      await prisma.anime.upsert({
        where: { title_release_year: { title: anime.title, release_year } },
        update: {},
        create: {
          title: anime.title,
          genre: anime.genres?.map((g) => g.name).join(", ") || "Unknown",
          episodes: anime.episodes || 0,
          release_year,
          description: anime.synopsis || "",
        },
      });
    }

    // 5. Re-query DB to get the merged, de-duped list
    const merged = await prisma.anime.findMany({
      where: {
        title: { contains: q.toLowerCase() },
      },
      orderBy: { title: "asc" },
    });

    return new Response(JSON.stringify(merged), { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
