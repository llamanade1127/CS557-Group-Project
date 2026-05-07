import { POST } from "@/app/api/auth/login/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  pool: { execute: jest.fn() },
}));

jest.mock("@/lib/auth", () => ({
  verifyPassword: jest.fn(),
  createSession: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
  })),
}));

import { pool } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

const mockExecute = pool.execute as jest.Mock;
const mockVerify = verifyPassword as jest.Mock;
const mockCreateSession = createSession as jest.Mock;

const makeReq = (body: object) =>
  new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

const fakeUser = {
  user_id: 1,
  username: "testuser",
  password: "hashed_password",
  role_id: 1,
};

describe("POST /api/auth/login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 if username is missing", async () => {
    const res = await POST(makeReq({ password: "pass123" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Username and password are required.");
  });

  it("returns 400 if password is missing", async () => {
    const res = await POST(makeReq({ username: "testuser" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Username and password are required.");
  });

  it("returns 401 if user does not exist", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // no user found
    mockVerify.mockResolvedValueOnce(false); // dummy hash check

    const res = await POST(makeReq({ username: "nobody", password: "pass" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Invalid email or password.");
  });

  it("returns 401 if password is wrong", async () => {
    mockExecute.mockResolvedValueOnce([[fakeUser]]);
    mockVerify.mockResolvedValueOnce(false); // wrong password

    const res = await POST(makeReq({ username: "testuser", password: "wrong" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Invalid email or password.");
  });

  it("returns 200 and sets cookie on valid login", async () => {
    mockExecute.mockResolvedValueOnce([[fakeUser]]);
    mockVerify.mockResolvedValueOnce(true);
    mockCreateSession.mockResolvedValueOnce("raw_session_token");

    const res = await POST(makeReq({ username: "testuser", password: "correct" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockCreateSession).toHaveBeenCalledWith(fakeUser.user_id);
  });

  it("returns 500 on DB error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockExecute.mockRejectedValueOnce(new Error("DB down"));

    const res = await POST(makeReq({ username: "testuser", password: "pass" }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Server error. Please try again.");
  });
});
