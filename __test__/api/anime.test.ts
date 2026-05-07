import { GET, POST } from "@/app/api/anime/route";

// mock the pool so we never hit the real DB
jest.mock("@/lib/db", () => ({
  pool: {
    execute: jest.fn(),
  },
}));

import { pool } from "@/lib/db";
const mockExecute = pool.execute as jest.Mock;

describe("GET /api/anime", () => {
  it("returns anime list sorted by title", async () => {
    mockExecute.mockResolvedValueOnce([[
      { anime_id: 1, title: "Attack on Titan", genre: "Action" },
      { anime_id: 2, title: "Bleach", genre: "Action" },
    ]]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].title).toBe("Attack on Titan");
  });

  it("returns 500 on DB error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB down"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("DB down");
  });
});

describe("POST /api/anime", () => {
  it("inserts a new anime and returns 201", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 5 }]);

    const req = new Request("http://localhost/api/anime", {
      method: "POST",
      body: JSON.stringify({
        title: "Naruto",
        genre: "Adventure",
        episodes: 220,
        release_year: 2002,
        description: "A ninja's journey.",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.anime_id).toBe(5);
    expect(data.title).toBe("Naruto");
  });

  it("returns 400 if required fields are missing", async () => {
    const req = new Request("http://localhost/api/anime", {
      method: "POST",
      body: JSON.stringify({ title: "Naruto" }), // missing genre, episodes, release_year
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });

  it("returns 409 on duplicate entry", async () => {
    const dupError = Object.assign(new Error("Duplicate"), { code: "ER_DUP_ENTRY" });
    mockExecute.mockRejectedValueOnce(dupError);

    const req = new Request("http://localhost/api/anime", {
      method: "POST",
      body: JSON.stringify({
        title: "Naruto",
        genre: "Adventure",
        episodes: 220,
        release_year: 2002,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("This anime already exists.");
  });
});
