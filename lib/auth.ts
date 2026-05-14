import bcrypt from "bcryptjs";
import crypto from "crypto";
import { pool } from "./db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const BCRYPT_ROUNDS = 12;
const SESSION_DAYS = 7;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function generateRawToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function createSession(userId: number): Promise<string> {
  const raw = generateRawToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await pool.execute<ResultSetHeader>(
    "INSERT INTO Session (userId, tokenHash, expiresAt) VALUES (?, ?, ?)",
    [userId, hashToken(raw), expiresAt]
  );

  return raw;
}

export interface SessionUser {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
}

export async function getSessionUser(raw: string): Promise<SessionUser | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT u.user_id, u.username, u.email, u.role_id
     FROM Session s
     JOIN User u ON s.userId = u.user_id
     WHERE s.tokenHash = ? AND s.expiresAt > NOW()`,
    [hashToken(raw)]
  );

  if (rows.length === 0) return null;
  return rows[0] as SessionUser;
}

export async function deleteSession(raw: string): Promise<void> {
  await pool.execute("DELETE FROM Session WHERE tokenHash = ?", [hashToken(raw)]);
}
