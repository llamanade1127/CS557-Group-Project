import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import mysql from "mysql2/promise";
import type { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";

const ADMIN_ROLE_ID = 2;

type ResultSet =
  | { type: "rows"; columns: string[]; rows: RowDataPacket[] }
  | { type: "ok"; affectedRows: number; insertId: number; message: string };

function formatOne(
  rows: RowDataPacket[] | ResultSetHeader,
  fields: FieldPacket[] | undefined,
): ResultSet {
  if (Array.isArray(rows)) {
    return { type: "rows", columns: fields?.map((f) => f.name) ?? [], rows };
  }
  return {
    type: "ok",
    affectedRows: rows.affectedRows,
    insertId: rows.insertId,
    message: `Query OK — ${rows.affectedRows} row(s) affected`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const raw = (await cookies()).get("session")?.value;
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getSessionUser(raw);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role_id !== ADMIN_ROLE_ID)
      return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });

    const body = await req.json();
    const sql: string = body?.sql;
    if (!sql || typeof sql !== "string" || !sql.trim()) {
      return NextResponse.json({ error: "No SQL query provided" }, { status: 400 });
    }

    const conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      multipleStatements: true,
    });

    try {
      const [results, fields] = await conn.query(sql.trim());

      // Detect multi-statement by counting non-empty statements
      const stmtCount = sql.trim().split(";").map((s) => s.trim()).filter(Boolean).length;

      let resultSets: ResultSet[];
      if (stmtCount > 1) {
        const rowsArr = results as (RowDataPacket[] | ResultSetHeader)[];
        const fieldsArr = fields as (FieldPacket[] | undefined)[];
        resultSets = rowsArr.map((r, i) => formatOne(r, fieldsArr?.[i]));
      } else {
        resultSets = [
          formatOne(
            results as RowDataPacket[] | ResultSetHeader,
            fields as FieldPacket[] | undefined,
          ),
        ];
      }

      return NextResponse.json({ results: resultSets });
    } finally {
      await conn.end();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
