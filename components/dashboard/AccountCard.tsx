"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
} from "@mui/material";

export default function AccountCard() {
  const router = useRouter();

  return (
    <Card
      variant="outlined"
      onClick={() => router.push("/app/profile")}
      sx={{
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700}>
          Account Details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography color="text.secondary" variant="body2">
            View your profile, account stats, and activity.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}