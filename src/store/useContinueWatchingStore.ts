"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WatchProgress {
  animeId: number;
  animeTitle: string;
  coverImage: string;
  coverColor: string | null;
  episode: number;
  totalEpisodes: number | null;
  updatedAt: string;
}

interface ContinueWatchingStore {
  items: WatchProgress[];
  setProgress: (progress: Omit<WatchProgress, "updatedAt">) => void;
  getProgress: (animeId: number) => WatchProgress | undefined;
  removeProgress: (animeId: number) => void;
  clearAll: () => void;
}

export const useContinueWatchingStore = create<ContinueWatchingStore>()(
  persist(
    (set, get) => ({
      items: [],

      setProgress: (progress) => {
        set((state) => {
          const existing = state.items.findIndex((i) => i.animeId === progress.animeId);
          const item: WatchProgress = { ...progress, updatedAt: new Date().toISOString() };
          if (existing >= 0) {
            const updated = [...state.items];
            updated[existing] = item;
            return { items: updated };
          }
          return { items: [item, ...state.items].slice(0, 20) };
        });
      },

      getProgress: (animeId) => get().items.find((i) => i.animeId === animeId),

      removeProgress: (animeId) =>
        set((state) => ({ items: state.items.filter((i) => i.animeId !== animeId) })),

      clearAll: () => set({ items: [] }),
    }),
    { name: "vibeanime-watch-progress" }
  )
);
