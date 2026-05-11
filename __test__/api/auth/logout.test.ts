import { POST } from "@/app/api/auth/logout/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  deleteSession: jest.fn(),
}));

const mockDelete = jest.fn();
const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: mockGet,
    delete: mockDelete,
  })),
}));

import { deleteSession } from "@/lib/auth";
const mockDeleteSession = deleteSession as jest.Mock;

const makeReq = () =>
  new NextRequest("http://localhost/api/auth/logout", { method: "POST" });

describe("POST /api/auth/logout", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes session and clears cookie if session exists", async () => {
    mockGet.mockReturnValueOnce({ value: "raw_token" });
    mockDeleteSession.mockResolvedValueOnce(undefined);

    const res = await POST(makeReq());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockDeleteSession).toHaveBeenCalledWith("raw_token");
    expect(mockDelete).toHaveBeenCalledWith("session");
  });

  it("clears cookie even if no session cookie exists", async () => {
    mockGet.mockReturnValueOnce(undefined);

    const res = await POST(makeReq());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockDeleteSession).not.toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith("session");
  });

  it("returns 500 if deleteSession throws", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockReturnValueOnce({ value: "raw_token" });
    mockDeleteSession.mockRejectedValueOnce(new Error("DB down"));

    const res = await POST(makeReq());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Server error. Please try again.");
  });
});
