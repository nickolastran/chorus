"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { removeTopAlbum, setTopAlbum } from "@/lib/actions";
import { TopAlbum } from "@/types";

interface Hit {
  id: string;
  name: string;
  artist: string;
  image: string;
}

/** Pick a slot, search, click a result. Debounced by hand rather than pulling
 *  in a query library for one input. */
export function TopAlbumsEditor({ initial }: { initial: TopAlbum[] }) {
  const router = useRouter();
  const [slot, setSlot] = useState<number | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);
  const [, startTransition] = useTransition();

  const byPosition = new Map(initial.map((a) => [a.position, a]));

  // A ref, not a local: a plain `let` is re-created every render, so the
  // previous timeout would never actually be cleared.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onSearch = (value: string) => {
    clearTimeout(timer.current);
    if (value.trim().length < 2) return setHits([]);
    setSearching(true);
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/albums?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setHits(data.albums ?? []);
      setSearching(false);
    }, 300);
  };

  const choose = (hit: Hit) => {
    if (slot == null) return;
    const form = new FormData();
    form.set("album_id", hit.id);
    form.set("album_name", hit.name);
    form.set("artist_name", hit.artist);
    form.set("image_url", hit.image);
    startTransition(async () => {
      await setTopAlbum(slot, form);
      setSlot(null);
      setHits([]);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((position) => {
          const album = byPosition.get(position);
          return (
            <div key={position} className="relative">
              <button
                type="button"
                onClick={() => setSlot(slot === position ? null : position)}
                className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-[#1A1A1A] transition-colors ${
                  slot === position
                    ? "border-purple-500"
                    : "border-white/5 hover:border-white/20"
                }`}
                aria-label={`Set album ${position}`}
              >
                {album?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.image_url}
                    alt={album.album_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-white/20">{position}</span>
                )}
              </button>

              {album && (
                <button
                  type="button"
                  aria-label={`Remove album ${position}`}
                  onClick={() =>
                    startTransition(async () => {
                      await removeTopAlbum(position);
                      router.refresh();
                    })
                  }
                  className="absolute -top-2 -right-2 rounded-full bg-black p-1 text-white/70 ring-1 ring-white/20 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {slot != null && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-[#111] p-4">
          <p className="text-sm font-bold">Search an album for slot {slot}</p>
          <Input
            autoFocus
            placeholder="Album or artist…"
            onChange={(e) => onSearch(e.target.value)}
            className="h-11 border-white/10 bg-[#121212]"
          />
          {searching && <p className="text-xs text-muted-foreground">Searching…</p>}
          <ul className="space-y-1">
            {hits.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  onClick={() => choose(hit)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hit.image}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{hit.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {hit.artist}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
