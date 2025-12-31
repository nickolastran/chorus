// src/types/index.ts

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  name: string;
  id: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

export interface SpotifyPlaylistTrackItem {
  track: SpotifyTrack;
}

// Response structure for "New Releases"
export interface SpotifyAlbumResponse {
  albums: {
    items: SpotifyAlbum[];
  };
}

// Response structure for Playlists
export interface SpotifyPlaylistResponse {
  items: SpotifyPlaylistTrackItem[];
}

// The clean data shape used by our UI components
export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  image: string;
  rank?: number;
}
