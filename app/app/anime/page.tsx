"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell,
  CircularProgress, Paper, Container, Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type Anime = {
  anime_id: number;
  title: string;
  genre: string;
  episodes: number;
  release_year: number;
  description: string;
};

export default function AnimePage() {
  const [query, setQuery] = useState("");
  const [shows, setShows] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromApi, setFromApi] = useState(false); // did we hit external API?

  const fetchShows = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    setFromApi(false);

    try {
      const url = q.trim()
        ? `/api/anime/search?q=${encodeURIComponent(q.trim())}`
        : "/api/anime";

      const r = await fetch(url);
      const data = await r.json();

      if (Array.isArray(data)) {
        setShows(data);
        // if we searched and got results, flag that API may have been queried
        if (q.trim()) setFromApi(true);
      } else {
        setError("Failed to load shows.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load — all shows
  useEffect(() => {
    fetchShows("");
  }, [fetchShows]);

  // debounce search input
  useEffect(() => {
    const timer = setTimeout(() => fetchShows(query), 400);
    return () => clearTimeout(timer);
  }, [query, fetchShows]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Anime Shows
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search your library. If we find fewer than 5 local matches, we'll pull from Jikan and save them.
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Search by title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" variant="body2">{error}</Typography>
      )}

      {!loading && !error && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              {shows.length} result{shows.length !== 1 ? "s" : ""}
            </Typography>
            {fromApi && query && (
              <Chip label="Includes results from Jikan API" size="small" variant="outlined" />
            )}
          </Box>

          {shows.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              No shows found{query ? ` for "${query}"` : ""}.
            </Typography>
          ) : (
            <Paper variant="outlined">
              <Table>
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
                      <TableCell align="center">{show.episodes || "—"}</TableCell>
                      <TableCell align="center">{show.release_year || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
}
