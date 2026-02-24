import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowLeft, Tv } from "lucide-react";
import { getAnimeDetail } from "@/lib/anilist";
import { getAnimeTitle, stripHtml } from "@/lib/utils";
import { fetchEpisodesForAnime } from "@/lib/streaming";
import VideoPlayer from "@/components/VideoPlayer";
import VideoPlayerErrorBoundary from "@/components/VideoPlayerErrorBoundary";
import EpisodeList from "@/components/EpisodeList";
import WatchTracker from "@/components/WatchTracker";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string; episode: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://vibeanime.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, episode } = await params;
  try {
    const anime = await getAnimeDetail(Number(id));
    const title = getAnimeTitle(anime.title);
    const description = `Watch ${title} Episode ${episode} online free on VibeAnime. ${stripHtml(anime.description)?.slice(0, 100) ?? ""
      }`;
    const ogImage = anime.coverImage.extraLarge ?? anime.coverImage.large;
    const canonical = `${BASE_URL}/anime/${id}/watch/${episode}`;
    return {
      title: `${title} Episode ${episode}`,
      description,
      alternates: { canonical },
      openGraph: {
        type: "video.episode",
        url: canonical,
        title: `${title} Episode ${episode} | VibeAnime`,
        description,
        images: ogImage ? [{ url: ogImage, alt: title }] : [],
        siteName: "VibeAnime",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} Episode ${episode} | VibeAnime`,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch {
    return { title: "Watch | VibeAnime" };
  }
}


export default async function WatchPage({ params }: Props) {
  const { id, episode } = await params;
  const animeId = Number(id);
  const episodeNum = Number(episode);

  if (isNaN(animeId) || isNaN(episodeNum) || episodeNum < 1) notFound();

  let anime;
  try {
    anime = await getAnimeDetail(animeId);
  } catch {
    notFound();
  }

  const title = getAnimeTitle(anime.title);

  // Fetch HiAnime episodes via search-by-title and format
  const { hianimeId, episodes } = await fetchEpisodesForAnime(title, anime.format).catch(() => ({
    hianimeId: null,
    episodes: [],
  }));

  const totalEpisodes =
    episodes.length > 0
      ? episodes.length
      : anime.episodes ?? (anime.nextAiringEpisode ? anime.nextAiringEpisode.episode - 1 : 24);

  // Find the HiAnime episode ID for the current episode
  const currentEp =
    episodes.find((e) => e.number === episodeNum) ?? episodes[episodeNum - 1] ?? null;
  const hianimeEpisodeId = currentEp?.id ?? null;

  const episodeTitle = currentEp?.title ?? null;
  const prevEp = episodeNum > 1 ? episodeNum - 1 : null;
  const nextEp = episodeNum < totalEpisodes ? episodeNum + 1 : null;

  return (
    <div className="min-h-screen pt-14 bg-[#0a0a0a]">

      {/* ── Cinematic banner strip ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "72px" }}>
        {anime.bannerImage ? (
          <>
            <Image
              src={anime.bannerImage}
              alt=""
              fill
              className="object-cover object-top"
              style={{ opacity: 0.22 }}
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#0d0d0d]" />
        )}
        {/* Back & Navigation overlaid on banner */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
          <Link
            href={`/anime/${animeId}`}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#888] hover:text-white transition-colors min-w-0"
          >
            <ArrowLeft className="w-4 h-4 flex-none" />
            <span className="truncate hidden sm:block">Back to {title}</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            {prevEp && (
              <Link
                href={`/anime/${animeId}/watch/${prevEp}`}
                className="flex items-center gap-1 text-xs font-black uppercase bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#e8002d] text-[#555] hover:text-white px-3 py-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Link>
            )}
            {nextEp && (
              <Link
                href={`/anime/${animeId}/watch/${nextEp}`}
                className="flex items-center gap-1 text-xs font-black uppercase bg-[#e8002d] hover:bg-[#c8001d] text-white px-3 py-1.5 transition-colors hover:shadow-[0_0_12px_rgba(232,0,45,0.4)]"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player -- main column */}
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayerErrorBoundary>
              <VideoPlayer
                hianimeEpisodeId={hianimeEpisodeId}
                episodeNumber={episodeNum}
                animeTitle={title}
                coverImage={anime.coverImage.extraLarge ?? anime.coverImage.large}
                animeId={animeId}
                totalEpisodes={totalEpisodes}
              />
            </VideoPlayerErrorBoundary>

            <div className="bg-[#111] border border-[#1e1e1e] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Tv className="w-4 h-4 text-[#e8002d] flex-none" />
                    <h1 className="text-sm font-black text-white uppercase tracking-wide truncate">{title}</h1>
                  </div>
                  <p className="text-[#555] text-xs font-bold uppercase tracking-wide">
                    Episode {episodeNum} of {totalEpisodes}
                    {episodeTitle && (
                      <span className="ml-2 text-white/60 normal-case tracking-normal">&mdash; {episodeTitle}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 border ${hianimeEpisodeId
                      ? "border-[#e8002d]/30 text-[#e8002d] bg-[#e8002d]/5"
                      : "border-[#333] text-[#555]"
                      }`}>
                      <span className={`w-1.5 h-1.5 ${hianimeEpisodeId ? "bg-[#e8002d]" : "bg-[#555]"}`} />
                      {hianimeEpisodeId ? "Streaming available" : "Indexing episode..."}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-none">
                  {prevEp && (
                    <Link href={`/anime/${animeId}/watch/${prevEp}`} className="text-[10px] font-black uppercase tracking-wider bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#e8002d] text-[#555] hover:text-white px-2.5 py-1.5 transition-colors">
                      &larr; EP {prevEp}
                    </Link>
                  )}
                  {nextEp && (
                    <Link href={`/anime/${animeId}/watch/${nextEp}`} className="text-[10px] font-black uppercase tracking-wider bg-[#e8002d] hover:bg-[#c8001d] text-white px-2.5 py-1.5 transition-colors">
                      EP {nextEp} &rarr;
                    </Link>
                  )}
                </div>
              </div>
              {anime.description && (
                <p className="text-[#555] text-xs mt-3 leading-relaxed line-clamp-3">
                  {stripHtml(anime.description)}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar -- episode list */}
          <div className="bg-[#111] border border-[#1e1e1e] p-4">
            <EpisodeList
              animeId={animeId}
              totalEpisodes={totalEpisodes}
              currentEpisode={episodeNum}
              episodes={episodes}
            />
          </div>
        </div>
      </div>
      <WatchTracker
        animeId={animeId}
        animeTitle={title}
        coverImage={anime.coverImage.large}
        coverColor={anime.coverImage.color ?? null}
        episode={episodeNum}
        totalEpisodes={totalEpisodes}
      />
    </div>
  );
}