import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prisma";

const BCRYPT_ROUNDS = 12;
const SESSION_DAYS = 7;

// ── Passwords ─────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Always runs bcrypt even when the user doesn't exist — prevents timing attacks. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── Session tokens ────────────────────────────────────────────

function generateRawToken(): string {
  return crypto.randomBytes(48).toString("hex"); // 96-char hex, sent as cookie
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex"); // stored in DB
}

// ── Session CRUD ──────────────────────────────────────────────

export async function createSession(userId: number): Promise<string> {
  const raw = generateRawToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt,
    },
  });

  return raw; // caller sets this as an HttpOnly cookie
}

export interface SessionUser {
  id: number;
  email: string;
}

export async function getSessionUser(raw: string): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function deleteSession(raw: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(raw) } });
}
