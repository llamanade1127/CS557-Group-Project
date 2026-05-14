"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Box,
  CircularProgress,
} from "@mui/material";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) window.location.replace("/login");
        else setUser(user);
      })
      .catch(() => window.location.replace("/login"))
      .finally(() => setCheckingAuth(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  }

  if (checkingAuth || !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "#fff", color: "text.primary" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={800}>
            Anime Watchlist
          </Typography>

          <Stack direction="row" spacing={1}>
            {user && (
              <>
                <Button onClick={() => router.push("/app/dashboard")} color="inherit">
                  Dashboard
                </Button>
                <Button onClick={() => router.push("/app/anime")} color="inherit">
                  Shows
                </Button>
                <Button onClick={() => router.push("/app/watchlists")} color="inherit">
                  Watchlist
                </Button>
                <Button onClick={() => router.push("/app/add_show")} color="inherit">
                  Add Shows
                </Button>
              </>
            )}
            {user ? (
              <Button onClick={logout} variant="outlined" size="small" color="inherit">
                Sign out
              </Button>
            ) : (
              <Button onClick={() => router.push("/login")} variant="outlined" size="small" color="inherit">
                Sign in
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {children}
    </Box>
  );
}
