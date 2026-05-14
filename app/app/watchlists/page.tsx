"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from "@mui/material";

enum WatchStatus {
  COMPLETED = "COMPLETED",
  WATCHING = "WATCHING",
  PLAN_TO_WATCH = "PLAN_TO_WATCH",
  DROPPED = "DROPPED",
  ON_HOLD = "ON_HOLD",
}


interface WatchlistItem {
  id: string;
  anime_id: number;
  title: string;
  status: WatchStatus;
  genre: string;
  episodes: number;
  release_year: number;
  description: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWatchlist() {
      try {
        const response = await fetch("/api/watchlist");
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Failed to fetch watchlist");
        } else {
          setItems(data);
        }
      } catch {
        setError("An error occurred while fetching your watchlist");
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlist();
  }, []);

  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === "title") return a.title.localeCompare(b.title);
    if (sortOrder === "watchStatus") return a.status.localeCompare(b.status);
    return parseInt(b.id) - parseInt(a.id);
  });

  async function handleStatusChange(watchlistId: string, newStatus: WatchStatus) {
    setItems((prev) =>
      prev.map((item) => item.id === watchlistId ? { ...item, status: newStatus } : item)
    );
    try {
      await fetch(`/api/watchlist?id=${watchlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      console.error("Failed to update status");
    }
  }

  async function handleRemove(watchlistId: string, title: string) {
    try {
      await fetch(`/api/watchlist?id=${watchlistId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== watchlistId));
      setToast(`${title} has been removed.`);
    } catch {
      console.error("Failed to delete");
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 6, px: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          My Watchlist
        </Typography>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="sort-label">Sort by</InputLabel>
          <Select
            labelId="sort-label"
            value={sortOrder}
            label="Sort by"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="newest">Recently Added</MenuItem>
            <MenuItem value="title">A–Z (Title)</MenuItem>
            <MenuItem value="watchStatus">Watch Status</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {items.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={10}>
          Your watchlist is empty. Browse the shows and add some!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {sortedItems.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.3, mr: 1 }}>
                      {item.title}
                    </Typography>
                    <FormControl size="small" sx={{ flexShrink: 0, minWidth: 130 }}>
                      <Select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as WatchStatus)}
                        sx={{ fontSize: 13 }}
                      >
                        {Object.values(WatchStatus).map((s) => (
                          <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                            {s.replace(/_/g, " ")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    {item.release_year} · {item.genre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {item.episodes} episodes
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {item.description}
                  </Typography>
                </CardContent>

                <Box sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    fullWidth
                    onClick={() => handleRemove(item.id, item.title)}
                  >
                    Remove
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast}
      />
    </Box>
  );
}
