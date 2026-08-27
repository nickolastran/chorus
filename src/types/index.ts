// src/types/index.ts

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
  popularity?: number;
  followers?: { total: number };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  popularity?: number;
  duration_ms?: number;
  track_number?: number;
  // Present on search results; absent on tracks nested inside an album.
  album?: SpotifyAlbum;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  release_date?: string;
  total_tracks?: number;
  album_type?: string;
  label?: string;
  // Only returned by the full album endpoint, not by search.
  popularity?: number;
  tracks?: { items: SpotifyTrack[] };
}

// The clean data shape used by our UI components
export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  // Spotify occasionally returns an album with no artwork; the UI guards for it.
  image?: string;
  rank?: number;
}

// ------------------------------------------------------------------ Chorus

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface TopAlbum {
  user_id: string;
  position: number;
  album_id: string;
  album_name: string;
  artist_name: string;
  image_url: string | null;
}

/** A logged listen. Rating and body are both optional, so a bare log, a
 *  rating, and a full review are all the same row. */
export interface Entry {
  id: string;
  user_id: string;
  album_id: string;
  album_name: string;
  artist_name: string;
  artist_id: string | null;
  image_url: string | null;
  release_date: string | null;
  rating: number | null;
  body: string | null;
  listened_on: string;
  created_at: string;
  updated_at: string;
}

/** `entry_details` view: an entry plus its author and interaction counts. */
export interface EntryDetail extends Entry {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  like_count: number;
  comment_count: number;
}

export interface Comment {
  id: string;
  entry_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: Pick<Profile, "username" | "display_name" | "avatar_url">;
}

export interface AlbumStats {
  album_id: string;
  entry_count: number;
  rating_count: number;
  avg_rating: number | null;
}

export interface Concert {
  id: string;
  name: string;
  url: string;
  date: string | null;
  venue: string | null;
  city: string | null;
  image?: string;
}
