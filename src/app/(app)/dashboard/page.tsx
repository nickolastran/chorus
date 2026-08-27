import { Suspense } from "react";
import DashboardOverview from "@/components/dashboard/overview";
import { GenreSelector } from "@/components/genre-selector";
import {
  asGenre,
  getNewAlbums,
  getNewSongs,
  getTopSongs,
  getTopAlbums,
  type Genre,
} from "@/lib/spotify";

export const metadata = { title: "Discover · Chorus" };

type Props = { searchParams: Promise<{ genre?: string }> };

async function Discovery({ genre }: { genre: Genre }) {
  const [newAlbums, newSongs, topSongs, topAlbums] = await Promise.all([
    getNewAlbums(genre),
    getNewSongs(genre),
    getTopSongs(genre),
    getTopAlbums(genre),
  ]);

  return (
    <DashboardOverview
      newAlbums={newAlbums}
      newSongs={newSongs}
      topSongs={topSongs}
      topAlbums={topAlbums}
    />
  );
}

export default async function DashboardPage({ searchParams }: Props) {
  const genre = asGenre((await searchParams).genre);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">Discover</h1>
        <p className="text-sm text-muted-foreground">
          New releases from the last 90 days, most popular first.
        </p>
      </div>

      <div className="mb-8">
        <GenreSelector active={genre} />
      </div>

      <Suspense
        key={genre}
        fallback={<p className="text-muted-foreground">Loading…</p>}
      >
        <Discovery genre={genre} />
      </Suspense>
    </>
  );
}
