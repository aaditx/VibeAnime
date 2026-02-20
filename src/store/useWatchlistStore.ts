"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Anime } from "@/lib/anilist";

export interface WatchlistItem {
  id: number;
  title: string;
  coverImage: string;
  episodes: number | null;
  status: string;
  averageScore: number | null;
  genres: string[];
  addedAt: string;
}

interface WatchlistStore {
  items: WatchlistItem[];
  addToWatchlist: (anime: Anime) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToWatchlist: (anime: Anime) => {
        const item: WatchlistItem = {
          id: anime.id,
          title: anime.title.english ?? anime.title.romaji,
          coverImage: anime.coverImage.large,
          episodes: anime.episodes,
          status: anime.status,
          averageScore: anime.averageScore,
          genres: anime.genres,
          addedAt: new Date().toISOString(),
        };
        set((state) => ({
          items: state.items.some((i) => i.id === anime.id)
            ? state.items
            : [item, ...state.items],
        }));
      },

      removeFromWatchlist: (id: number) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      isInWatchlist: (id: number) => {
        return get().items.some((i) => i.id === id);
      },

      clearWatchlist: () => set({ items: [] }),
    }),
    {
      name: "vibeanime-watchlist",
    }
  )
);
