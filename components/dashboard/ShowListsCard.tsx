"use client";

import { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Divider,
  Table, TableHead, TableBody, TableRow, TableCell,
  CircularProgress,
} from "@mui/material";

type Anime = {
  anime_id: number;
  title: string;
  genre: string;
  episodes: number;
  release_year: number;
  description: string;
};

export default function ShowsListCard() {
  const [shows, setShows] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/anime")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setShows(data);
        else setError("Failed to load shows.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700}>
          Shows
        </Typography>

        <Divider sx={{ my: 2 }} />

        {loading && <CircularProgress size={24} />}
        {error && <Typography color="error" variant="body2">{error}</Typography>}

        {!loading && !error && shows.length === 0 && (
          <Typography color="text.secondary" variant="body2">
            No shows in the database yet.
          </Typography>
        )}

        {!loading && shows.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Genre</strong></TableCell>
                <TableCell align="center"><strong>Episodes</strong></TableCell>
                <TableCell align="center"><strong>Year</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shows.map((show) => (
                <TableRow key={show.anime_id} hover>
                  <TableCell>{show.title}</TableCell>
                  <TableCell>{show.genre}</TableCell>
                  <TableCell align="center">{show.episodes}</TableCell>
                  <TableCell align="center">{show.release_year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
