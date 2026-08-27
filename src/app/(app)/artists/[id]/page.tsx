import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtist, getArtistAlbums, getArtistTopTracks } from "@/lib/spotify";
import { getRatingsFor } from "@/lib/queries";
import { AlbumCard } from "@/components/album-card";
import { Avatar } from "@/components/avatar";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = await getArtist((await params).id);
  return { title: artist ? `${artist.name} · Chorus` : "Artist · Chorus" };
}

export default async function ArtistPage({ params }: Props) {
  const { id } = await params;
  const [artist, albums, topTracks] = await Promise.all([
    getArtist(id),
    getArtistAlbums(id),
    getArtistTopTracks(id),
  ]);
  if (!artist) notFound();

  const ratings = await getRatingsFor(albums.map((a) => a.id));

  return (
    <div className="space-y-12">
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar
          url={artist.images?.[0]?.url}
          name={artist.name}
          size={140}
          className="border border-white/10"
        />
        <div>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            {artist.name}
          </h1>
          {artist.followers && (
            <p className="mt-2 text-sm text-muted-foreground">
              {artist.followers.total.toLocaleString()} followers on Spotify
            </p>
          )}
          {artist.genres?.length ? (
            <p className="mt-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
              {artist.genres.slice(0, 3).join(" · ")}
            </p>
          ) : null}
        </div>
      </header>

      {topTracks.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Popular tracks</h2>
          <ol className="space-y-1">
            {topTracks.slice(0, 10).map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="truncate text-white/80">{t.name}</span>
                {t.album && (
                  <Link
                    href={`/albums/${t.album.id}`}
                    className="ml-auto shrink-0 truncate text-xs text-muted-foreground hover:text-white hover:underline"
                  >
                    {t.album.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold">Discography</h2>
        {albums.length === 0 ? (
          <p className="text-sm text-muted-foreground">No releases found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {albums.map((a) => (
              <AlbumCard
                key={a.id}
                id={a.id}
                title={a.name}
                subtitle={a.release_date?.slice(0, 4)}
                image={a.images?.[0]?.url}
                rating={ratings.get(a.id) ?? null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
