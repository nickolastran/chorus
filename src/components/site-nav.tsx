import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { SignOutButton } from "@/components/sign-out-button";
import { Profile } from "@/types";

/** Search is a plain GET form, so it works before hydration and the query
 *  stays in the URL — which is what makes results shareable. */
export function SiteNav({
  profile,
  query,
}: {
  profile: Profile | null;
  query?: string;
}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center gap-4 px-6">
        <Link
          href={profile ? "/dashboard" : "/"}
          className="shrink-0 text-xl font-black tracking-tighter"
        >
          CHORUS
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/feed">Feed</NavLink>
          <NavLink href="/dashboard">Discover</NavLink>
          <NavLink href="/concerts">Concerts</NavLink>
        </div>

        <form action="/search" className="mx-auto w-full max-w-md flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#A7A7A7]" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search albums, artists, people…"
              aria-label="Search"
              className="h-10 w-full rounded-full border border-transparent bg-[#121212] pl-10 pr-3 text-sm transition-all outline-none placeholder:text-[#555] focus:border-white/20"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          {profile ? (
            <>
              <Link
                href={`/u/${profile.username}`}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/5"
              >
                <Avatar url={profile.avatar_url} name={profile.username} size={28} />
                <span className="hidden text-sm font-bold lg:block">
                  {profile.display_name || profile.username}
                </span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="rounded-full bg-white font-bold text-black hover:bg-white/90"
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-white"
    >
      {children}
    </Link>
  );
}
