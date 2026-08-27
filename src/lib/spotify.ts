// src/lib/spotify.ts
//
// Spotify retired Client-Credentials access to its editorial playlists (the
// `37i9dQZ*` IDs) and froze browse/new-releases in the Nov 2024 Web API
// deprecation — that endpoint still serves an April 2024 snapshot. Everything
// here runs off search + albums?ids=, which are the surfaces still live.

import { MusicItem, SpotifyAlbum, SpotifyArtist, SpotifyTrack } from "@/types";

const basic = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
).toString("base64");

const MARKET = "US";

/** How far back "new" reaches. Spotify's own tag:new window is about two
 *  weeks, which is too tight: popularity takes time to accrue, so 46 of 50
 *  tag:new albums score 0 and the row fills with releases nobody has heard
 *  of. Ninety days still reads as new while letting a ranking mean something. */
const RECENT_WINDOW_DAYS = 90;

// Spotify tokens live 3600s, but `next: { revalidate }` does nothing here:
// Next only stores GET responses in its Data Cache, so every call through
// this module was minting a brand-new token — 22 per dashboard render, 190
// across ten. The token is therefore cached in module scope against its own
// advertised expiry instead of relying on the fetch cache.
let cachedToken: { value: string; expiresAt: number } | null = null;
// Shared so a burst of parallel calls performs one mint, not one each.
let pendingToken: Promise<string | null> | null = null;

// Refresh a minute early rather than racing the exact expiry.
const TOKEN_SAFETY_MARGIN_MS = 60_000;

async function mintToken(): Promise<string | null> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    // Never let Next hand back a stale token from its cache.
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`Spotify token request failed: ${response.status}`);
    return null;
  }

  const data = await response.json();
  const value = data.access_token as string | undefined;
  if (!value) return null;

  const ttl = Number(data.expires_in) || 3600;
  cachedToken = {
    value,
    expiresAt: Date.now() + ttl * 1000 - TOKEN_SAFETY_MARGIN_MS,
  };
  return value;
}

async function getAccessToken(force = false): Promise<string | null> {
  if (force) cachedToken = null;
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  pendingToken ??= mintToken().finally(() => {
    pendingToken = null;
  });
  return pendingToken;
}

/** Single place every call goes through, so a failure is logged once and
 *  degrades to an empty section instead of throwing the page away. */
