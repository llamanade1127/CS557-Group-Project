import React from "react";

type Anime = {
  anime_id: number;
  title: string;
  genre: string;
  release_year: number;
};

type AnimeSectionProps = {
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  editingAnimeId: number | null;
  animeSearch: string;
  setAnimeSearch: React.Dispatch<React.SetStateAction<string>>;
  newTitle: string;
  setNewTitle: React.Dispatch<React.SetStateAction<string>>;
  newGenre: string;
  setNewGenre: React.Dispatch<React.SetStateAction<string>>;
  newYear: string;
  setNewYear: React.Dispatch<React.SetStateAction<string>>;
  filteredAnime: Anime[];
  resetAnimeForm: () => void;
  addAnime: () => void;
  saveEdit: () => void;
  startEdit: (anime: Anime) => void;
  deleteAnime: (id: number) => void;
  buttonStyle: React.CSSProperties;
};

export default function AnimeSection({
  showForm,
  setShowForm,
  editingAnimeId,
  animeSearch,
  setAnimeSearch,
  newTitle,
  setNewTitle,
  newGenre,
  setNewGenre,
  newYear,
  setNewYear,
  filteredAnime,
  resetAnimeForm,
  addAnime,
  saveEdit,
  startEdit,
  deleteAnime,
  buttonStyle,
}: AnimeSectionProps) {
  return (
    <div style={{ backgroundColor: "#1f2937", padding: "1.5rem", borderRadius: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2>Anime Management</h2>

        <button
          style={buttonStyle}
          onClick={() => {
            resetAnimeForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Close Form" : "Add Anime"}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            backgroundColor: "#111827",
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ marginBottom: "1rem" }}>{editingAnimeId ? "Edit Anime" : "Add New Anime"}</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Anime Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ padding: "0.8rem", borderRadius: "8px", border: "none", minWidth: "220px" }}
            />

            <input
              type="text"
              placeholder="Genre"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              style={{ padding: "0.8rem", borderRadius: "8px", border: "none", minWidth: "220px" }}
            />

            <input
              type="text"
              placeholder="Release Year"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value.replace(/\D/g, ""))}
              style={{ padding: "0.8rem", borderRadius: "8px", border: "none", minWidth: "180px" }}
            />

            {editingAnimeId ? (
              <>
                <button style={buttonStyle} onClick={saveEdit}>
                  Save Changes
                </button>
                <button
                  style={{ ...buttonStyle, backgroundColor: "#6b7280" }}
                  onClick={() => {
                    resetAnimeForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button style={buttonStyle} onClick={addAnime}>
                Add Anime
              </button>
            )}
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Search anime..."
        value={animeSearch}
        onChange={(e) => setAnimeSearch(e.target.value)}
        style={{
          padding: "0.8rem",
          borderRadius: "8px",
          border: "none",
          marginBottom: "1.5rem",
          width: "300px",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "1rem" }}>Title</th>
            <th style={{ textAlign: "left", padding: "1rem" }}>Genre</th>
            <th style={{ textAlign: "left", padding: "1rem" }}>Year</th>
            <th style={{ textAlign: "left", padding: "1rem" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredAnime.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                No anime added yet.
              </td>
            </tr>
          ) : (
            filteredAnime.map((anime) => (
              <tr key={anime.anime_id} style={{ borderTop: "1px solid #374151" }}>
                <td style={{ padding: "1rem" }}>{anime.title}</td>
                <td style={{ padding: "1rem" }}>{anime.genre}</td>
                <td style={{ padding: "1rem" }}>{anime.release_year}</td>
                <td style={{ padding: "1rem" }}>
                  <button style={buttonStyle} onClick={() => startEdit(anime)}>
                    Edit
                  </button>
                  <button
                    style={{ ...buttonStyle, marginLeft: "1rem", backgroundColor: "#dc2626" }}
                    onClick={() => deleteAnime(anime.anime_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
