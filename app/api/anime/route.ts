import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const anime = await prisma.anime.findMany({
      orderBy: { title: "asc" },
    });

    return new Response(JSON.stringify(anime), { status: 200 });
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
    const { title, genre, episodes, release_year, description } = body;

    if (!title || !genre || !episodes || !release_year) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const anime = await prisma.anime.create({
      data: { title, genre, episodes, release_year, description },
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
