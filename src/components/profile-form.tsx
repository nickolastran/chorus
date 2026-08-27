"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/lib/actions";
import { Profile } from "@/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res?.error) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <form action={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-bold">
          Username
        </label>
        <Input
          id="username"
          name="username"
          required
          defaultValue={profile.username}
          pattern="[a-zA-Z0-9_]{3,24}"
          title="3-24 characters: letters, numbers, underscore"
          className="h-11 border-white/10 bg-[#121212]"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Your profile lives at /u/{profile.username}
        </p>
      </div>

      <div>
        <label htmlFor="display_name" className="mb-2 block text-sm font-bold">
          Display name
        </label>
        <Input
          id="display_name"
          name="display_name"
          maxLength={60}
          defaultValue={profile.display_name ?? ""}
          className="h-11 border-white/10 bg-[#121212]"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-2 block text-sm font-bold">
          Bio
        </label>
        <Textarea
          id="bio"
          name="bio"
          maxLength={300}
          defaultValue={profile.bio ?? ""}
          placeholder="Tell people what you listen to."
          className="border-white/10 bg-[#121212]"
        />
      </div>

      <div>
        <label htmlFor="avatar_url" className="mb-2 block text-sm font-bold">
          Avatar URL
        </label>
        <Input
          id="avatar_url"
          name="avatar_url"
          type="url"
          defaultValue={profile.avatar_url ?? ""}
          placeholder="https://…"
          className="h-11 border-white/10 bg-[#121212]"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-400">Profile saved.</p>}

      <Button
        type="submit"
        disabled={pending}
        className="rounded-full bg-purple-600 font-bold hover:bg-purple-700"
      >
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
