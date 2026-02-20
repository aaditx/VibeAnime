"use client";

import { useEffect } from "react";
import { useContinueWatchingStore } from "@/store/useContinueWatchingStore";

interface WatchTrackerProps {
  animeId: number;
  animeTitle: string;
  coverImage: string;
  coverColor: string | null;
  episode: number;
  totalEpisodes: number | null;
}

export default function WatchTracker({
  animeId,
  animeTitle,
  coverImage,
  coverColor,
  episode,
  totalEpisodes,
}: WatchTrackerProps) {
  const { setProgress } = useContinueWatchingStore();

  useEffect(() => {
    setProgress({ animeId, animeTitle, coverImage, coverColor, episode, totalEpisodes });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, episode]);

  return null;
}
