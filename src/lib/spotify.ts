// src/lib/spotify.ts

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

// 1. Token Endpoint
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

async function getAccessToken() {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    next: { revalidate: 3600 },
  });

  return response.json();
}

// 2. New Album Releases
export async function getNewReleases() {
  const { access_token } = await getAccessToken();
  const response = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=20",
    {
      headers: { Authorization: `Bearer ${access_token}` },
      next: { revalidate: 3600 },
    },
  );
  return response.json();
}

// Helper: Fetch a specific playlist's tracks
async function getPlaylistTracks(playlistId: string) {
  const { access_token } = await getAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

// 3. New Songs (New Music Friday Global)
export async function getNewSongs() {
  return getPlaylistTracks("37i9dQZF1DX4JAvHpjipBk");
}

// 4. Top 50 Songs (Global Top 50)
export async function getGlobalTop50() {
  return getPlaylistTracks("37i9dQZEVXbMDoHDwVN2tF");
}

// 5. Top Albums (Today's Top Hits - used to extract popular albums)
export async function getTopAlbums() {
  return getPlaylistTracks("37i9dQZF1DXcBWIGoYBM5M");
}
