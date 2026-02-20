# VibeAnime

A fast, modern anime streaming site built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

## Features

- ?? **Stream anime** via HiAnime (megaplay.buzz / vidwish.live embeds) — sub & dub
- ?? **Search & filter** by genre, format, status, season, year, score
- ?? **Anime detail pages** with episode lists, characters, trailers, and studio info
- ?? **Watchlist** — saved locally, persisted across sessions
- ?? **Continue Watching** — picks up where you left off
- ?? **Recently Viewed** — quick access to browsing history
- ?? **Auth** — register / login with JWT sessions
- ? **Fast** — ISR caching, Suspense streaming, AVIF images, self-hosted fonts

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Anime data | AniList GraphQL API |
| Episode data | HiAnime (aniwatch-api) |
| Auth | NextAuth v5 (credentials) |
| State | Zustand + localStorage persist |
| Fonts | next/font/google (Bebas Neue, Space Grotesk) |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local and set AUTH_SECRET

# 3. Run dev server
npm run dev
```

Open http://localhost:3000

**Demo account:** `demo@vibeanime.com` / `demo123`

## Deploy to Vercel

1. Push repo to GitHub
2. Import in https://vercel.com
3. Add environment variables:
   - `AUTH_SECRET` — generate with: `openssl rand -base64 32`
   - `NEXT_PUBLIC_BASE_URL` — your production URL (e.g. https://vibeanime.vercel.app)
4. Deploy

## Project Structure

```
src/
+-- app/                  # Next.js App Router pages & API routes
¦   +-- anime/[id]/       # Anime detail + watch pages
¦   +-- api/              # API routes (search, streaming, auth)
¦   +-- auth/             # Login & register pages
¦   +-- genres/           # Genre browser
¦   +-- search/           # Search & filter page
¦   +-- watchlist/        # User watchlist page
+-- components/           # Reusable UI components
+-- lib/                  # API helpers (AniList, streaming, userDb)
+-- store/                # Zustand stores
```

## Data Sources

- **AniList** (https://anilist.co) — anime metadata, images, scores
- **HiAnime** via aniwatch-api — episode lists
- **megaplay.buzz / vidwish.live** — video embeds

> For educational purposes only. All content belongs to their respective owners.
