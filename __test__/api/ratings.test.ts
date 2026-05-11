import { POST, GET } from "@/app/api/ratings/route";

jest.mock("@/lib/db", () => ({
  pool: { execute: jest.fn() },
}));

import { pool } from "@/lib/db";
const mockExecute = pool.execute as jest.Mock;

const makePostReq = (body: object) =>
  new Request("http://localhost/api/ratings", {
    method: "POST",
    body: JSON.stringify(body),
  });

const makeGetReq = (animeId?: number) =>
  new Request(`http://localhost/api/ratings${animeId ? `?animeId=${animeId}` : ""}`);

describe("POST /api/ratings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 if fields are missing", async () => {
    const res = await POST(makePostReq({ userId: 1, animeId: 2 }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing fields");
  });

  it("returns 400 if rating is out of range", async () => {
    const res = await POST(makePostReq({ userId: 1, animeId: 2, ratingScore: 6 }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Rating must be between 1 and 5");
  });

  it("updates existing rating", async () => {
    mockExecute.mockResolvedValueOnce([[{ rating_id: 1 }]]); // existing found
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // update

    const res = await POST(makePostReq({ userId: 1, animeId: 2, ratingScore: 4 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("inserts new rating if none exists", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // no existing
    mockExecute.mockResolvedValueOnce([{ insertId: 5 }]); // insert

    const res = await POST(makePostReq({ userId: 1, animeId: 2, ratingScore: 3 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("returns 500 on DB error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockExecute.mockRejectedValueOnce(new Error("DB down"));

    const res = await POST(makePostReq({ userId: 1, animeId: 2, ratingScore: 3 }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Something went wrong");
  });
});

describe("GET /api/ratings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 if animeId is missing", async () => {
    const res = await GET(makeGetReq());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("animeId is required");
  });

  it("returns average 0 and count 0 if no ratings", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await GET(makeGetReq(1));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.average).toBe(0);
    expect(data.count).toBe(0);
  });

  it("returns correct average and count", async () => {
    mockExecute.mockResolvedValueOnce([[
      { rating_score: 4 },
      { rating_score: 2 },
      { rating_score: 3 },
    ]]);

    const res = await GET(makeGetReq(1));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.average).toBe(3);
    expect(data.count).toBe(3);
  });

  it("returns 500 on DB error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockExecute.mockRejectedValueOnce(new Error("DB down"));

    const res = await GET(makeGetReq(1));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Something went wrong");
  });
});
