"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";

interface TrackViewProps {
  id: number;
  title: string;
  coverImage: string;
  coverColor: string | null;
  genres: string[];
  averageScore: number | null;
}

export default function TrackView({ id, title, coverImage, coverColor, genres, averageScore }: TrackViewProps) {
  const { addItem } = useRecentlyViewedStore();

  useEffect(() => {
    addItem({ id, title, coverImage, coverColor, genres, averageScore });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
