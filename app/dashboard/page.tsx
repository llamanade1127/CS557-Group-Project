"use client";
// app/dashboard/page.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar, Toolbar, Typography, Box, Button, Card, CardContent,
  Chip, Divider, Skeleton, Stack,
} from "@mui/material";

interface User {
  id: number;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) router.replace("/login");
        else setUser(user);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>

      {/* ── Top bar ── */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "#fff", color: "text.primary" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={800} letterSpacing={-0.5}>
            🎌 Anime Watchlist
          </Typography>
          <Button
            onClick={logout}
            variant="outlined"
            size="small"
            color="inherit"
          >
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      {/* ── Main ── */}
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 5 }}>

        {/* Greeting */}
        <Typography variant="h4" fontWeight={700} mb={0.5}>
          {loading ? <Skeleton width={260} /> : `Welcome back 👋`}
        </Typography>
        <Typography color="text.secondary" mb={4}>
          {loading ? <Skeleton width={200} /> : "Here's a summary of your account."}
        </Typography>

        {/* Account card */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                👤 Account Details
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Row
                label="User ID"
                value={loading ? <Skeleton width={40} /> : `#${user?.id}`}
              />
              <Row
                label="Email"
                value={loading ? <Skeleton width={180} /> : user?.email}
              />
              <Row
                label="Session"
                value={
                  loading ? (
                    <Skeleton width={80} />
                  ) : (
                    <Chip label="Active" color="success" size="small" />
                  )
                }
              />
              <Row
                label="Password"
                value={
                  loading ? (
                    <Skeleton width={200} />
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      $2b$12$••••••••••••••••••••••  (bcrypt)
                    </Typography>
                  )
                }
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Placeholder watchlist card */}
        <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              📺 Your Watchlist
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography color="text.secondary" variant="body2">
              Your anime watchlist will appear here. Add shows to get started!
            </Typography>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}

// ── Small helper row component ────────────────────────────────
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
        {label}
      </Typography>
      <Box>{typeof value === "string" ? (
        <Typography variant="body2" fontWeight={500}>{value}</Typography>
      ) : value}</Box>
    </Box>
  );
}