import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Tv, Clock, Users, Play } from "lucide-react";
import { getAnimeDetail } from "@/lib/anilist";
import {
  getAnimeTitle,
  formatScore,
  formatStatus,
  formatSeason,
  formatFormat,
  stripHtml,
} from "@/lib/utils";
import EpisodeList from "@/components/EpisodeList";
import WatchlistButton from "@/components/WatchlistButton";
import TrackView from "@/components/TrackView";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://vibeanime.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const anime = await getAnimeDetail(Number(id));
    const title = getAnimeTitle(anime.title);
    const description =
      stripHtml(anime.description)?.slice(0, 155) ??
      `Watch ${title} online for free on VibeAnime.`;
    const studios =
      anime.studios?.edges.filter((e) => e.isMain).map((e) => e.node.name) ?? [];
    const ogImage = anime.coverImage.extraLarge ?? anime.coverImage.large;
    const canonical = `${BASE}/anime/${id}`;
    const keywords = [
      title,
      anime.title.romaji,
      anime.title.english,
      ...anime.genres,
      ...studios,
      "watch anime",
      "anime online",
      "free anime",
      "VibeAnime",
    ]
      .filter(Boolean)
      .join(", ");

    return {
      title: `Watch ${title} Online Free`,
      description,
      keywords,
      alternates: { canonical },
      openGraph: {
        type: "video.tv_show",
        url: canonical,
        title: `${title} | VibeAnime`,
        description,
        images: ogImage ? [{ url: ogImage, width: 460, height: 650, alt: title }] : [],
        siteName: "VibeAnime",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | VibeAnime`,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch {
    return { title: "Anime | VibeAnime" };
  }
}


export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;
  const animeId = Number(id);

  if (isNaN(animeId)) notFound();

  let anime;
  try {
    anime = await getAnimeDetail(animeId);
  } catch {
    notFound();
  }

  const title = getAnimeTitle(anime.title);
  const description = stripHtml(anime.description);
  const totalEpisodes = anime.episodes ?? (anime.nextAiringEpisode ? anime.nextAiringEpisode.episode - 1 : 12);
  const mainStudios = anime.studios?.edges.filter((e) => e.isMain).map((e) => e.node.name) ?? [];
  const trailerUrl =
    anime.trailer?.site === "youtube"
      ? `https://www.youtube.com/watch?v=${anime.trailer.id}`
      : null;

  return (
    <div className="min-h-screen pt-14">
      {/* JSON-LD structured data — TVSeries for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TVSeries",
            name: title,
            alternateName: anime.title.romaji ?? undefined,
            description: description || undefined,
            image: anime.coverImage.extraLarge ?? anime.coverImage.large,
            url: `${BASE}/anime/${animeId}`,
            genre: anime.genres,
            numberOfEpisodes: anime.episodes ?? undefined,
            aggregateRating: anime.averageScore
              ? {
                "@type": "AggregateRating",
                ratingValue: (anime.averageScore / 10).toFixed(1),
                bestRating: "10",
                ratingCount: anime.popularity ?? 1,
              }
              : undefined,
            potentialAction: {
              "@type": "WatchAction",
              target: `${BASE}/anime/${animeId}/watch/1`,
            },
          }),
        }}
      />

      {/* Banner */}
      <div className="relative h-56 sm:h-72 w-full overflow-hidden">

        {anime.bannerImage ? (
          <Image
            src={anime.bannerImage}
            alt={title}
            fill
            className="object-cover opacity-50"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-[#111]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e8002d]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-28 relative z-10">
        <div className="flex gap-4 sm:gap-6 mb-8">
          {/* Cover */}
          <div className="flex-none w-24 sm:w-44 overflow-hidden border-2 border-[#e8002d] shadow-[0_0_30px_rgba(232,0,45,0.3)]">
            <Image
              src={anime.coverImage.extraLarge}
              alt={title}
              width={176}
              height={249}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-12 sm:pt-24">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[9px] font-black bg-[#e8002d] text-white px-2 py-1 uppercase tracking-widest">
                {formatFormat(anime.format)}
              </span>
              <span
                className={`text-[9px] font-black px-2 py-1 border uppercase tracking-widest ${anime.status === "RELEASING"
                  ? "border-[#e8002d]/50 text-[#e8002d] bg-[#e8002d]/10"
                  : "border-[#222] text-[#555]"
                  }`}
              >
                {formatStatus(anime.status)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase leading-tight mb-1 tracking-wide">{title}</h1>
            {anime.title.romaji !== title && (
              <p className="text-[#555] text-sm mb-3 font-medium">{anime.title.romaji}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wide text-[#555] mb-5">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#e8002d] fill-[#e8002d]" />
                <span className="text-white font-black">{formatScore(anime.averageScore)}</span>
              </span>
              {anime.episodes && (
                <span className="flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5" /> {anime.episodes} eps
                </span>
              )}
              {anime.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {anime.duration} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatSeason(anime.season ?? null, anime.seasonYear ?? null)}
              </span>
              {anime.popularity && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {anime.popularity.toLocaleString()}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/anime/${animeId}/watch/1`}
                className="flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white font-black px-6 py-3 uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_20px_rgba(232,0,45,0.4)]"
              >
                <Play className="w-4 h-4 fill-white" />
                Watch Now
              </Link>
              <WatchlistButton anime={anime} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-[#e8002d]" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Synopsis</h2>
              </div>
              <p className="text-[#888] text-sm leading-relaxed">{description || "No description available."}</p>
            </section>

            {/* Genres */}
            {anime.genres.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-[#e8002d]" />
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Genres</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((g) => (
                    <Link
                      key={g}
                      href={`/search?genre=${encodeURIComponent(g)}`}
                      className="text-xs font-bold px-3 py-1.5 border border-[#222] hover:border-[#e8002d] text-[#888] hover:text-white uppercase tracking-wide transition-all"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Episodes */}
            <section>
              <EpisodeList animeId={animeId} totalEpisodes={totalEpisodes} />
            </section>

            {/* Characters */}
            {anime.characters?.edges && anime.characters.edges.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-[#e8002d]" />
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Characters</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {anime.characters.edges.slice(0, 12).map((edge) => (
                    <div key={edge.node.id} className="text-center">
                      <div className="relative w-full aspect-square overflow-hidden mb-1 border border-[#222]">
                        <Image
                          src={edge.node.image.medium}
                          alt={edge.node.name.full}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <p className="text-[10px] text-[#888] line-clamp-2 leading-tight">{edge.node.name.full}</p>
                      <p className="text-[9px] text-[#e8002d]/70 font-bold uppercase">{edge.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#111] border border-[#1e1e1e] p-5">
              <h3 className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-4 border-b border-[#1e1e1e] pb-2">Information</h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: "Format", value: formatFormat(anime.format) },
                  { label: "Status", value: formatStatus(anime.status) },
                  { label: "Episodes", value: anime.episodes ?? "Unknown" },
                  { label: "Duration", value: anime.duration ? `${anime.duration} min` : "Unknown" },
                  { label: "Season", value: formatSeason(anime.season ?? null, anime.seasonYear ?? null) },
                  { label: "Studios", value: mainStudios.join(", ") || "Unknown" },
                  { label: "Score", value: formatScore(anime.averageScore) },
                  { label: "Popularity", value: anime.popularity?.toLocaleString() ?? "?" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2 border-b border-[#1a1a1a] pb-2 last:border-0 last:pb-0">
                    <dt className="text-[#555] text-xs font-bold uppercase tracking-wide">{label}</dt>
                    <dd className="text-white text-right text-xs font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Tags */}
            {anime.tags && anime.tags.length > 0 && (
              <div className="bg-[#111] border border-[#1e1e1e] p-5">
                <h3 className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-3 border-b border-[#1e1e1e] pb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {anime.tags.slice(0, 15).map((tag) => (
                    <span
                      key={tag.name}
                      className="text-[9px] font-bold px-2 py-0.5 border border-[#1e1e1e] text-[#555] uppercase tracking-wide hover:border-[#e8002d] hover:text-white transition-colors cursor-default"
                      title={`Rank: ${tag.rank}%`}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trailer */}
            {trailerUrl && (
              <div className="bg-[#111] border border-[#1e1e1e] p-5">
                <h3 className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-3 border-b border-[#1e1e1e] pb-2">Trailer</h3>
                <Link
                  href={trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-black text-white hover:text-[#e8002d] uppercase tracking-widest transition-colors"
                >
                  <Play className="w-4 h-4 fill-[#e8002d] text-[#e8002d]" />
                  Watch on YouTube
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <TrackView
        id={animeId}
        title={title}
        coverImage={anime.coverImage.large}
        coverColor={anime.coverImage.color ?? null}
        genres={anime.genres}
        averageScore={anime.averageScore}
      />
    </div>
  );
}
