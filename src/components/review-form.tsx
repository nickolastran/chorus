"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarInput } from "@/components/star-rating";
import { saveEntry, deleteEntry } from "@/lib/actions";
import { Entry, SpotifyAlbum } from "@/types";

/** Log / rate / review are one form, because they are one row. */
export function ReviewForm({
  album,
  entry,
}: {
  album: SpotifyAlbum;
  entry: Entry | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveEntry(formData);
      if (res?.error) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <form action={onSubmit} className="space-y-5">
      {/* Denormalised onto the entry so feeds never re-hit Spotify. */}
      <input type="hidden" name="album_id" value={album.id} />
      <input type="hidden" name="album_name" value={album.name} />
      <input type="hidden" name="artist_name" value={album.artists[0]?.name ?? ""} />
      <input type="hidden" name="artist_id" value={album.artists[0]?.id ?? ""} />
      <input type="hidden" name="image_url" value={album.images?.[0]?.url ?? ""} />
      <input type="hidden" name="release_date" value={album.release_date ?? ""} />

      <div>
        <label className="mb-2 block text-sm font-bold">Your rating</label>
        <StarInput defaultValue={entry?.rating ?? null} />
      </div>

      <div>
        <label htmlFor="listened_on" className="mb-2 block text-sm font-bold">
          Listened on
        </label>
        <input
          id="listened_on"
          type="date"
          name="listened_on"
          defaultValue={entry?.listened_on ?? new Date().toISOString().slice(0, 10)}
          className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm [color-scheme:dark]"
        />
      </div>

      <div>
        <label htmlFor="body" className="mb-2 block text-sm font-bold">
          Review <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="body"
          name="body"
          maxLength={5000}
          rows={6}
          defaultValue={entry?.body ?? ""}
          placeholder="What did you make of it?"
          className="bg-[#121212] border-white/10 focus:border-white/30"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-emerald-400">Saved to your diary.</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-full bg-purple-600 font-bold hover:bg-purple-700"
        >
          {pending ? "Saving…" : entry ? "Update entry" : "Save to diary"}
        </Button>

        {entry && (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            className="text-muted-foreground hover:text-red-400"
            onClick={() =>
              startTransition(async () => {
                await deleteEntry(entry.id, album.id);
                router.refresh();
              })
            }
          >
            Remove
          </Button>
        )}
      </div>
    </form>
  );
}
