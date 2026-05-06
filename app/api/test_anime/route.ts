// app/api/test_anime/route.ts
import {pool} from "@/lib/db"
export async function GET() {
    const [rows]= await pool.execute("SELECT * FROM Anime"); // fetch all entries
    return new Response(JSON.stringify(rows), { status: 200 });
}
