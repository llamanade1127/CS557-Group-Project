"use client";

import { Box, Typography, Grid } from "@mui/material";
import ShowsListCard from "@/components/dashboard/ShowListsCard";
import WatchlistCard from "@/components/dashboard/WatchlistsCard";
import AccountCard from "@/components/dashboard/AccountCard";

export default function DashboardPage() {
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 5 }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Welcome back
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 12 }}>
          <ShowsListCard />
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <WatchlistCard />
        </Grid>
      </Grid>
    </Box>
  );
}
