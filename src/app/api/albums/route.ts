import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/spotify";

/** Album typeahead for the Top 5 picker. Read-only catalogue data, so this
 *  needs no auth — but it is capped so it can't be used to bulk-scrape. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ albums: [] });

  const { albums } = await searchCatalog(q);

  return NextResponse.json({
    albums: albums.slice(0, 8).map((a) => ({
      id: a.id,
      name: a.name,
      artist: a.artists[0]?.name ?? "",
      image: a.images?.[0]?.url ?? "",
    })),
  });
}
