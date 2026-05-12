"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

const ADMIN_ROLE_ID = 2;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) {
          router.replace("/login");
        } else if (user.role_id !== ADMIN_ROLE_ID) {
          setDenied(true);
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (denied) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="error" variant="h6">
          Access denied — admin privileges required.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
      {children}
    </Box>
  );
}
