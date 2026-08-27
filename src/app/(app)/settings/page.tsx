import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getTopAlbums } from "@/lib/queries";
import { ProfileForm } from "@/components/profile-form";
import { TopAlbumsEditor } from "@/components/top-albums-editor";

export const metadata: Metadata = { title: "Settings · Chorus" };

export default async function SettingsPage() {
  const { profile } = await getSession();
  if (!profile) redirect("/login");

  const top = await getTopAlbums(profile.id);

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <header>
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
        <Link
          href={`/u/${profile.username}`}
          className="text-sm text-muted-foreground hover:text-white"
        >
          View your profile →
        </Link>
      </header>

      <section>
        <h2 className="mb-5 text-lg font-bold">Profile</h2>
        <ProfileForm profile={profile} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Top 5 Albums</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Pick a slot, search, and choose. These show at the top of your profile.
        </p>
        <TopAlbumsEditor initial={top} />
      </section>
    </div>
  );
}
