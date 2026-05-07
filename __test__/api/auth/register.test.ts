import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  pool: { execute: jest.fn() },
}));

jest.mock("@/lib/auth", () => ({
  hashPassword: jest.fn(),
  createSession: jest.fn(),
}));

const mockCookieSet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: mockCookieSet,
  })),
}));

import { pool } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

const mockExecute = pool.execute as jest.Mock;
const mockHash = hashPassword as jest.Mock;
const mockCreateSession = createSession as jest.Mock;

const makeReq = (body: object) =>
  new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

const validBody = {
  username: "testuser",
  email: "test@example.com",
  password: "password123",
};

describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 if fields are missing", async () => {
    const res = await POST(makeReq({ username: "testuser" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Username, email, and password are required.");
  });

  it("returns 400 if password is too short", async () => {
    const res = await POST(makeReq({ ...validBody, password: "short" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Password must be at least 8 characters.");
  });

  it("returns 400 if email is invalid", async () => {
    const res = await POST(makeReq({ ...validBody, email: "notanemail" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid email address.");
  });

  it("returns 409 if username or email already exists", async () => {
    mockExecute.mockResolvedValueOnce([[{ user_id: 1 }]]); // existing user found

    const res = await POST(makeReq(validBody));
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("An account with that email or username already exists.");
  });

  it("returns 200 and sets cookie on successful registration", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // no existing user
    mockExecute.mockResolvedValueOnce([{ insertId: 5 }]); // insert result
    mockHash.mockResolvedValueOnce("hashed_password");
    mockCreateSession.mockResolvedValueOnce("raw_token");

    const res = await POST(makeReq(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockCreateSession).toHaveBeenCalledWith(5);
    expect(mockCookieSet).toHaveBeenCalledWith("session", "raw_token", expect.any(Object));
  });

  it("returns 500 on DB error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockExecute.mockRejectedValueOnce(new Error("DB down"));

    const res = await POST(makeReq(validBody));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Server error. Please try again.");
  });
});
