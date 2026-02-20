import { GraphQLClient, gql } from "graphql-request";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export const anilistClient = new GraphQLClient("https://graphql.anilist.co");

// ─── Types ────────────────────────────────────────────────────────────────
export interface AnimeTitle {
  romaji: string;
  english: string | null;
  native: string;
}

export interface AnimeCoverImage {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
}

export interface AnimeTag {
  name: string;
  rank: number;
}

export interface AnimeStudio {
  name: string;
}

export interface AnimeStudioEdge {
  isMain: boolean;
  node: AnimeStudio;
}

export interface AnimeCharacter {
  node: {
    id: number;
    name: { full: string };
    image: { medium: string };
  };
  role: string;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  averageScore: number | null;
  popularity: number;
  episodes: number | null;
  status: string;
  season: string | null;
  seasonYear: number | null;
  format: string | null;
  duration: number | null;
  studios?: { edges: AnimeStudioEdge[] };
  tags?: AnimeTag[];
  characters?: { edges: AnimeCharacter[] };
  trailer?: { id: string; site: string } | null;
  nextAiringEpisode?: { airingAt: number; episode: number } | null;
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AnimePageResult {
  Page: {
    pageInfo: PageInfo;
    media: Anime[];
  };
}

// ─── Fragments ────────────────────────────────────────────────────────────
const ANIME_FIELDS = gql`
  fragment AnimeFields on Media {
    id
    title { romaji english native }
    coverImage { extraLarge large medium color }
    bannerImage
    description(asHtml: false)
    genres
    averageScore
    popularity
    episodes
    status
    season
    seasonYear
    format
    duration
    nextAiringEpisode { airingAt episode }
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────
export const GET_TRENDING = gql`
  ${ANIME_FIELDS}
  query GetTrending($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
        ...AnimeFields
      }
    }
  }
`;

export const GET_POPULAR = gql`
  ${ANIME_FIELDS}
  query GetPopular($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...AnimeFields
      }
    }
  }
`;

export const GET_TOP_RATED = gql`
  ${ANIME_FIELDS}
  query GetTopRated($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(sort: SCORE_DESC, type: ANIME, isAdult: false, averageScore_greater: 70) {
        ...AnimeFields
      }
    }
  }
`;

export const GET_SEASONAL = gql`
  ${ANIME_FIELDS}
  query GetSeasonal($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(season: $season, seasonYear: $year, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...AnimeFields
      }
    }
  }
`;

export const SEARCH_ANIME = gql`
  ${ANIME_FIELDS}
  query SearchAnime($search: String, $genre: String, $year: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort], $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(
        search: $search
        genre: $genre
        seasonYear: $year
        season: $season
        format: $format
        status: $status
        sort: $sort
        type: ANIME
        isAdult: false
      ) {
        ...AnimeFields
      }
    }
  }
`;

export const GET_ANIME_DETAIL = gql`
  query GetAnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      coverImage { extraLarge large medium color }
      bannerImage
      description(asHtml: false)
      genres
      averageScore
      popularity
      episodes
      status
      season
      seasonYear
      format
      duration
      trailer { id site }
      nextAiringEpisode { airingAt episode }
      studios { edges { isMain node { name } } }
      tags { name rank }
      characters(sort: ROLE, perPage: 12) {
        edges {
          role
          node { id name { full } image { medium } }
        }
      }
    }
  }
`;

// ─── API Helpers (with Next.js Data Cache + React request deduplication) ──

// unstable_cache persists results in the Next.js Data Cache across requests.
// React cache() deduplicates identical calls within the same render pass
// (e.g. generateMetadata + page both calling getAnimeDetail only hits AniList once).

export const getTrendingAnime = cache(
  unstable_cache(
    async (page = 1, perPage = 20) => {
      const data = await anilistClient.request<AnimePageResult>(GET_TRENDING, { page, perPage });
      return data.Page;
    },
    ["anilist-trending"],
    { revalidate: 3600, tags: ["anilist", "trending"] }
  )
);

export const getPopularAnime = cache(
  unstable_cache(
    async (page = 1, perPage = 20) => {
      const data = await anilistClient.request<AnimePageResult>(GET_POPULAR, { page, perPage });
      return data.Page;
    },
    ["anilist-popular"],
    { revalidate: 3600, tags: ["anilist", "popular"] }
  )
);

export const getTopRatedAnime = cache(
  unstable_cache(
    async (page = 1, perPage = 20) => {
      const data = await anilistClient.request<AnimePageResult>(GET_TOP_RATED, { page, perPage });
      return data.Page;
    },
    ["anilist-top-rated"],
    { revalidate: 3600, tags: ["anilist", "top-rated"] }
  )
);

export const getSeasonalAnime = cache(
  unstable_cache(
    async (season: string, year: number, page = 1, perPage = 20) => {
      const data = await anilistClient.request<AnimePageResult>(GET_SEASONAL, { season, year, page, perPage });
      return data.Page;
    },
    ["anilist-seasonal"],
    { revalidate: 3600, tags: ["anilist", "seasonal"] }
  )
);

export const searchAnime = async (params: {
  search?: string;
  genre?: string;
  year?: number;
  season?: string;
  format?: string;
  status?: string;
  sort?: string[];
  page?: number;
  perPage?: number;
}) => {
  // Build an explicit stable cache key from the sorted params so that
  // { page:1, search:"naruto" } and { search:"naruto", page:1 } hit the same entry.
  const { search, genre, year, season, format, status, sort, page = 1, perPage = 20 } = params;
  const cacheKey = JSON.stringify({ search, genre, year, season, format, status, sort, page, perPage });

  const fetcher = unstable_cache(
    async () => {
      const data = await anilistClient.request<AnimePageResult>(SEARCH_ANIME, {
        search, genre, year, season, format, status, sort, page, perPage,
      });
      return data.Page;
    },
    ["anilist-search", cacheKey],
    { revalidate: 300, tags: ["anilist", "search"] }
  );

  return fetcher();
};

// cache() wraps unstable_cache so generateMetadata + the page share the same
// resolved value without a second AniList network call.
export const getAnimeDetail = cache(
  unstable_cache(
    async (id: number) => {
      const data = await anilistClient.request<{ Media: Anime & {
        studios: { edges: AnimeStudioEdge[] };
        tags: AnimeTag[];
        characters: { edges: AnimeCharacter[] };
        trailer: { id: string; site: string } | null;
      } }>(GET_ANIME_DETAIL, { id });
      return data.Media;
    },
    ["anilist-anime-detail"],
    { revalidate: 3600, tags: ["anilist", "anime-detail"] }
  )
);

// ─── Constants ────────────────────────────────────────────────────────────
export const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mecha", "Music", "Mystery", "Psychological",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

export const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"];

export const FORMATS = [
  { label: "TV", value: "TV" },
  { label: "Movie", value: "MOVIE" },
  { label: "OVA", value: "OVA" },
  { label: "ONA", value: "ONA" },
  { label: "Special", value: "SPECIAL" },
];

export const STATUSES = [
  { label: "Airing", value: "RELEASING" },
  { label: "Finished", value: "FINISHED" },
  { label: "Not Yet Aired", value: "NOT_YET_RELEASED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const SORT_OPTIONS = [
  { label: "Trending", value: ["TRENDING_DESC"] },
  { label: "Popularity", value: ["POPULARITY_DESC"] },
  { label: "Score", value: ["SCORE_DESC"] },
  { label: "Newest", value: ["START_DATE_DESC"] },
  { label: "Title A-Z", value: ["TITLE_ROMAJI"] },
];

export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i);
