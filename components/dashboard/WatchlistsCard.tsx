"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Divider, CircularProgress, Box, Chip } from "@mui/material";
import Link from "next/link";

interface WatchlistItem {
  id: string;
  title: string;
  status: string;
  episodes: number;
  release_year: number;
}

export default function WatchlistCard() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWatchlist() {
      try {
        const response = await fetch("/api/watchlist");
        const data = await response.json();

        if (!response.ok) {
          console.warn("Watchlist fetch error:", data.error);
          setError(null);
          return;
        }

        setItems(data.slice(0, 5));
      } catch (err) {
        console.error("Watchlist fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlist();
  }, []);

  const getStatusColor = (status: string): "error" | "warning" | "success" | "info" => {
    switch (status) {
      case "COMPLETED":    return "success";
      case "WATCHING":     return "info";
      case "PLAN_TO_WATCH": return "warning";
      default:             return "error";
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Your Watchlist
        </Typography>

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body2">{error}</Typography>
        ) : items.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            Your watchlist is empty.{" "}
            <Link href="/app/anime" style={{ color: "inherit", textDecoration: "underline" }}>
              Add some anime
            </Link>
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {items.filter((item) => item.status !== "DROPPED").map((item) => (
              <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                  {item.title}
                </Typography>
                <Chip
                  label={item.status.replace(/_/g, " ")}
                  size="small"
                  color={getStatusColor(item.status)}
                  variant="outlined"
                />
              </Box>
            ))}
            <Link href="/app/watchlists" style={{ textDecoration: "none" }}>
              <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 500, mt: 1 }}>
                View All
              </Typography>
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
