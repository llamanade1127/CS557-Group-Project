"use client";

import { useEffect, useState } from "react";

type Anime = {
  anime_id: number;
  title: string;
  genre: string | null;
  episodes: number | null;
  release_year: number | null;
  description: string | null;
};

type RatingSummary = {
  average: number;
  count: number;
};

export default function Home() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [ratings, setRatings] = useState<Record<number, RatingSummary>>({});
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const testUserId = 1; // temporary until login is connected

  useEffect(() => {
    fetchAnime();
  }, []);

  async function fetchAnime() {
    try {
      const res = await fetch("/api/test_anime");
      const data = await res.json();

      setAnimeList(data);

      data.forEach((anime: Anime) => {
        fetchRating(anime.anime_id);
      });
    } catch (error) {
      console.error("Failed to fetch anime:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRating(animeId: number) {
    try {
      const res = await fetch(`/api/ratings?animeId=${animeId}`);
      const data = await res.json();

      setRatings((prev) => ({
        ...prev,
        [animeId]: data,
      }));
    } catch (error) {
      console.error("Failed to fetch rating:", error);
    }
  }

  async function submitRating(animeId: number, ratingScore: number) {
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: testUserId,
          animeId,
          ratingScore,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit rating");
      }

      setUserRatings((prev) => ({
        ...prev,
        [animeId]: ratingScore,
      }));

      await fetchRating(animeId);
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  }

  if (loading) {
    return <main style={{ padding: "2rem" }}>Loading anime...</main>;
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>AniMaList</h1>
      <p>Rate your favorite anime</p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        {animeList.map((anime) => {
          const selectedRating = userRatings[anime.anime_id] || 0;
          const ratingSummary = ratings[anime.anime_id];

          return (
            <div
              key={anime.anime_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "1rem",
                maxWidth: "600px",
              }}
            >
              <h2>{anime.title}</h2>

              <p>
                <strong>Genre:</strong> {anime.genre || "N/A"}
              </p>

              <p>
                <strong>Episodes:</strong> {anime.episodes || "N/A"}
              </p>

              <p>
                <strong>Release Year:</strong> {anime.release_year || "N/A"}
              </p>

              <p>{anime.description || "No description available."}</p>

              <div style={{ marginTop: "1rem" }}>
                <strong>Rate this anime:</strong>

                <div style={{ marginTop: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => submitRating(anime.anime_id, star)}
                      style={{
                        fontSize: "1.8rem",
                        marginRight: "0.25rem",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        opacity: star <= selectedRating ? 1 : 0.35,
                      }}
                    >
                      {star <= selectedRating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>

                <p>
                  <strong>Your Rating:</strong>{" "}
                  {selectedRating > 0 ? `${selectedRating} / 5` : "Not rated yet"}
                </p>
              </div>

              <p style={{ marginTop: "1rem" }}>
                <strong>Average Rating:</strong>{" "}
                {ratingSummary?.count > 0
                  ? `${ratingSummary.average.toFixed(1)} / 5`
                  : "No ratings yet"}
              </p>

              <p>
                <strong>Total Ratings:</strong> {ratingSummary?.count || 0}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}