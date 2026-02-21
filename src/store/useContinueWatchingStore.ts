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
  /** Populate store from DB without triggering API writes */
  hydrateFromDb: (items: WatchProgress[]) => void;
}

function syncProgress(entry: Omit<WatchProgress, "updatedAt"> & { updatedAt?: string }) {
  fetch("/api/user/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  }).catch(() => {});
}

export const useContinueWatchingStore = create<ContinueWatchingStore>()(
  persist(
    (set, get) => ({
      items: [],

      setProgress: (progress) => {
        const item: WatchProgress = { ...progress, updatedAt: new Date().toISOString() };
        set((state) => {
          const existing = state.items.findIndex((i) => i.animeId === progress.animeId);
          if (existing >= 0) {
            const updated = [...state.items];
            updated[existing] = item;
            return { items: updated };
          }
          return { items: [item, ...state.items].slice(0, 20) };
        });
        syncProgress(item);
      },

      getProgress: (animeId) => get().items.find((i) => i.animeId === animeId),

      removeProgress: (animeId) => {
        set((state) => ({ items: state.items.filter((i) => i.animeId !== animeId) }));
        fetch(`/api/user/progress/${animeId}`, { method: "DELETE" }).catch(() => {});
      },

      clearAll: () => set({ items: [] }),

      hydrateFromDb: (items) => set({ items }),
    }),
    { name: "vibeanime-watch-progress" }
  )
);
