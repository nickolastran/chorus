"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/** Every mutation below is reachable from the browser, so nothing here trusts
 *  its input: the caller is re-derived from the session and the payload is
 *  re-validated even though the UI also constrains it. */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

const str = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
};

// ----------------------------------------------------------------- entries

export async function saveEntry(formData: FormData) {
  const { supabase, user } = await requireUser();

  const album_id = str(formData, "album_id");
  if (!album_id) return { error: "Missing album." };

  const rawRating = str(formData, "rating");
  let rating: number | null = null;
  if (rawRating) {
    const parsed = Number(rawRating);
    // Half stars only, 0.5 through 5.
    if (!Number.isFinite(parsed) || parsed < 0.5 || parsed > 5 || parsed * 2 !== Math.floor(parsed * 2)) {
      return { error: "Rating must be between 0.5 and 5 stars." };
    }
    rating = parsed;
  }

  const body = str(formData, "body");
  if (body.length > 5000) return { error: "Review is too long (max 5000)." };

  const listened_on = str(formData, "listened_on");
  if (listened_on && !/^\d{4}-\d{2}-\d{2}$/.test(listened_on)) {
    return { error: "Invalid date." };
  }

  const { error } = await supabase.from("entries").upsert(
    {
      user_id: user.id,
      album_id,
      album_name: str(formData, "album_name"),
      artist_name: str(formData, "artist_name"),
      artist_id: str(formData, "artist_id") || null,
      image_url: str(formData, "image_url") || null,
      release_date: str(formData, "release_date") || null,
      rating,
      body: body || null,
      listened_on: listened_on || new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,album_id" },
  );

  if (error) return { error: error.message };

  revalidatePath(`/albums/${album_id}`);
  revalidatePath("/feed");
  return { ok: true };
}

export async function deleteEntry(entryId: string, albumId: string) {
  const { supabase, user } = await requireUser();
  // The user_id filter is belt-and-braces; RLS already scopes this.
  await supabase.from("entries").delete().eq("id", entryId).eq("user_id", user.id);
  revalidatePath(`/albums/${albumId}`);
  revalidatePath("/feed");
}

// ------------------------------------------------------------------ social

export async function toggleLike(entryId: string) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("likes")
    .select("entry_id")
    .eq("entry_id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("entry_id", entryId).eq("user_id", user.id);
  } else {
    await supabase.from("likes").insert({ entry_id: entryId, user_id: user.id });
  }

  revalidatePath(`/reviews/${entryId}`);
  revalidatePath("/feed");
  return { liked: !existing };
}

export async function addComment(entryId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const body = str(formData, "body");
  if (!body) return { error: "Comment can't be empty." };
  if (body.length > 2000) return { error: "Comment is too long (max 2000)." };

  const { error } = await supabase
    .from("comments")
    .insert({ entry_id: entryId, user_id: user.id, body });

  if (error) return { error: error.message };
  revalidatePath(`/reviews/${entryId}`);
  return { ok: true };
}

export async function deleteComment(commentId: string, entryId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);
  revalidatePath(`/reviews/${entryId}`);
}

export async function toggleFollow(targetId: string) {
  const { supabase, user } = await requireUser();
  if (targetId === user.id) return { error: "You can't follow yourself." };

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);
  } else {
    await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetId });
  }

  revalidatePath("/feed");
  return { following: !existing };
}

// ----------------------------------------------------------------- profile

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  const username = str(formData, "username").toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return { error: "Username must be 3-24 characters: letters, numbers, underscore." };
  }

  const display_name = str(formData, "display_name");
  if (display_name.length > 60) return { error: "Display name is too long." };

  const bio = str(formData, "bio");
  if (bio.length > 300) return { error: "Bio is too long (max 300)." };

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: display_name || null,
      bio: bio || null,
      avatar_url: str(formData, "avatar_url") || null,
    })
    .eq("id", user.id);

  if (error) {
    return {
      error: error.code === "23505" ? "That username is taken." : error.message,
    };
  }

  revalidatePath("/settings");
  revalidatePath(`/u/${username}`);
  return { ok: true, username };
}

export async function setTopAlbum(position: number, formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!Number.isInteger(position) || position < 1 || position > 5) {
    return { error: "Position must be 1-5." };
  }

  const album_id = str(formData, "album_id");
  if (!album_id) return { error: "Pick an album." };

  const { error } = await supabase.from("top_albums").upsert(
    {
      user_id: user.id,
      position,
      album_id,
      album_name: str(formData, "album_name"),
      artist_name: str(formData, "artist_name"),
      image_url: str(formData, "image_url") || null,
    },
    { onConflict: "user_id,position" },
  );

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}

export async function removeTopAlbum(position: number) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("top_albums")
    .delete()
    .eq("user_id", user.id)
    .eq("position", position);
  revalidatePath("/settings");
}

// ------------------------------------------------------------------ session

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
