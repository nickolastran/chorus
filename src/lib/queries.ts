import { createClient } from "@/utils/supabase/server";
import { AlbumStats, Comment, EntryDetail, Profile, TopAlbum } from "@/types";

const DETAIL = "*";

/** Which of these entries the viewer has already liked. One query instead of
 *  one per card; returns an empty set for signed-out viewers. */
export async function getLikedIds(
  userId: string | null,
  entryIds: string[],
): Promise<Set<string>> {
  if (!userId || entryIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("likes")
    .select("entry_id")
    .eq("user_id", userId)
    .in("entry_id", entryIds);
  return new Set((data ?? []).map((l) => l.entry_id as string));
}

export async function getGlobalFeed(limit = 30): Promise<EntryDetail[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entry_details")
    .select(DETAIL)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as EntryDetail[]) ?? [];
}

/** Entries from people the viewer follows. Two round-trips rather than a
 *  join, because PostgREST can't express "in (subquery)" directly. */
export async function getFollowingFeed(
  userId: string,
  limit = 30,
): Promise<EntryDetail[]> {
  const supabase = await createClient();
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const ids = (follows ?? []).map((f) => f.following_id as string);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("entry_details")
    .select(DETAIL)
    .in("user_id", ids)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as EntryDetail[]) ?? [];
}

export async function getAlbumEntries(albumId: string): Promise<EntryDetail[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entry_details")
    .select(DETAIL)
    .eq("album_id", albumId)
    .order("created_at", { ascending: false });
  return (data as EntryDetail[]) ?? [];
}

export async function getAlbumStats(albumId: string): Promise<AlbumStats | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("album_stats")
    .select("*")
    .eq("album_id", albumId)
    .maybeSingle();
  return (data as AlbumStats) ?? null;
}

/** Average rating for many albums at once, for grids. */
export async function getRatingsFor(
  albumIds: string[],
): Promise<Map<string, number>> {
  if (albumIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("album_stats")
    .select("album_id, avg_rating")
    .in("album_id", albumIds);
  return new Map(
    (data ?? [])
      .filter((r) => r.avg_rating != null)
      .map((r) => [r.album_id as string, Number(r.avg_rating)]),
  );
}

export async function getEntryDetail(id: string): Promise<EntryDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entry_details")
    .select(DETAIL)
    .eq("id", id)
    .maybeSingle();
  return (data as EntryDetail) ?? null;
}

export async function getComments(entryId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("*, profiles(username, display_name, avatar_url)")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });
  return (data as Comment[]) ?? [];
}

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function getUserEntries(
  userId: string,
  limit = 60,
): Promise<EntryDetail[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entry_details")
    .select(DETAIL)
    .eq("user_id", userId)
    .order("listened_on", { ascending: false })
    .limit(limit);
  return (data as EntryDetail[]) ?? [];
}

export async function getTopAlbums(userId: string): Promise<TopAlbum[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("top_albums")
    .select("*")
    .eq("user_id", userId)
    .order("position");
  return (data as TopAlbum[]) ?? [];
}

export async function getFollowCounts(userId: string) {
  const supabase = await createClient();
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

export async function isFollowing(
  viewerId: string | null,
  targetId: string,
): Promise<boolean> {
  if (!viewerId || viewerId === targetId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", viewerId)
    .eq("following_id", targetId)
    .maybeSingle();
  return Boolean(data);
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  // `.or()` takes a raw PostgREST filter string, so anything the user types
  // is grammar unless it is stripped: a comma would add a disjunct, parens
  // would nest one, and %/* are wildcards. Usernames are [a-z0-9_] anyway.
  const q = query.trim().replace(/[^a-zA-Z0-9_ ]/g, "");
  if (!q) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(20);
  return (data as Profile[]) ?? [];
}

/** The viewer's own entry for an album, so the form opens pre-filled. */
export async function getMyEntry(userId: string | null, albumId: string) {
  if (!userId) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", userId)
    .eq("album_id", albumId)
    .maybeSingle();
  return data ?? null;
}
