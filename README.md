# Chorus

A social music review platform — Letterboxd, but for albums.

Log what you listen to, rate it out of five, write a review, and follow other
listeners to see what they're playing. Album and artist data comes from the
Spotify Web API; everything social lives in Supabase.

**New here?** Read [SETUP.md](./SETUP.md) — the app won't have any social data
until you run one SQL migration.

---

## What it does

**Log and review** — one entry per album per person, where the rating and the
review body are both optional. A quick log, a bare rating, and a full write-up
are the same record with more fields filled in, so your diary and your review
list can never disagree.

**Half-star ratings** — 0.5 to 5, enforced in the database as well as the UI.

**Social** — follow people, like and comment on reviews, and read either a
global feed or a following-only one.

**Profiles** — editable bio and display name, a curated Top 5 Albums grid, and
a library view of everything you've logged grouped by month.

**Discover** — new releases and popular albums, filterable by genre.

**Search** — albums, artists, and people in a single query.

**Concerts** — upcoming shows via the Ticketmaster Discovery API. Optional; the
page renders an empty state until you add a key.

Album, artist, review and profile pages are **public**. A review link that
bounced a logged-out visitor to the login screen wouldn't be shareable, so only
`/dashboard`, `/feed` and `/settings` sit behind auth.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database & auth | Supabase (Postgres + row-level security) |
| Music data | Spotify Web API (client credentials) |
| Events | Ticketmaster Discovery API *(optional)* |
| Type | Metropolis, self-hosted via `@fontsource/metropolis` |

---

## Quick start

```bash
npm install
npm run dev
```

Then create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SPOTIFY_CLIENT_ID=<id>
SPOTIFY_CLIENT_SECRET=<secret>

# Optional — enables /concerts
TICKETMASTER_API_KEY=
```

Finally, run `supabase/migrations/0001_chorus_social.sql` against your Supabase
project. Full walkthrough in [SETUP.md](./SETUP.md).

### Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run test:schema  # apply the migration to a throwaway Postgres and
                     # assert its constraints (needs local postgres 15)
```

---

## Routes

| Route | Auth | Purpose |
|---|---|---|
| `/` | public | Landing page |
| `/login`, `/signup` | public | Email + password auth |
| `/dashboard` | **required** | Discover: new releases, popular albums, genre filter |
| `/feed` | **required** | Global and following feeds |
| `/settings` | **required** | Edit profile and Top 5 |
| `/albums/[id]` | public | Album detail, rating form, reviews |
| `/artists/[id]` | public | Artist page and discography |
| `/reviews/[id]` | public | A single review — the shareable link |
| `/u/[username]` | public | Profile |
| `/u/[username]/library` | public | Music diary, grouped by month |
| `/search?q=` | public | Albums, artists, people |
| `/concerts` | public | Ticketmaster listings |

---

## Layout

```
src/
├── app/
│   ├── (app)/          shared shell — nav + session, no auth gate
│   ├── (auth)/         login and signup
│   ├── api/albums/     album typeahead for the Top 5 picker
│   └── auth/callback/  Supabase OAuth callback
├── components/         feature components + ui/ primitives
├── lib/
│   ├── spotify.ts      token handling, discovery, search
│   ├── ticketmaster.ts concerts (key optional)
│   ├── queries.ts      every database read
│   ├── actions.ts      every database write, validated server-side
│   └── session.ts      current user + profile
└── types/              shared types
supabase/
├── migrations/         the schema — run this first
└── tests/              behavioural assertions on the schema
```

### Data model

Six tables: `profiles`, `entries`, `comments`, `likes`, `follows`, `top_albums`.

Two views keep feeds to a single query — `entry_details` pre-joins the author
and pre-counts likes and comments, `album_stats` pre-computes average ratings.
Both use `security_invoker` so row-level security still applies to the caller.

Album titles, artists and cover URLs are **denormalised onto `entries`** on
purpose: feeds would otherwise need a Spotify round-trip per row just to draw
a cover.

---

## Notes on the Spotify integration

Spotify's November 2024 API deprecation removed a lot from client-credentials
apps, and the code works around it in ways that look odd without the context:

- **Editorial playlists are gone.** Global Top 50, New Music Friday and the
  other `37i9dQZ*` IDs return 404, as do `browse/featured-playlists` and
  `recommendations`. There is no chart endpoint any more, which is why the
  discovery rows say "Popular" rather than "Top 50".
- **`browse/new-releases` is frozen**, still serving an April 2024 snapshot.
  Everything is built on `search` + `albums?ids=` instead.
- **New releases use a 90-day window**, not Spotify's own two-week `tag:new`.
  Popularity takes time to accrue, so in a two-week window roughly 46 of 50
  albums score zero and the row fills with releases nobody has heard of.
- **Genre filtering goes through tracks.** `genre:` is an artist attribute:
  Spotify honours it on track search and returns zero albums for every genre,
  with no error. Only some tokens work — `hip hop` does, `hip-hop`, `rap`,
  `k-pop` and `alternative` all silently return nothing.
- **The access token is cached in module scope**, not via `fetch`. Next only
  caches GET responses, so `next: { revalidate }` on the token POST does
  nothing and every call would mint a fresh token.
- Everything is pinned to the **US** market.

---

## License

Not currently licensed for reuse.
