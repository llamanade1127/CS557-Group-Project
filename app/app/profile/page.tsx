"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";

type Profile = {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
  role_name: string;
  watchlist_count: number;
  ratings_count: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      setProfile(data);
      setUsername(data.username);
      setEmail(data.email);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);

    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
        }),
      });

      await fetchProfile();
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return <Typography>User not found</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", px: 2, py: 5 }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Profile Details
              </Typography>

              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Role"
                value={profile.role_name}
                disabled
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Account Created"
                value={new Date(profile.created_at).toLocaleDateString()}
                disabled
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Account Stats
              </Typography>

              <Typography mb={2}>
                Watchlist Shows: {profile.watchlist_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}