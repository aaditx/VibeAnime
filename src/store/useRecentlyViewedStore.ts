"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentItem {
  id: number;
  title: string;
  coverImage: string;
  coverColor: string | null;
  genres: string[];
  averageScore: number | null;
  viewedAt: string;
}

interface RecentlyViewedStore {
  items: RecentItem[];
  addItem: (item: Omit<RecentItem, "viewedAt">) => void;
  clearAll: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== item.id);
          return {
            items: [
              { ...item, viewedAt: new Date().toISOString() },
              ...filtered,
            ].slice(0, 12),
          };
        }),
      clearAll: () => set({ items: [] }),
    }),
    { name: "vibeanime-recently-viewed" }
  )
);
