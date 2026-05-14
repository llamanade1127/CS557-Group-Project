"use client";
// app/register/page.tsx
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  LinearProgress,
} from "@mui/material";

// ── Password strength ─────────────────────────────────────────
function getStrength(pw: string): {
  score: number;
  label: string;
  color: "error" | "warning" | "info" | "success";
} {
  if (!pw) return { score: 0, label: "", color: "error" };

  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;

  const map = [
    { label: "", color: "error" },
    { label: "Weak", color: "error" },
    { label: "Fair", color: "warning" },
    { label: "Good", color: "info" },
    { label: "Strong", color: "success" },
  ] as const;

  return { score, ...map[score] };
}

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (strength.score < 2) {
      setError("Please choose a stronger password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        router.push("/app/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          Create account
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "inherit", fontWeight: 500 }}>
            Sign in
          </Link>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            type="text"
            fullWidth
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={
              password ? `Strength: ${strength.label}` : "Min. 8 characters"
            }
            sx={{ mb: 0.5 }}
          />

          {password && (
            <LinearProgress
              variant="determinate"
              value={(strength.score / 4) * 100}
              color={strength.color}
              sx={{ mb: 2, borderRadius: 1, height: 4 }}
            />
          )}

          {!password && <Box sx={{ mb: 2 }} />}

          <TextField
            label="Confirm password"
            type="password"
            fullWidth
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirm.length > 0 && confirm !== password}
            helperText={
              confirm.length > 0 && confirm !== password
                ? "Passwords do not match"
                : " "
            }
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Create account"
            )}
          </Button>
        </Box>

      </Paper>
    </Box>
  );
}