async function api<T>(path: string, retryOn401 = true): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const response = await fetch(`https://api.spotify.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 },
  });

  if (response.ok) return response.json();

  // A cached token can still die mid-flight — revoked, or clock skew against
  // Spotify's expiry. Discard it and try once with a freshly minted one
  // rather than surfacing the failure.
  if (response.status === 401 && retryOn401) {
    await getAccessToken(true);
    return api<T>(path, false);
  }

  console.error(
    `Spotify /${path} failed: ${response.status} ${response.statusText}`,
  );
  return null;
}

const search = (query: string, type: string, limit = 50) =>
  `search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&market=${MARKET}`;

// ------------------------------------------------------------------ genres

/** Genres offered on Discover. Every token here was checked against the API:
 *  Spotify's `genre:` filter takes single words plus a couple of compounds,
 *  and silently returns nothing for anything else — "hip-hop", "rap",
 *  "k-pop" and "alternative" all yield 0 results, while "hip hop" works. */
export const GENRES = [
  "all",
  "pop",
  "hip hop",
  "rock",
  "r&b",
  "indie",
  "country",
  "electronic",
  "latin",
  "metal",
  "jazz",
] as const;

export type Genre = (typeof GENRES)[number];

export const asGenre = (value?: string): Genre =>
  (GENRES as readonly string[]).includes(value ?? "") ? (value as Genre) : "all";

// ------------------------------------------------------------ album pooling

async function albumIds(query: string): Promise<string[]> {
  const found = await api<{ albums: { items: { id: string }[] } }>(
    search(query, "album"),
  );
  return found?.albums?.items?.map((a) => a.id) ?? [];
}

/** Search returns simplified albums with no popularity and no tracks, so ids
 *  get rehydrated through albums?ids=, which caps at 20 per call. */
async function hydrate(ids: string[]): Promise<SpotifyAlbum[]> {
  const batches = [];
  for (let i = 0; i < ids.length; i += 20) batches.push(ids.slice(i, i + 20));

  const pages = await Promise.all(
    batches.map((b) =>
      api<{ albums: SpotifyAlbum[] }>(
        `albums?ids=${b.join(",")}&market=${MARKET}`,
      ),
    ),
  );
  return pages.flatMap((p) => p?.albums ?? []).filter(Boolean);
}

/** Spotify lists a record once per edition, so "Deluxe" and the standard
 *  press both come back. Keep whichever scored higher. */
function dedupeEditions(albums: SpotifyAlbum[]): SpotifyAlbum[] {
  const best = new Map<string, SpotifyAlbum>();

  for (const album of albums) {
    const title = album.name
      .toLowerCase()
      .replace(/\s*[([].*?[)\]]\s*/g, " ")
      .trim();
    const key = `${album.artists[0]?.name.toLowerCase() ?? ""}|${title}`;

    const current = best.get(key);
    if (!current || (album.popularity ?? 0) > (current.popularity ?? 0)) {
      best.set(key, album);
    }
  }

  return [...best.values()];
}

function daysSinceRelease(album: SpotifyAlbum): number {
  const raw = album.release_date;
  if (!raw) return Number.MAX_SAFE_INTEGER;

  // release_date precision varies: "2026", "2026-08", or "2026-08-27".
  const iso =
    raw.length === 4 ? `${raw}-01-01` : raw.length === 7 ? `${raw}-01` : raw;
  const then = Date.parse(iso);

  return Number.isNaN(then) ? Number.MAX_SAFE_INTEGER : (Date.now() - then) / 86_400_000;
}

/** Album ids reached via track search. `genre:` is an artist attribute, so
 *  Spotify honours it on tracks but returns 0 albums for every genre — the
 *  only way to a genre's albums is through its tracks. */
async function albumIdsByGenre(query: string): Promise<string[]> {
  const found = await api<{ tracks: { items: SpotifyTrack[] } }>(
    search(query, "track"),
  );
  const ids = (found?.tracks?.items ?? [])
    .map((t) => t.album?.id)
    .filter((id): id is string => Boolean(id));
  return [...new Set(ids)];
}

/** Candidate pool for a genre. A single search only surfaces ~50 albums, so
 *  both branches issue a couple of queries to widen coverage before ranking. */
async function albumPool(genre: Genre): Promise<SpotifyAlbum[]> {
  const year = new Date().getFullYear();

  const found =
    genre === "all"
      ? await Promise.all([albumIds(`year:${year}`), albumIds("tag:new")])
      : await Promise.all([
          albumIdsByGenre(`genre:${genre} year:${year}`),
          albumIdsByGenre(`genre:${genre} year:${year - 1}`),
        ]);

  return dedupeEditions(await hydrate([...new Set(found.flat())].slice(0, 100)));
}

// -------------------------------------------------------------- projections

const albumItem = (album: SpotifyAlbum, rank?: number): MusicItem => ({
  id: album.id,
  title: album.name,
  artist: album.artists[0]?.name ?? "Unknown Artist",
  image: album.images[0]?.url,
  rank,
});

const trackItem = (
  track: SpotifyTrack,
  album: SpotifyAlbum | undefined,
  rank?: number,
): MusicItem => ({
  id: track.id,
  title: track.name,
  artist: track.artists[0]?.name ?? "Unknown Artist",
  image: (track.album ?? album)?.images?.[0]?.url,
  rank,
});

const byPopularity = (a: { popularity?: number }, b: { popularity?: number }) =>
  (b.popularity ?? 0) - (a.popularity ?? 0);

/** Enough entries to fill a scrolling row without it looking broken. */
const MIN_ROW = 8;

/** Recent releases, most popular first.
 *
 *  Two filters are applied in order, and each is skipped if it would leave
 *  the row too sparse to render — a narrower genre simply has less recent
 *  material, and an empty row is worse than a slightly older one.
 *    1. drop popularity 0: exactly the "who is this?" entries
 *    2. keep the last 90 days */
async function recentRanked(genre: Genre): Promise<SpotifyAlbum[]> {
  const pool = [...(await albumPool(genre))].sort(byPopularity);

  const known = pool.filter((a) => (a.popularity ?? 0) > 0);
  const base = known.length >= MIN_ROW ? known : pool;

  const recent = base.filter((a) => daysSinceRelease(a) <= RECENT_WINDOW_DAYS);
  return recent.length >= MIN_ROW ? recent : base.slice(0, 40);
}

export async function getNewAlbums(genre: Genre = "all"): Promise<MusicItem[]> {
  return (await recentRanked(genre)).map((a) => albumItem(a));
}

/** The lead track off each recent release stands in for the retired
 *  "New Music Friday" playlist. */
export async function getNewSongs(genre: Genre = "all"): Promise<MusicItem[]> {
  return (await recentRanked(genre)).flatMap((album) => {
    const track = album.tracks?.items?.[0];
    return track ? [trackItem(track, album)] : [];
  });
}

/** Spotify no longer exposes its charts to app tokens, so "popular" means
 *  most popular across this year's releases, not the real Global Top 50. */
export async function getTopAlbums(genre: Genre = "all"): Promise<MusicItem[]> {
  return [...(await albumPool(genre))]
    .sort(byPopularity)
    .slice(0, 50)
    .map((album, i) => albumItem(album, i + 1));
}

export async function getTopSongs(genre: Genre = "all"): Promise<MusicItem[]> {
  const year = new Date().getFullYear();
  const query =
    genre === "all" ? `genre:pop year:${year}` : `genre:${genre} year:${year}`;

  const results = await api<{ tracks: { items: SpotifyTrack[] } }>(
    search(query, "track"),
  );

  return [...(results?.tracks?.items ?? [])]
    .sort(byPopularity)
    .map((track, i) => trackItem(track, undefined, i + 1));
}

// ------------------------------------------------------- album & artist pages

export async function getAlbum(id: string): Promise<SpotifyAlbum | null> {
  return api<SpotifyAlbum>(`albums/${id}?market=${MARKET}`);
}

export async function getArtist(id: string): Promise<SpotifyArtist | null> {
  return api<SpotifyArtist>(`artists/${id}`);
}

export async function getArtistAlbums(id: string): Promise<SpotifyAlbum[]> {
  const res = await api<{ items: SpotifyAlbum[] }>(
    `artists/${id}/albums?include_groups=album,single&limit=50&market=${MARKET}`,
  );
  return dedupeEditions(res?.items ?? []);
}

export async function getArtistTopTracks(id: string): Promise<SpotifyTrack[]> {
  const res = await api<{ tracks: SpotifyTrack[] }>(
    `artists/${id}/top-tracks?market=${MARKET}`,
  );
  return res?.tracks ?? [];
}

// ------------------------------------------------------------- global search

export interface SearchResults {
  albums: SpotifyAlbum[];
  artists: SpotifyArtist[];
  tracks: SpotifyTrack[];
}

export async function searchCatalog(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return { albums: [], artists: [], tracks: [] };

  const res = await api<{
    albums?: { items: SpotifyAlbum[] };
    artists?: { items: SpotifyArtist[] };
    tracks?: { items: SpotifyTrack[] };
  }>(search(q, "album,artist,track", 24));

  return {
    albums: res?.albums?.items ?? [],
    artists: res?.artists?.items ?? [],
    tracks: res?.tracks?.items ?? [],
  };
}
