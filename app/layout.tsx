// app/layout.tsx
import type { Metadata } from "next";
import MuiRegistry from "./registry";

export const metadata: Metadata = {
  title: "Anime Watchlist",
  description: "Track your anime watchlist",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>
        <MuiRegistry>{children}</MuiRegistry>
      </body>
    </html>
  );
}