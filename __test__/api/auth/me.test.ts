import { GET } from "@/app/api/auth/me/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  getSessionUser: jest.fn(),
}));

const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: mockGet,
  })),
}));

import { getSessionUser } from "@/lib/auth";
const mockGetSessionUser = getSessionUser as jest.Mock;

const makeReq = () =>
  new NextRequest("http://localhost/api/auth/me", { method: "GET" });

describe("GET /api/auth/me", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null user if no session cookie", async () => {
    mockGet.mockReturnValueOnce(undefined);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user).toBeNull();
    expect(mockGetSessionUser).not.toHaveBeenCalled();
  });

  it("returns user if session is valid", async () => {
    mockGet.mockReturnValueOnce({ value: "raw_token" });
    mockGetSessionUser.mockResolvedValueOnce({
      user_id: 1,
      username: "testuser",
      role_id: 1,
    });

    const res = await GET(makeReq());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user.username).toBe("testuser");
    expect(mockGetSessionUser).toHaveBeenCalledWith("raw_token");
  });

  it("returns null user if session is invalid", async () => {
    mockGet.mockReturnValueOnce({ value: "bad_token" });
    mockGetSessionUser.mockResolvedValueOnce(null);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user).toBeNull();
  });

  it("returns 500 on error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockReturnValueOnce({ value: "raw_token" });
    mockGetSessionUser.mockRejectedValueOnce(new Error("DB down"));

    const res = await GET(makeReq());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Server error. Please try again.");
  });
});
