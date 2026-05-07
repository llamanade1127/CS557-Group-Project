"use client";

import { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Divider,
  Table, TableHead, TableBody, TableRow, TableCell,
  CircularProgress, Box, Button, Chip,
} from "@mui/material";
import Link from "next/link";

type WatchlistEntry = {
  watchlist_id: number;
  status: string;
  anime: {
    title: string;
    genre: string;
    episodes: number;
  };
};

const STATUS_COLORS: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  WATCHING: "primary",
  COMPLETED: "success",
  DROPPED: "error",
  ON_HOLD: "warning",
  PLAN_TO_WATCH: "default",
};

export default function WatchlistCard() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data.slice(0, 5));
        else setError("Failed to load watchlist.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            Your Watchlist
          </Typography>
          <Button component={Link} href="/watchlist" size="small">
            View All
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {loading && <CircularProgress size={24} />}
        {error && <Typography color="error" variant="body2">{error}</Typography>}

        {!loading && !error && entries.length === 0 && (
          <Typography color="text.secondary" variant="body2">
            Your watchlist is empty.
          </Typography>
        )}

        {!loading && entries.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Genre</strong></TableCell>
                <TableCell align="center"><strong>Episodes</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.watchlist_id} hover>
                  <TableCell>{entry.anime.title}</TableCell>
                  <TableCell>{entry.anime.genre}</TableCell>
                  <TableCell align="center">{entry.anime.episodes}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={entry.status.replace(/_/g, " ")}
                      color={STATUS_COLORS[entry.status] ?? "default"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
