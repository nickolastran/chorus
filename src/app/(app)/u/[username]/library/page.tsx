import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfileByUsername, getUserEntries } from "@/lib/queries";
import { AlbumCard } from "@/components/album-card";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}'s library · Chorus` };
}

/** The music diary: everything this listener has logged, newest first,
 *  grouped by the month they listened. */
export default async function LibraryPage({ params }: Props) {
  const profile = await getProfileByUsername((await params).username);
  if (!profile) notFound();

  const entries = await getUserEntries(profile.id, 200);

  const months = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = e.listened_on.slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(e);
  }

  return (
    <div className="space-y-10">
      <header>
        <Link
          href={`/u/${profile.username}`}
          className="text-sm text-muted-foreground hover:text-white"
        >
          ← {profile.display_name || profile.username}
        </Link>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Library</h1>
        <p className="text-muted-foreground">
          {entries.length} {entries.length === 1 ? "album" : "albums"} logged
        </p>
      </header>

      {entries.length === 0 && (
        <p className="text-muted-foreground">Nothing logged yet.</p>
      )}

      {[...months.entries()].map(([month, items]) => (
        <section key={month}>
          <h2 className="mb-4 text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            {new Date(`${month}-01`).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {items.map((e) => (
              <AlbumCard
                key={e.id}
                id={e.album_id}
                title={e.album_name}
                subtitle={e.artist_name}
                image={e.image_url}
                rating={e.rating}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
