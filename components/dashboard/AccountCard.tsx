"use client";

import { Card, CardContent, Typography, Divider } from "@mui/material";

export default function AccountCard() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700}>
          Account Details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography color="text.secondary" variant="body2">
          Account info will appear here.
        </Typography>
      </CardContent>
    </Card>
  );
}