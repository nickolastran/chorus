// src/lib/ticketmaster.ts
//
// Upcoming shows via the Ticketmaster Discovery API. The key is optional:
// without TICKETMASTER_API_KEY the app renders an empty state rather than
// failing, so the rest of the platform works before you have one.

import { Concert } from "@/types";

export const hasTicketmasterKey = () =>
  Boolean(process.env.TICKETMASTER_API_KEY);

interface TmEvent {
  id: string;
  name: string;
  url: string;
  dates?: { start?: { localDate?: string } };
  images?: { url: string; width: number }[];
  _embedded?: {
    venues?: { name?: string; city?: { name?: string } }[];
  };
}

export async function getConcerts(
  keyword?: string,
  city?: string,
): Promise<Concert[]> {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    apikey: key,
    classificationName: "music",
    sort: "date,asc",
    size: "40",
  });
  if (keyword) params.set("keyword", keyword);
  if (city) params.set("city", city);

  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    console.error(`Ticketmaster search failed: ${response.status}`);
    return [];
  }

  const data = await response.json();
  const events: TmEvent[] = data?._embedded?.events ?? [];

  return events.map((e) => {
    const venue = e._embedded?.venues?.[0];
    // Widest image wins; Ticketmaster returns a dozen crops per event.
    const image = [...(e.images ?? [])].sort((a, b) => b.width - a.width)[0];
    return {
      id: e.id,
      name: e.name,
      url: e.url,
      date: e.dates?.start?.localDate ?? null,
      venue: venue?.name ?? null,
      city: venue?.city?.name ?? null,
      image: image?.url,
    };
  });
}
