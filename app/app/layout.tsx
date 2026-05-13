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

export default function AppLayout({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: any;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) router.replace("/app/publicHomepage");
        else 
        {
          setUser(user); 
        }
      })
      .catch(() => router.replace("/app/publicHomepage"))
      .finally(() => setCheckingAuth(false));
      
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(initialUser);
    router.replace("/app/publicHomepage");
    router.refresh();
  }

  if (checkingAuth) {
    return (
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
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
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
            {user && (
              <>
                <Button onClick={() => router.push("/app/dashboard")} color="inherit">
                  Dashboard
                </Button>
                <Button onClick={() => router.push("/app/anime")} color="inherit">
                  Shows
                </Button>
                <Button onClick={() => router.push("/app/watchlist_page")} color="inherit">
                  Watchlist
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