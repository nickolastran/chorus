"use client";

import Link from "next/link";
import { GENRES, type Genre } from "@/lib/spotify";
import { cn } from "@/lib/utils";

const LABELS: Record<Genre, string> = {
  all: "All",
  pop: "Pop",
  "hip hop": "Hip-Hop",
  rock: "Rock",
  "r&b": "R&B",
  indie: "Indie",
  country: "Country",
  electronic: "Electronic",
  latin: "Latin",
  metal: "Metal",
  jazz: "Jazz",
};

/** Plain links, not state: the genre lives in the URL so a view is linkable
 *  and the server renders it directly. */
export function GenreSelector({ active }: { active: Genre }) {
  return (
    <nav
      aria-label="Filter by genre"
      className="hide-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1"
    >
      {GENRES.map((genre) => (
        <Link
          key={genre}
          href={genre === "all" ? "/dashboard" : `/dashboard?genre=${encodeURIComponent(genre)}`}
          aria-current={genre === active ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors",
            genre === active
              ? "border-white bg-white text-black"
              : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white",
          )}
        >
          {LABELS[genre]}
        </Link>
      ))}
    </nav>
  );
}
