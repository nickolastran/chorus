// src/app/dashboard/page.tsx

import { createClient } from "@/utils/supabase/server"; // Update path if needed
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/dashboard-nav";
import DashboardOverview from "@/components/dashboard/overview";
import {
  getNewReleases,
  getNewSongs,
  getGlobalTop50,
  getTopAlbums,
} from "@/lib/spotify";
import {
  SpotifyAlbumResponse,
  SpotifyPlaylistResponse,
  MusicItem,
  SpotifyAlbum,
  SpotifyPlaylistTrackItem,
} from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch data with Type Assertions
  const [newAlbumsData, newSongsData, topSongsData, topAlbumsData] =
    await Promise.all([
      getNewReleases() as Promise<SpotifyAlbumResponse>,
      getNewSongs() as Promise<SpotifyPlaylistResponse>,
      getGlobalTop50() as Promise<SpotifyPlaylistResponse>,
      getTopAlbums() as Promise<SpotifyPlaylistResponse>,
    ]);

  // --- Data Transformation ---

  // 1. New Albums
  const newAlbums: MusicItem[] =
    newAlbumsData?.albums?.items?.map((album: SpotifyAlbum) => ({
      id: album.id,
      title: album.name,
      artist: album.artists[0].name,
      image: album.images[0]?.url,
    })) || [];

  // 2. New Songs
  const newSongs: MusicItem[] =
    newSongsData?.items?.map((item: SpotifyPlaylistTrackItem) => ({
      id: item.track.id,
      title: item.track.name,
      artist: item.track.artists[0].name,
      image: item.track.album.images[0]?.url,
    })) || [];

  // 3. Top 50 Songs
  const topSongs: MusicItem[] =
    topSongsData?.items?.map(
      (item: SpotifyPlaylistTrackItem, index: number) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists[0].name,
        image: item.track.album.images[0]?.url,
        rank: index + 1,
      }),
    ) || [];

  // 4. Top 50 Albums
  const seenAlbums = new Set<string>();
  const topAlbums: MusicItem[] =
    topAlbumsData?.items
      ?.reduce((acc: MusicItem[], item: SpotifyPlaylistTrackItem) => {
        const album = item.track.album;
        if (!seenAlbums.has(album.id)) {
          seenAlbums.add(album.id);
          acc.push({
            id: album.id,
            title: album.name,
            artist: album.artists[0].name,
            image: album.images[0]?.url,
            rank: acc.length + 1,
          });
        }
        return acc;
      }, [])
      .slice(0, 50) || [];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <DashboardNav user={user} />

      <main className="container mx-auto py-10 px-6 space-y-10">
        <DashboardOverview
          newAlbums={newAlbums}
          newSongs={newSongs}
          topSongs={topSongs}
          topAlbums={topAlbums}
        />
      </main>
    </div>
  );
}
