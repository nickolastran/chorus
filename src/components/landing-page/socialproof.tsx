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
      <div className="container mx-auto px-6">
        <p className="text-center text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase mb-16">
          Supported Platforms & Integrations
        </p>
        <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 opacity-30 grayscale hover:grayscale-0 transition-all">
          {PARTNERS.map((partner) => (
            <span
              key={partner}
              className="text-lg font-black tracking-tighter text-white"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
