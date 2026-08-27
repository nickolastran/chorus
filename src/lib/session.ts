import { createClient } from "@/utils/supabase/server";
import { Profile } from "@/types";

/** The signed-in user plus their profile row. Returns nulls when signed out,
 *  because most Chorus pages are public and simply render differently. */
export async function getSession(): Promise<{
  userId: string | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, profile: profile ?? null };
}
