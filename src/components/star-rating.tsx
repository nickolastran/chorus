"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only stars. A grey row sits under a gold row that is clipped to the
 *  rating's width, which renders halves exactly without half-star glyphs. */
export function StarRating({
  rating,
  size = 16,
  className,
}: {
  rating: number | null | undefined;
  size?: number;
  className?: string;
}) {
  if (rating == null) return null;
  const pct = (Math.max(0, Math.min(5, rating)) / 5) * 100;

  return (
    <span
      className={cn("relative inline-block leading-none", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={size} className="text-white/15" fill="currentColor" />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={size}
            className="shrink-0 text-accent-yellow"
            fill="currentColor"
          />
        ))}
      </span>
    </span>
  );
}

/** Interactive half-star picker. Each star carries two hit targets so the
 *  left half sets x.5 and the right half sets x.0 — the Letterboxd gesture. */
export function StarInput({
  name = "rating",
  defaultValue = null,
  size = 28,
}: {
  name?: string;
  defaultValue?: number | null;
  size?: number;
}) {
  const [value, setValue] = useState<number | null>(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={value ?? ""} />

      <div className="relative flex" onMouseLeave={() => setHover(null)}>
        <StarRating rating={shown} size={size} />
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }, (_, i) => {
            const step = (i + 1) / 2;
            return (
              <button
                key={step}
                type="button"
                className="h-full w-[10%] cursor-pointer"
                onMouseEnter={() => setHover(step)}
                onClick={() => setValue(step === value ? null : step)}
                aria-label={`${step} star${step === 1 ? "" : "s"}`}
              />
            );
          })}
        </div>
      </div>

      <span className="text-sm text-muted-foreground tabular-nums">
        {shown ? `${shown.toFixed(1)}` : "Not rated"}
      </span>
      {value != null && (
        <button
          type="button"
          onClick={() => setValue(null)}
          className="text-xs text-muted-foreground hover:text-white underline underline-offset-2"
        >
          clear
        </button>
      )}
    </div>
  );
}
