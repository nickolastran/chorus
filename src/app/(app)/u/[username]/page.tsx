import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import {
  getFollowCounts,
  getLikedIds,
  getProfileByUsername,
  getTopAlbums,
  getUserEntries,
  isFollowing,
} from "@/lib/queries";
import { EntryCard } from "@/components/entry-card";
import { FollowButton } from "@/components/follow-button";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfileByUsername((await params).username);
  if (!profile) return { title: "Profile · Chorus" };
  const who = profile.display_name || profile.username;
  return {
    title: `${who} · Chorus`,
    description: profile.bio ?? `${who}'s music diary on Chorus.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const profile = await getProfileByUsername((await params).username);
  if (!profile) notFound();

  const { userId } = await getSession();
  const [entries, top, counts, following] = await Promise.all([
    getUserEntries(profile.id, 12),
    getTopAlbums(profile.id),
    getFollowCounts(profile.id),
    isFollowing(userId, profile.id),
  ]);

  const liked = await getLikedIds(userId, entries.map((e) => e.id));
  const isMe = userId === profile.id;
  const rated = entries.filter((e) => e.rating != null);

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar url={profile.avatar_url} name={profile.username} size={96} />

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-black tracking-tight">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-muted-foreground">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-3 max-w-prose whitespace-pre-wrap text-white/80">
              {profile.bio}
            </p>
          )}

          <div className="mt-4 flex gap-6 text-sm">
            <span>
              <strong className="font-black tabular-nums">{counts.followers}</strong>{" "}
              <span className="text-muted-foreground">followers</span>
            </span>
            <span>
              <strong className="font-black tabular-nums">{counts.following}</strong>{" "}
              <span className="text-muted-foreground">following</span>
            </span>
            <Link href={`/u/${profile.username}/library`} className="hover:underline">
              <strong className="font-black tabular-nums">{rated.length}</strong>{" "}
              <span className="text-muted-foreground">logged</span>
            </Link>
          </div>
        </div>

        <div className="shrink-0">
          {isMe ? (
            <Link href="/settings">
              <Button variant="outline" className="rounded-full font-bold">
                Edit profile
              </Button>
            </Link>
          ) : (
            <FollowButton
              targetId={profile.id}
              following={following}
              signedIn={Boolean(userId)}
            />
          )}
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-bold">Top 5 Albums</h2>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isMe ? (
              <>
                Nothing picked yet —{" "}
                <Link href="/settings" className="font-bold text-white hover:underline">
                  choose your five
                </Link>
                .
              </>
            ) : (
              "No favourites picked yet."
            )}
          </p>
        ) : (
          <ol className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {top.map((a) => (
              <li key={a.position}>
                <Link href={`/albums/${a.album_id}`} className="group block">
                  <div className="relative mb-2 aspect-square overflow-hidden rounded-xl border border-white/5 bg-[#1A1A1A] transition-transform group-hover:scale-105">
                    <span className="absolute top-2 left-2 z-10 rounded bg-black/70 px-2 py-0.5 text-xs font-black backdrop-blur-md">
                      {a.position}
                    </span>
                    {a.image_url && (
                      <Image
                        src={a.image_url}
                        alt={a.album_name}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                    )}
                  </div>
                  <p className="truncate text-sm font-bold">{a.album_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.artist_name}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Recent activity</h2>
          <Link
            href={`/u/${profile.username}/library`}
            className="text-sm font-bold text-muted-foreground hover:text-white"
          >
            View library →
          </Link>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
        ) : (
          entries.map((e) => (
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
