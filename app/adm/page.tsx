"use client";

import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import AnimeSection from "./components/AnimeSection";
import UserSection from "./components/UserSection";
import RatingsSection from "./components/RatingsSection";
import SettingsSection from "./components/SettingsSection";

import { useEffect, useState } from "react";

type Anime = {
  anime_id: number;
  title: string;
  genre: string;
  release_year: number;
};

type User = {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
};

type Rating = {
  rating_id: number;
  rating_score: number;
  rated_at: string;
  anime: { title: string };
  user: { username: string };
};

export default function AdminPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [activeSection, setActiveSection] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [loadingAnime, setLoadingAnime] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingAnimeId, setEditingAnimeId] = useState<number | null>(null);

  const [animeSearch, setAnimeSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newYear, setNewYear] = useState("");

  const [selectedUser, setSelectedUser] = useState("");
  const [updatedUsername, setUpdatedUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentAdminPassword, setCurrentAdminPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "">("");

  const buttonStyle = {
    padding: "0.7rem 1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "bold",
  };

  function showToast(message: string, type: "success" | "error") {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
      setToastType("");
    }, 3000);
  }

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/users");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalUsers(data.length);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadRatings() {
    try {
      const response = await fetch("/api/ratings");
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setRatings(data);
        setTotalRatings(data.length);
      } else {
        setRatings([]);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error("[load ratings]", error);
      setRatings([]);
      setTotalRatings(0);
    }
  }

  async function loadAnime() {
    try {
      setLoadingAnime(true);
      const response = await fetch("/api/anime/list");
      const data = await response.json();
      if (Array.isArray(data)) {
        setAnimeList(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAnime(false);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        await Promise.all([loadAnime(), loadRatings(), loadUsers()]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function resetAnimeForm() {
    setNewTitle("");
    setNewGenre("");
    setNewYear("");
    setEditingAnimeId(null);
  }

  async function addAnime() {
    try {
      if (!newTitle.trim() || !newGenre.trim() || !newYear.trim()) {
        alert("Please fill all fields");
        return;
      }
      const year = Number(newYear);
      if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        alert("Please enter a valid year");
        return;
      }
      const response = await fetch("/api/anime/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), genre: newGenre.trim(), release_year: year }),
      });
      let data;
      try { data = await response.json(); } catch { data = { error: "Server returned invalid response" }; }
      if (!response.ok) { alert(data.error || "Failed to add anime"); return; }
      await Promise.all([loadAnime(), loadRatings()]);
      resetAnimeForm();
      setShowForm(false);
      showToast("Anime added successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    }
  }

  function startEdit(anime: Anime) {
    setEditingAnimeId(anime.anime_id);
    setNewTitle(anime.title);
    setNewGenre(anime.genre);
    setNewYear(anime.release_year.toString());
    setShowForm(true);
  }

  async function saveEdit() {
    try {
      if (editingAnimeId === null) return;
      if (!newTitle.trim() || !newGenre.trim() || !newYear.trim()) {
        alert("Please fill all fields");
        return;
      }
      const year = Number(newYear);
      if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        alert("Please enter a valid year");
        return;
      }
      const response = await fetch("/api/anime/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: editingAnimeId, title: newTitle.trim(), genre: newGenre.trim(), release_year: year }),
      });
      let data;
      try { data = await response.json(); } catch { data = { error: "Server returned invalid response" }; }
      if (!response.ok) { alert(data.error || "Failed to update anime"); return; }
      await Promise.all([loadAnime(), loadRatings()]);
      resetAnimeForm();
      setShowForm(false);
      showToast("Anime updated successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    }
  }

  async function deleteAnime(id: number) {
    try {
      if (!confirm("Are you sure you want to delete this anime?")) return;
      const response = await fetch(`/api/anime/manage?id=${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) { alert(data.error || "Failed to delete anime"); return; }
      setAnimeList((prev) => prev.filter((a) => a.anime_id !== id));
      showToast("Anime deleted successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    }
  }

  async function updateUserAccount() {
    try {
      if (!selectedUser) { alert("Select a user first"); return; }
      if (!updatedUsername.trim()) { alert("Username cannot be empty"); return; }
      if (newPassword !== confirmPassword) { alert("Passwords do not match"); return; }
      if (newPassword.trim() !== "" && newPassword.length < 8) {
        alert("Password must be at least 8 characters long");
        return;
      }
      const selected = users.find((u) => u.username === selectedUser);
      if (!selected) { alert("User not found"); return; }
      if (selected.role_id === 2) {
        alert("Admin passwords can only be changed in Settings section");
        return;
      }
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected.user_id, username: updatedUsername.trim(), password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error || "Failed to update user"); return; }
      await loadUsers();
      setSelectedUser("");
      setUpdatedUsername("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("User updated successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    }
  }

  async function updateUserRole(userId: number, newRole: number) {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role_id: newRole }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error || "Failed to update role"); return; }
      await loadUsers();
      showToast("Role updated successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    }
  }

  async function deleteUser(userId: number) {
    try {
      if (!confirm("Are you sure you want to delete this user?")) return;
      const meResponse = await fetch("/api/auth/me");
      const me = await meResponse.json();
      const currentUser = users.find((u) => u.username === me.user?.username);
      if (currentUser?.user_id === userId) { alert("You cannot delete yourself"); return; }
      const response = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) { alert(data.error || "Failed to delete user"); return; }
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      setTotalUsers((prev) => Math.max(0, prev - 1));
      showToast("User deleted successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    }
  }

  async function changeAdminPassword() {
    try {
      if (!currentAdminPassword.trim() || !newAdminPassword.trim() || !confirmAdminPassword.trim()) {
        alert("Please fill all password fields");
        return;
      }
      if (newAdminPassword !== confirmAdminPassword) { alert("Passwords do not match"); return; }
      const response = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: users.find((u) => u.role_id === 2)?.user_id,
          currentPassword: currentAdminPassword,
          newPassword: newAdminPassword,
          confirmPassword: confirmAdminPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error || "Failed to change password"); return; }
      setCurrentAdminPassword("");
      setNewAdminPassword("");
      setConfirmAdminPassword("");
      showToast("Password updated successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    }
  }

  const filteredAnime = animeList.filter((anime) =>
    anime.title.toLowerCase().includes(animeSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ color: "white", padding: "2rem", backgroundColor: "#111827", minHeight: "100vh" }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#0b1120",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} buttonStyle={buttonStyle} />

      <Toast toastMessage={toastMessage} toastType={toastType} />

      <main style={{ flex: 1, padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem" }}>Admin Dashboard</h1>
          <button
            style={{ ...buttonStyle, backgroundColor: "#dc2626" }}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.replace("/login");
            }}
          >
            Sign Out
          </button>
        </div>

        {activeSection === "dashboard" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div style={{ backgroundColor: "#1f2937", padding: "1.5rem", borderRadius: "12px" }}>
              <h3>Total Users</h3>
              <p style={{ fontSize: "2rem" }}>{totalUsers}</p>
            </div>
            <div style={{ backgroundColor: "#1f2937", padding: "1.5rem", borderRadius: "12px" }}>
              <h3>Total Anime</h3>
              <p style={{ fontSize: "2rem" }}>{animeList.length}</p>
            </div>
            <div style={{ backgroundColor: "#1f2937", padding: "1.5rem", borderRadius: "12px" }}>
              <h3>Total Ratings</h3>
              <p style={{ fontSize: "2rem" }}>{totalRatings}</p>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <UserSection
            users={users}
            loadingUsers={loadingUsers}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            updatedUsername={updatedUsername}
            setUpdatedUsername={setUpdatedUsername}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            updateUserAccount={updateUserAccount}
            deleteUser={deleteUser}
            buttonStyle={buttonStyle}
          />
        )}

        {activeSection === "anime" && (
          <AnimeSection
            showForm={showForm}
            setShowForm={setShowForm}
            editingAnimeId={editingAnimeId}
            animeSearch={animeSearch}
            setAnimeSearch={setAnimeSearch}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newGenre={newGenre}
            setNewGenre={setNewGenre}
            newYear={newYear}
            setNewYear={setNewYear}
            filteredAnime={filteredAnime}
            resetAnimeForm={resetAnimeForm}
            addAnime={addAnime}
            saveEdit={saveEdit}
            startEdit={startEdit}
            deleteAnime={deleteAnime}
            buttonStyle={buttonStyle}
          />
        )}

        {activeSection === "ratings" && <RatingsSection ratings={ratings} />}

        {activeSection === "settings" && (
          <SettingsSection
            users={users}
            currentAdminPassword={currentAdminPassword}
            setCurrentAdminPassword={setCurrentAdminPassword}
            newAdminPassword={newAdminPassword}
            setNewAdminPassword={setNewAdminPassword}
            confirmAdminPassword={confirmAdminPassword}
            setConfirmAdminPassword={setConfirmAdminPassword}
            changeAdminPassword={changeAdminPassword}
            updateUserRole={updateUserRole}
            buttonStyle={buttonStyle}
          />
        )}
      </main>
    </div>
  );
}
