import Link from "next/link";
import type { Metadata } from "next";
import { searchCatalog } from "@/lib/spotify";
import { getRatingsFor, searchProfiles } from "@/lib/queries";
import { AlbumCard } from "@/components/album-card";
import { Avatar } from "@/components/avatar";

export const metadata: Metadata = { title: "Search · Chorus" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const q = (await searchParams).q?.trim() ?? "";

  if (!q) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-black">Search Chorus</h1>
        <p className="mt-2 text-muted-foreground">
          Find albums, artists, and other listeners.
        </p>
      </div>
    );
  }

  const [catalog, people] = await Promise.all([
    searchCatalog(q),
    searchProfiles(q),
  ]);
  const ratings = await getRatingsFor(catalog.albums.map((a) => a.id));
  const empty =
    catalog.albums.length === 0 &&
    catalog.artists.length === 0 &&
    people.length === 0;

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-black tracking-tight">
        Results for <span className="text-muted-foreground">“{q}”</span>
      </h1>

      {empty && (
        <p className="text-muted-foreground">
          Nothing matched. Try a different spelling.
        </p>
      )}

      {people.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">People</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/u/${p.username}`}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#111] p-3 transition-colors hover:border-white/15"
                >
                  <Avatar url={p.avatar_url} name={p.username} size={40} />
                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {p.display_name || p.username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{p.username}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {catalog.artists.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Artists</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {catalog.artists.map((a) => (
              <Link key={a.id} href={`/artists/${a.id}`} className="group block">
                <Avatar
                  url={a.images?.[0]?.url}
                  name={a.name}
                  size={160}
                  className="mb-3 w-full transition-transform duration-300 group-hover:scale-105"
                />
                <h3 className="truncate text-center text-sm font-bold text-white/90">
                  {a.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {catalog.albums.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Albums</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {catalog.albums.map((a) => (
              <AlbumCard
                key={a.id}
                id={a.id}
                title={a.name}
                subtitle={a.artists[0]?.name}
                image={a.images?.[0]?.url}
                rating={ratings.get(a.id) ?? null}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
