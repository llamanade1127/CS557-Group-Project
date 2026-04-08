// app/api/test_anime/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
    const allAnime = await prisma.anime.findMany(); // fetch all entries
    return new Response(JSON.stringify(allAnime), { status: 200 });
}