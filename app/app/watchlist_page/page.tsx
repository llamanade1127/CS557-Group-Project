"use client";

import { useEffect, useState } from "react";
import "./style.css";

enum WatchStatus {
  COMPLETED = "COMPLETED",
  WATCHING = "WATCHING",
  PLAN_TO_WATCH = "PLAN_TO_WATCH",
  DROPPED = "DROPPED",
}

interface WatchlistItem {
  id: string;
  anime_id: number;
  title: string;
  status: WatchStatus;
  cover_image?: string;
  genre: string;
  episodes: number;
  release_year: number;
  description: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [minEpisodes, setMinEpisodes] = useState(0);

  useEffect(() => {
    async function fetchWatchlist() {
      try {
        const response = await fetch(
          `/api/watchlist?minEpisodes=${minEpisodes}`,
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch watchlist");
          setItems([]);
        } else {
          setItems(data);
        }
      } catch (err) {
        setError("An error occurred while fetching your watchlist");
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlist();
  }, [minEpisodes]);

  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "watchStatus") {
      return a.status.localeCompare(b.status);
    } else {
      return parseInt(b.id) - parseInt(a.id);
    }
  });

  const handleRemove = async (watchlistId: string, title: string) => {
    try {
      await fetch(`/api/watchlist?id=${watchlistId}`, { method: "DELETE" });

      setItems((prev) => prev.filter((item) => item.id !== watchlistId));
      setMessage(`${title} has been removed.`);

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) return <div>Loading watchlist...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <section style={{ backgroundColor: "#482fa0", color: "black" }}>
      <div className="watchlist-container">
        {message && <div className="remove-message">{message}</div>}

        <header className="watchlist-header">
          <h1>My Watchlist</h1>
        </header>

        <div className="filter-container">
          <label htmlFor="sort" style={{ marginRight: "10px", color: "#fff" }}>
            Sort By:
          </label>
          <select
            id="sort"
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Recently Added</option>
            <option value="title">A-Z (Title)</option>
            <option value="watchStatus">Watch Status</option>
          </select>
        </div>
        <label
          htmlFor="minEpisodes"
          style={{ marginLeft: "20px", marginRight: "10px", color: "#fff" }}
        >
          Min Episodes:
        </label>
        <select
          id="minEpisodes"
          className="filter-select"
          value={minEpisodes}
          onChange={(e) => setMinEpisodes(Number(e.target.value))}
        >
          <option value={0}>Any</option>
          <option value={12}>12+</option>
          <option value={24}>24+</option>
          <option value={50}>50+</option>
          <option value={100}>100+</option>
        </select>
        {items.length === 0 ? (
          <div className="empty-state">
            Your watchlist is empty. Browse the shows and add to your watchlist!
          </div>
        ) : (
          <div className="watchlist-grid">
            {sortedItems.map((item) => (
              <div className="watchlist-card" key={item.id}>
                <div className="card-image-container">
                  {item.cover_image ? (
                    <img
                      src={item.cover_image}
                      className="card-poster"
                      alt={item.title}
                    />
                  ) : (
                    <div className="card-poster no-image">No image</div>
                  )}

                  <div className="status">{item.status}</div>
                </div>

                <div className="card-content">
                  <h3 className="card-title">{item.title}</h3>

                  <p className="card-metadata">
                    {item.release_year} • {item.genre}
                  </p>

                  <p className="card-episodes">{item.episodes} Episodes</p>

                  <div className="card-actions">
                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(item.id, item.title)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
