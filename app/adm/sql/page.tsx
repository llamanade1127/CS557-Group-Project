"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

type SingleResult =
  | { type: "rows"; columns: string[]; rows: Record<string, unknown>[] }
  | { type: "ok"; affectedRows: number; insertId: number; message: string };

type QueryResult = { results: SingleResult[] } | { error: string };

function ResultSetPanel({ result, index, total }: { result: SingleResult; index: number; total: number }) {
  const label = total > 1 ? `Statement ${index + 1} of ${total}` : null;

  return (
    <Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ px: 3, pt: 2, display: "block" }}>
          {label}
        </Typography>
      )}
      {result.type === "ok" ? (
        <Box sx={{ px: 3, py: 2 }}>
          <Alert severity="success" sx={{ mb: 0 }}>
            {result.message}
            {result.insertId > 0 && ` — insert ID: ${result.insertId}`}
          </Alert>
        </Box>
      ) : (
        <>
          <Box sx={{ px: 3, pt: label ? 1 : 2, pb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {result.rows.length} row{result.rows.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {result.columns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {result.rows.map((row, i) => (
                  <TableRow key={i} hover>
                    {result.columns.map((col) => (
                      <TableCell key={col} sx={{ fontFamily: "monospace", fontSize: 13 }}>
                        {row[col] === null ? (
                          <Typography component="span" variant="inherit" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                            NULL
                          </Typography>
                        ) : (
                          String(row[col])
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

export default function AdminSqlPage() {
  const [sql, setSql] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);

  async function runQuery() {
    if (!sql.trim()) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/adm/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error ?? `HTTP ${res.status}` });
      } else {
        setResult(data);
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Network error" });
    } finally {
      setRunning(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
  }

  const errorMsg = result && "error" in result ? result.error : null;
  const resultSets = result && "results" in result ? result.results : null;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 5 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        SQL Console
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Supports multiple statements and transactions. Runs directly against the database — use with care.
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField
          multiline
          fullWidth
          minRows={6}
          maxRows={20}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"BEGIN;\nUPDATE Anime SET episodes = 100 WHERE title = 'Naruto';\nSELECT * FROM Anime WHERE title = 'Naruto';\nROLLBACK;"}
          slotProps={{
            input: { sx: { fontFamily: "monospace", fontSize: 14 } },
          }}
          variant="outlined"
        />
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Button variant="contained" onClick={runQuery} disabled={running || !sql.trim()}>
            {running && <CircularProgress size={20} sx={{ mr: 1 }} />}
            Run
          </Button>
          <Typography variant="caption" color="text.secondary">
            Ctrl+Enter to run
          </Typography>
        </Box>
      </Paper>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {errorMsg}
        </Alert>
      )}

      {resultSets && (
        <Paper elevation={2}>
          {resultSets.map((r, i) => (
            <Box key={i}>
              {i > 0 && <Divider />}
              <ResultSetPanel result={r} index={i} total={resultSets.length} />
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
