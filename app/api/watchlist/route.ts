import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const raw = (await cookies()).get("session")?.value;
  if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSessionUser(raw);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const watchlist = await prisma.watchlist.findMany({
    where: { user_id: user.user_id },
    include: { anime: true },
    orderBy: { anime: { title: "asc" } },
  });

  return NextResponse.json(watchlist);
}
