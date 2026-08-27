import Image from "next/image";
import type { Metadata } from "next";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { getConcerts, hasTicketmasterKey } from "@/lib/ticketmaster";

export const metadata: Metadata = { title: "Concerts · Chorus" };

type Props = { searchParams: Promise<{ q?: string; city?: string }> };

export default async function ConcertsPage({ searchParams }: Props) {
  const { q, city } = await searchParams;
  const configured = hasTicketmasterKey();
  const concerts = configured ? await getConcerts(q, city) : [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight">Upcoming Concerts</h1>
        <p className="text-muted-foreground">Live shows, via Ticketmaster.</p>
      </header>

      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Artist or event"
          aria-label="Artist or event"
          className="h-11 flex-1 rounded-full border border-white/10 bg-[#121212] px-4 text-sm outline-none focus:border-white/30"
        />
        <input
          name="city"
          defaultValue={city}
          placeholder="City"
          aria-label="City"
          className="h-11 w-40 rounded-full border border-white/10 bg-[#121212] px-4 text-sm outline-none focus:border-white/30"
        />
        <button
          type="submit"
          className="h-11 rounded-full bg-white px-6 text-sm font-bold text-black hover:bg-white/90"
        >
          Search
        </button>
      </form>

      {!configured ? (
        <div className="rounded-xl border border-dashed border-white/15 p-10 text-center">
          <Ticket className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-bold">Ticketmaster isn&apos;t connected yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add <code className="text-white">TICKETMASTER_API_KEY</code> to{" "}
            <code className="text-white">.env.local</code> and restart the dev
            server. Get a key at developer.ticketmaster.com.
          </p>
        </div>
      ) : concerts.length === 0 ? (
        <p className="text-muted-foreground">
          No upcoming shows matched that search.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {concerts.map((c) => (
            <li key={c.id}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-white/5 bg-[#111] transition-colors hover:border-white/20"
              >
                <div className="relative aspect-video bg-[#1A1A1A]">
                  {c.image && (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="truncate font-bold">{c.name}</h2>
                  {c.date && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(c.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {(c.venue || c.city) && (
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {[c.venue, c.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
