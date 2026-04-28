"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";

type AnimeForm = {
  title: string;
  genre: string;
  episodes: string;
  release_year: string;
  description: string;
};

const initialForm: AnimeForm = {
  title: "",
  genre: "",
  episodes: "",
  release_year: "",
  description: "",
};

export default function AddAnime() {
  const [form, setForm] = useState<AnimeForm>(initialForm);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      genre: form.genre,
      episodes: Number(form.episodes),
      release_year: Number(form.release_year),
      description: form.description,
    };

    try {
      const res = await fetch("/api/anime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.error || "Failed to add anime",
          severity: "error",
        });
        return;
      }

      setSnackbar({ open: true, message: "Anime added successfully!", severity: "success" });
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Server error", severity: "error" });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Add Anime
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Fill in the details below to add a new anime to the database.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <TextField
              name="title"
              label="Title"
              value={form.title}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="genre"
              label="Genre"
              value={form.genre}
              onChange={handleChange}
              required
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                name="episodes"
                label="Episodes"
                type="number"
                value={form.episodes}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />

              <TextField
                name="release_year"
                label="Release Year"
                type="number"
                value={form.release_year}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ min: 1900, max: new Date().getFullYear() + 2 }}
              />
            </Stack>

            <TextField
              name="description"
              label="Description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 1, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Add Anime
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}