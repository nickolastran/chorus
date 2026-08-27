"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/avatar";
import { addComment, deleteComment } from "@/lib/actions";
import { Comment } from "@/types";

export function CommentSection({
  entryId,
  comments,
  currentUserId,
}: {
  entryId: string;
  comments: Comment[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await addComment(entryId, formData);
      if (res?.error) setError(res.error);
      else {
        formRef.current?.reset();
        router.refresh();
      }
    });
  };

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-bold">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      {currentUserId ? (
        <form ref={formRef} action={onSubmit} className="space-y-3">
          <Textarea
            name="body"
            required
            maxLength={2000}
            placeholder="Add a comment…"
            className="bg-[#121212] border-white/10 focus:border-white/30"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={pending} className="rounded-full font-bold">
            {pending ? "Posting…" : "Post comment"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="font-bold text-white hover:underline">
            Log in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <ul className="space-y-5">
        {comments.map((c) => {
          const handle = c.profiles?.username ?? "unknown";
          return (
            <li key={c.id} className="flex gap-3">
              <Avatar url={c.profiles?.avatar_url} name={handle} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/u/${handle}`}
                    className="text-sm font-bold hover:underline"
                  >
                    {c.profiles?.display_name || handle}
                  </Link>
                  <time className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </time>
                  {currentUserId === c.user_id && (
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          await deleteComment(c.id, entryId);
                          router.refresh();
                        })
                      }
                      className="ml-auto text-xs text-muted-foreground hover:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap text-white/80">
                  {c.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
