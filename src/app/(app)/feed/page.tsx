import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getFollowingFeed, getGlobalFeed, getLikedIds } from "@/lib/queries";
import { EntryCard } from "@/components/entry-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Feed · Chorus" };

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function FeedPage({ searchParams }: Props) {
  const following = (await searchParams).tab === "following";
  const { userId } = await getSession();

  const entries =
    following && userId
      ? await getFollowingFeed(userId)
      : await getGlobalFeed();

  const liked = await getLikedIds(userId, entries.map((e) => e.id));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-black tracking-tight">Feed</h1>

      <div className="flex gap-1 border-b border-white/10">
        <Tab href="/feed" active={!following}>
          Everyone
        </Tab>
        <Tab href="/feed?tab=following" active={following}>
          Following
        </Tab>
      </div>

      {entries.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {following
            ? "Nothing here yet — follow some listeners to fill this in."
            : "No activity yet. Be the first to log an album."}
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              liked={liked.has(e.id)}
              signedIn={Boolean(userId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "-mb-px border-b-2 px-4 py-2 text-sm font-bold transition-colors",
        active
          ? "border-white text-white"
          : "border-transparent text-muted-foreground hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}
