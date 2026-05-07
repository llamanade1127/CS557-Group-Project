import { GET } from "@/app/api/watchlist/route";

jest.mock("@/lib/db", () => ({
  pool: { execute: jest.fn() },
}));

jest.mock("@/lib/auth", () => ({
  getSessionUser: jest.fn(),
}));

const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: mockGet,
  })),
}));

import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const mockExecute = pool.execute as jest.Mock;
const mockGetSessionUser = getSessionUser as jest.Mock;

describe("GET /api/watchlist", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 if no session cookie", async () => {
    mockGet.mockReturnValueOnce(undefined);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 401 if session is invalid", async () => {
    mockGet.mockReturnValueOnce({ value: "bad_token" });
    mockGetSessionUser.mockResolvedValueOnce(null);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns watchlist for authenticated user", async () => {
    mockGet.mockReturnValueOnce({ value: "valid_token" });
    mockGetSessionUser.mockResolvedValueOnce({ user_id: 1, username: "testuser" });
    mockExecute.mockResolvedValueOnce([[
      { watchlist_id: 1, status: "WATCHING", anime_id: 1, title: "Naruto", genre: "Adventure", episodes: 220 },
      { watchlist_id: 2, status: "COMPLETED", anime_id: 2, title: "Bleach", genre: "Action", episodes: 366 },
    ]]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].title).toBe("Naruto");
    expect(data[1].status).toBe("COMPLETED");
  });

  it("returns empty array if watchlist is empty", async () => {
    mockGet.mockReturnValueOnce({ value: "valid_token" });
    mockGetSessionUser.mockResolvedValueOnce({ user_id: 1, username: "testuser" });
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(0);
  });

  it("returns 500 on DB error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockReturnValueOnce({ value: "valid_token" });
    mockGetSessionUser.mockResolvedValueOnce({ user_id: 1, username: "testuser" });
    mockExecute.mockRejectedValueOnce(new Error("DB down"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Server error.");
  });
});
