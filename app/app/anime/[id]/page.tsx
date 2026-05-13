"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Anime = {
  anime_id: number;
  title: string;
  genre: string;
  episodes: number;
  release_year: number;
  description: string;
};

type RatingSummary = {
  average: number;
  count: number;
  userRating: number;
};

export default function AnimeDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const animeId = params.id as string;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState("");
  const [watchlistError, setWatchlistError] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    average: 0,
    count: 0,
    userRating:0,
  });
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingError, setRatingError] = useState("");

  useEffect(() => {
    async function fetchAnimeDetails() {
      try {
        const res = await fetch(`/api/anime/${animeId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch anime details");
        }

        const data = await res.json();
        setAnime(data);
      } catch {
        setError("Could not load anime details.");
      } finally {
        setLoading(false);
      }
    }

    if (animeId) {
      fetchAnimeDetails();
      fetchRatingSummary();
    }
  }, [animeId]);

  async function addToWatchlist() {
    setAdding(true);
    setWatchlistMessage("");
    setWatchlistError("");

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anime_id: animeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add to watchlist");
      }

      setWatchlistMessage("Added to your watchlist!");
    } catch (error) {
      setWatchlistError(
        error instanceof Error ? error.message : "Failed to add to watchlist",
      );
    } finally {
      setAdding(false);
    }
  }

  async function fetchRatingSummary() {
  try {
    const res = await fetch(`/api/ratings?animeId=${animeId}`);
    const data = await res.json();

    if (res.ok) {
      setRatingSummary(data);
      setSelectedRating(data.userRating || 0);
    }
  } catch {
    console.error("Failed to fetch rating summary");
  }
}

  async function submitRating(ratingScore: number) {
    setRatingMessage("");
    setRatingError("");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          animeId: Number(animeId),
          ratingScore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit rating");
      }

      setSelectedRating(ratingScore);
      setRatingMessage("Rating saved!");
      await fetchRatingSummary();
    } catch (error) {
      setRatingError(
        error instanceof Error ? error.message : "Failed to submit rating",
      );
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !anime) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || "Anime not found."}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/app/anime")}
        sx={{ mb: 2 }}
      >
        Back to Shows
      </Button>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {anime.title}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
            <Chip label={`Genre: ${anime.genre || "N/A"}`} />
            <Chip label={`Episodes: ${anime.episodes || "N/A"}`} />
            <Chip label={`Year: ${anime.release_year || "N/A"}`} />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" fontWeight={700} gutterBottom>
            Description
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.8 }}
          >
            {anime.description || "No description available."}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={addToWatchlist}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add to Watchlist"}
            </Button>

            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Rate this show
              </Typography>

              <Stack direction="row" spacing={1}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    onClick={() => submitRating(star)}
                    variant={star <= selectedRating ? "contained" : "outlined"}
                    sx={{ minWidth: 44 }}
                  >
                    ★
                  </Button>
                ))}
              </Stack>

              <Typography variant="body2" sx={{ mt: 1 }}>
                Your Rating:{" "}
                {selectedRating > 0 ? `${selectedRating} / 5` : "Not rated yet"}
              </Typography>

              <Typography variant="body2">
                Average Rating:{" "}
                {ratingSummary.count > 0
                  ? `${ratingSummary.average.toFixed(1)} / 5`
                  : "No ratings yet"}
              </Typography>

              <Typography variant="body2">
                Total Ratings: {ratingSummary.count}
              </Typography>
            </Box>
          </Stack>
          {ratingMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {ratingMessage}
            </Alert>
          )}

          {ratingError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {ratingError}
            </Alert>
          )}

          {watchlistMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {watchlistMessage}
            </Alert>
          )}

          {watchlistError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {watchlistError}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
