"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function LikeButton({
  entryId,
  count,
  liked,
  signedIn,
}: {
  entryId: string;
  count: number;
  liked: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Flip locally first; the server action revalidates and corrects if it loses.
  const [state, setState] = useState({ liked, count });

  const onClick = () => {
    if (!signedIn) return router.push("/login");
    setState((s) => ({ liked: !s.liked, count: s.count + (s.liked ? -1 : 1) }));
    startTransition(async () => {
      const res = await toggleLike(entryId);
      if (typeof res?.liked === "boolean") {
        const liked = res.liked;
        setState((s) => ({ ...s, liked }));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={state.liked}
      aria-label={state.liked ? "Unlike" : "Like"}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm transition-colors disabled:opacity-60",
        state.liked ? "text-rose-400" : "text-muted-foreground hover:text-white",
      )}
    >
      <Heart className="h-4 w-4" fill={state.liked ? "currentColor" : "none"} />
      <span className="tabular-nums">{state.count}</span>
    </button>
  );
}
