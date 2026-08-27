// components/landing-page/socialproof.tsx

const PARTNERS = [
  "SPOTIFY",
  "APPLE MUSIC",
  "TIDAL",
  "DEEZER",
  "SONOS",
  "LAST.FM",
  "PITCHFORK",
  "BANDCAMP",
];

// Adding "default" here fixes the "Module has no default export" error
export default function SocialProof() {
  return (
    <section className="py-24 border-t border-white/5 bg-[#080808]">
      <p className="text-center text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase mb-16 px-6">
        Supported Platforms &amp; Integrations
      </p>

      {/* Edges fade out so items enter/exit instead of popping */}
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        {/* List is duplicated so translating -50% loops seamlessly.
            Spacing lives in px-8 on each item (not gap) to keep both halves identical. */}
        <div className="flex w-max animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
          {[...PARTNERS, ...PARTNERS].map((partner, i) => (
            <span
              key={i}
              aria-hidden={i >= PARTNERS.length}
              className="shrink-0 px-8 text-lg font-black tracking-tighter text-white/40 transition-colors hover:text-white"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
