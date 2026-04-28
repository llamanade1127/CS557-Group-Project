export interface User {
  id: number;
  username?: string;
  email: string;
}

export interface Show {
  id: number;
  title: string;
  genre: string;
  episodes: number;
  releaseYear: number;
}

export interface WatchlistItem {
  id: number;
  title: string;
  status: string;
}