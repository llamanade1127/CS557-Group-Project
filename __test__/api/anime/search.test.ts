import { GET } from "@/app/api/anime/search/route";

jest.mock("@/lib/db", () => ({
  pool: {
    execute: jest.fn(),
  },
}));

global.fetch = jest.fn();

import { pool } from "@/lib/db";
const mockExecute = pool.execute as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

const makeReq = (q: string) =>
  new Request(`http://localhost/api/anime/search?q=${encodeURIComponent(q)}`);

describe("GET /api/anime/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if q is missing", async () => {
    const req = new Request("http://localhost/api/anime/search");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing query param: q");
  });

  it("returns DB results without calling Jikan if >= 5 results", async () => {
    const fakeAnime = Array.from({ length: 5 }, (_, i) => ({
      anime_id: i + 1,
      title: `Anime ${i + 1}`,
    }));
    mockExecute.mockResolvedValueOnce([fakeAnime]);

    const res = await GET(makeReq("action"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(5);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls Jikan and upserts results if DB has < 5 results", async () => {
    // first DB query returns 1 result
    mockExecute.mockResolvedValueOnce([[{ anime_id: 1, title: "Naruto" }]]);

    // mock Jikan response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        data: [
          { title: "Naruto Shippuden", episodes: 500, year: 2007, synopsis: "Continues.", genres: [{ name: "Adventure" }] },
          { title: "Naruto SD", episodes: 51, year: 2012, synopsis: "Chibi.", genres: [{ name: "Comedy" }] },
        ],
      }),
    });

    // upsert calls (one per Jikan result)
    mockExecute.mockResolvedValueOnce([{}]);
    mockExecute.mockResolvedValueOnce([{}]);

    // final re-query
    mockExecute.mockResolvedValueOnce([[
      { anime_id: 1, title: "Naruto" },
      { anime_id: 2, title: "Naruto SD" },
      { anime_id: 3, title: "Naruto Shippuden" },
    ]]);

    const res = await GET(makeReq("Naruto"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(3);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledTimes(4); // initial query + 2 upserts + final query
  });

  it("falls back to DB results if Jikan returns non-ok response", async () => {
    mockExecute.mockResolvedValueOnce([[{ anime_id: 1, title: "Bleach" }]]);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      headers: { get: () => "text/html" },
    });

    const res = await GET(makeReq("Bleach"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Bleach");
  });

  it("returns 500 on DB error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockExecute.mockRejectedValueOnce(new Error("DB down"));

    const res = await GET(makeReq("naruto"));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("DB down");
  });
});
