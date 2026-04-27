import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Create or Update Rating
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, animeId, ratingScore } = body;

    // Validation
    if (!userId || !animeId || !ratingScore) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (ratingScore < 1 || ratingScore > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if rating already exists
    const existingRating = await prisma.user_Rating.findUnique({
      where: {
        user_id_anime_id: {
          user_id: userId,
          anime_id: animeId,
        },
      },
    });

    let rating;

    if (existingRating) {
      // Update existing rating
      rating = await prisma.user_Rating.update({
        where: {
          user_id_anime_id: {
            user_id: userId,
            anime_id: animeId,
          },
        },
        data: {
          rating_score: ratingScore,
        },
      });
    } else {
      // Create new rating
      rating = await prisma.user_Rating.create({
        data: {
          user_id: userId,
          anime_id: animeId,
          rating_score: ratingScore,
        },
      });
    }

    return NextResponse.json({ success: true, rating });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// GET: Get average rating for an anime
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const animeId = Number(searchParams.get("animeId"));

    if (!animeId) {
      return NextResponse.json(
        { error: "animeId is required" },
        { status: 400 }
      );
    }

    // Get ratings
    const ratings = await prisma.user_Rating.findMany({
      where: {
        anime_id: animeId,
      },
    });

    if (ratings.length === 0) {
      return NextResponse.json({
        average: 0,
        count: 0,
      });
    }

    const total = ratings.reduce((sum, r) => sum + r.rating_score, 0);
    const average = total / ratings.length;

    return NextResponse.json({
      average,
      count: ratings.length,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}