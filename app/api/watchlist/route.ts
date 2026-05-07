import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const watchlist = await prisma.watchlist.findMany
    ({
      where: { user_id: user.user_id },
      include: {
        anime: {
          select: {
            anime_id: true,
            title: true,
            cover_image: true,
            genre: true,
            episodes: true,
            release_year: true,
            description: true,
          },
        },
      },
      orderBy: { watchlist_id: "desc" },
    });

    const items = watchlist.map((entry) => 
    ({
      id: entry.watchlist_id.toString(),
      anime_id: entry.anime.anime_id,
      title: entry.anime.title,
      cover_image: entry.anime.cover_image,
      genre: entry.anime.genre,
      episodes: entry.anime.episodes,
      release_year: entry.anime.release_year,
      description: entry.anime.description,
      status: entry.status,
    }));

    return NextResponse.json(items);
  } catch (error) 
  {
    console.error("Watchlist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" },{ status: 500 });
  }
}

export async function DELETE(req: NextRequest) 
{
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await prisma.watchlist.delete({
    where: { watchlist_id: parseInt(id) },
  });

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

    
    const entry = await prisma.watchlist.create({
      data: {
        user_id: user.user_id,
        anime_id: parseInt(anime_id),
        status: "PLAN_TO_WATCH", 
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Already in your watchlist" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}