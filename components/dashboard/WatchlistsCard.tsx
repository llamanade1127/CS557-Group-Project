"use client";

import { Card, CardContent, Typography, Divider } from "@mui/material";

export default function WatchlistCard() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700}>
          Your Watchlist
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography color="text.secondary" variant="body2">
          Your watchlist will appear here.
        </Typography>
      </CardContent>
    </Card>
  );
}