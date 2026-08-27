import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { StarRating } from "@/components/star-rating";
import { LikeButton } from "@/components/like-button";
import { EntryDetail } from "@/types";

/** One row of any feed: who logged what, how they rated it, and the
 *  first slice of the review. The whole card links to the shareable page. */
export function EntryCard({
  entry,
  liked,
  signedIn,
}: {
  entry: EntryDetail;
  liked: boolean;
  signedIn: boolean;
}) {
  const handle = entry.username;

  return (
    <article className="flex gap-4 rounded-xl border border-white/5 bg-[#111] p-4 transition-colors hover:border-white/15">
      <Link
        href={`/albums/${entry.album_id}`}
        className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-[#1A1A1A] sm:w-24"
      >
        {entry.image_url && (
          <Image
            src={entry.image_url}
            alt={entry.album_name}
            fill
            className="object-cover"
            sizes="96px"
          />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Avatar url={entry.avatar_url} name={handle} size={24} />
          <Link href={`/u/${handle}`} className="text-sm font-bold hover:underline">
            {entry.display_name || handle}
          </Link>
          <time
            className="text-xs text-muted-foreground"
            dateTime={entry.listened_on}
          >
            {new Date(entry.listened_on).toLocaleDateString()}
          </time>
        </div>

        <Link href={`/albums/${entry.album_id}`} className="group mt-2 block">
          <h3 className="truncate font-bold group-hover:underline">
            {entry.album_name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {entry.artist_name}
          </p>
        </Link>

        {entry.rating != null && <StarRating rating={entry.rating} className="mt-2" />}

        {entry.body && (
          <Link href={`/reviews/${entry.id}`} className="mt-2 block">
            <p className="line-clamp-3 text-sm text-white/70 hover:text-white/90">
              {entry.body}
            </p>
          </Link>
        )}

        <div className="mt-3 flex items-center gap-5">
          <LikeButton
            entryId={entry.id}
            count={Number(entry.like_count)}
            liked={liked}
            signedIn={signedIn}
          />
          <Link
            href={`/reviews/${entry.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="tabular-nums">{Number(entry.comment_count)}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
