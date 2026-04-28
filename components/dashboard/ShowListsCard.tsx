"use client";

import { Card, CardContent, Typography, Divider } from "@mui/material";

export default function ShowsListCard() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700}>
          Shows
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography color="text.secondary" variant="body2">
          Shows will appear here.
        </Typography>
      </CardContent>
    </Card>
  );
}