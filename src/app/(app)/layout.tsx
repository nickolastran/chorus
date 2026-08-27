import { SiteNav } from "@/components/site-nav";
import { getSession } from "@/lib/session";

/** Shared shell for the whole product. Deliberately does NOT gate on auth:
 *  album, artist, review and profile pages must stay readable when signed
 *  out, or "shareable link" means nothing. Middleware gates the private
 *  routes (/feed, /settings). */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getSession();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <SiteNav profile={profile} />
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
