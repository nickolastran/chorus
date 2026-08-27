import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getComments, getEntryDetail, getLikedIds } from "@/lib/queries";
import { StarRating } from "@/components/star-rating";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import { ShareButton } from "@/components/share-button";
import { Avatar } from "@/components/avatar";

type Props = { params: Promise<{ id: string }> };

/** This page is the shareable link, so it carries real Open Graph metadata
 *  and stays readable when signed out. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await getEntryDetail((await params).id);
  if (!entry) return { title: "Review · Chorus" };

  const who = entry.display_name || entry.username;
  const title = `${who} on ${entry.album_name} · Chorus`;
  const description =
    entry.body?.slice(0, 200) ??
    `${who} rated ${entry.album_name} by ${entry.artist_name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: entry.image_url ? [entry.image_url] : undefined,
    },
  };
}

export default async function ReviewPage({ params }: Props) {
  const { id } = await params;
  const entry = await getEntryDetail(id);
  if (!entry) notFound();

  const { userId } = await getSession();
  const [comments, liked] = await Promise.all([
    getComments(id),
    getLikedIds(userId, [id]),
  ]);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div className="flex gap-6">
        <Link
          href={`/albums/${entry.album_id}`}
          className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#1A1A1A] sm:w-40"
        >
          {entry.image_url && (
            <Image
              src={entry.image_url}
              alt={entry.album_name}
              fill
              className="object-cover"
              sizes="160px"
            />
          )}
        </Link>

        <div className="min-w-0">
          <Link href={`/albums/${entry.album_id}`}>
            <h1 className="text-2xl font-black tracking-tight hover:underline sm:text-3xl">
              {entry.album_name}
            </h1>
          </Link>
          <p className="mt-1 text-muted-foreground">{entry.artist_name}</p>
          {entry.rating != null && (
            <StarRating rating={entry.rating} size={22} className="mt-4" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 border-y border-white/10 py-4">
        <Avatar url={entry.avatar_url} name={entry.username} size={40} />
        <div>
          <Link href={`/u/${entry.username}`} className="font-bold hover:underline">
            {entry.display_name || entry.username}
          </Link>
          <p className="text-xs text-muted-foreground">
            Listened {new Date(entry.listened_on).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-5">
          <ShareButton />
          <LikeButton
            entryId={entry.id}
            count={Number(entry.like_count)}
            liked={liked.has(entry.id)}
            signedIn={Boolean(userId)}
          />
        </div>
      </div>

      {entry.body ? (
        <p className="text-lg leading-relaxed whitespace-pre-wrap text-white/85">
          {entry.body}
        </p>
      ) : (
        <p className="text-muted-foreground italic">
          A rating with no review attached.
        </p>
      )}

      <CommentSection entryId={entry.id} comments={comments} currentUserId={userId} />
    </article>
  );
}
