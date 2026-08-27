import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAlbum } from "@/lib/spotify";
import { getSession } from "@/lib/session";
import {
  getAlbumEntries,
  getAlbumStats,
  getLikedIds,
  getMyEntry,
} from "@/lib/queries";
import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "@/components/review-form";
import { EntryCard } from "@/components/entry-card";
import { Entry } from "@/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = await getAlbum((await params).id);
  if (!album) return { title: "Album · Chorus" };
  return {
    title: `${album.name} by ${album.artists[0]?.name} · Chorus`,
    description: `Rate and review ${album.name} on Chorus.`,
  };
}

export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const { userId } = await getSession();
  const [stats, entries, myEntry] = await Promise.all([
    getAlbumStats(id),
    getAlbumEntries(id),
    getMyEntry(userId, id),
  ]);

  const reviews = entries.filter((e) => e.body);
  const liked = await getLikedIds(userId, reviews.map((e) => e.id));
  const artist = album.artists[0];

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-8 md:flex-row">
        <div className="relative aspect-square w-full max-w-70 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#1A1A1A]">
          {album.images?.[0]?.url && (
            <Image
              src={album.images[0].url}
              alt={album.name}
              fill
              className="object-cover"
              sizes="280px"
              priority
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            {album.name}
          </h1>
          {artist && (
            <Link
              href={`/artists/${artist.id}`}
              className="mt-2 inline-block text-lg text-muted-foreground hover:text-white hover:underline"
            >
              {artist.name}
            </Link>
          )}

          <p className="mt-2 text-sm text-muted-foreground">
            {album.release_date?.slice(0, 4)}
            {album.total_tracks ? ` · ${album.total_tracks} tracks` : ""}
            {album.album_type ? ` · ${album.album_type}` : ""}
          </p>

          <div className="mt-6 flex items-center gap-4">
            {stats?.avg_rating != null ? (
              <>
                <StarRating rating={Number(stats.avg_rating)} size={22} />
                <span className="text-2xl font-black tabular-nums">
                  {Number(stats.avg_rating).toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  from {stats.rating_count}{" "}
                  {stats.rating_count === 1 ? "rating" : "ratings"}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                No ratings yet — be the first.
              </span>
            )}
          </div>

          {album.tracks?.items?.length ? (
            <ol className="mt-8 space-y-1 text-sm">
              {album.tracks.items.slice(0, 12).map((t, i) => (
                <li key={t.id} className="flex gap-3 text-white/70">
                  <span className="w-5 shrink-0 text-right tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate">{t.name}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-[#111] p-6">
        <h2 className="mb-6 text-lg font-bold">
          {myEntry ? "Your entry" : "Log this album"}
        </h2>
        {userId ? (
          <ReviewForm album={album} entry={myEntry as Entry | null} />
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-bold text-white hover:underline">
              Log in
            </Link>{" "}
            to rate this album and add it to your diary.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nobody has written about this one yet.
          </p>
        ) : (
          reviews.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              liked={liked.has(e.id)}
              signedIn={Boolean(userId)}
            />
          ))
        )}
      </section>
    </div>
  );
}
