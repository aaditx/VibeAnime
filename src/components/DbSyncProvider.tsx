"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useContinueWatchingStore, type WatchProgress } from "@/store/useContinueWatchingStore";
import { useWatchlistStore, type WatchlistItem } from "@/store/useWatchlistStore";

/**
 * Runs once per login. Fetches the user's progress & watchlist from MongoDB,
 * merges them with any existing localStorage data (newest timestamp wins),
 * and pushes any local-only items back to the DB.
 */
export default function DbSyncProvider() {
  const { data: session, status } = useSession();
  const prevUserId = useRef<string | null>(null);

  const progressItems = useContinueWatchingStore((s) => s.items);
  const hydrateProgress = useContinueWatchingStore((s) => s.hydrateFromDb);
  const clearProgress = useContinueWatchingStore((s) => s.clearAll);

  const watchlistItems = useWatchlistStore((s) => s.items);
  const hydrateWatchlist = useWatchlistStore((s) => s.hydrateFromDb);
  const clearWatchlist = useWatchlistStore((s) => s.clearWatchlist);

  useEffect(() => {
    if (status === "loading") return;

    const userId = session?.user?.id ?? null;

    if (userId && userId !== prevUserId.current) {
      // ── User just logged in → sync ──────────────────────────────────────────
      Promise.all([
        fetch("/api/user/progress").then((r) => r.ok ? r.json() : []),
        fetch("/api/user/watchlist").then((r) => r.ok ? r.json() : []),
      ]).then(([dbProgress, dbWatchlist]: [WatchProgress[], WatchlistItem[]]) => {

        // Merge progress: newest updatedAt wins
        const progressMap = new Map<number, WatchProgress>();
        for (const item of dbProgress) progressMap.set(item.animeId, item);
        const localPushProgress: WatchProgress[] = [];
        for (const local of progressItems) {
          const db = progressMap.get(local.animeId);
          if (!db) {
            // Local only → push to DB
            localPushProgress.push(local);
            progressMap.set(local.animeId, local);
          } else if (new Date(local.updatedAt) > new Date(db.updatedAt)) {
            // Local is newer → overwrite
            localPushProgress.push(local);
            progressMap.set(local.animeId, local);
          }
        }
        const mergedProgress = Array.from(progressMap.values())
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 20);
        hydrateProgress(mergedProgress);
        for (const item of localPushProgress) {
          fetch("/api/user/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          }).catch(() => {});
        }

        // Merge watchlist: newest addedAt wins; DB is the authority for existing items
        const watchlistMap = new Map<number, WatchlistItem>();
        for (const item of dbWatchlist) watchlistMap.set(item.id, item);
        const localPushWatchlist: WatchlistItem[] = [];
        for (const local of watchlistItems) {
          if (!watchlistMap.has(local.id)) {
            localPushWatchlist.push(local);
            watchlistMap.set(local.id, local);
          }
        }
        const mergedWatchlist = Array.from(watchlistMap.values())
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        hydrateWatchlist(mergedWatchlist);
        for (const item of localPushWatchlist) {
          fetch("/api/user/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          }).catch(() => {});
        }

      }).catch(() => {});

    } else if (!userId && prevUserId.current) {
      // ── User logged out → clear local state ─────────────────────────────────
      clearProgress();
      clearWatchlist();
    }

    prevUserId.current = userId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, status]);

  return null;
}
