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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) router.replace("/login");
      })
      .catch(() => router.replace("/login"))
      .finally(() => setCheckingAuth(false));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  // The loading state still needs to be inside the body
  const content = checkingAuth ? (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ minHeight: "100vh", bgcolor: "#482fa0" }}>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{ bgcolor: "#fff", color: "text.primary" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={800}>
            🎌 Anime Watchlist
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button onClick={() => router.push("/app/dashboard")} color="inherit">
              Dashboard
            </Button>
            <Button onClick={() => router.push("/app/shows")} color="inherit">
              Shows
            </Button>
            <Button onClick={() => router.push("/watchlist_page")} color="inherit">
              Watchlist
            </Button>
            <Button onClick={logout} variant="outlined" size="small" color="inherit">
              Sign out
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );

  return (
    <html lang="en">
      <body style={{ margin: 0}}>
        {content}
      </body>
    </html>
  );
}