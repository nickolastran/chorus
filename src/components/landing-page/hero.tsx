import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-40 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-purple-500/10 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Your Music Identity, <br />
          <span className="opacity-40 font-medium">Shared in One Place</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The social layer for your music. Sync your Spotify and Apple Music
          libraries to rate albums, comment on tracks, and see what your friends
          are spinning.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <Button
            size="lg"
            className="rounded-full bg-white text-black hover:bg-white/90 px-8 h-14 font-bold text-base"
          >
            Sync Your Library
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-white/10 px-8 h-14 font-bold text-base hover:bg-white/5"
          >
            Browse Trending
          </Button>
        </div>

        <div className="relative mx-auto max-w-200 h-125">
          <div className="relative z-10 mx-auto w-65 h-130 bg-black rounded-[40px] border-[6px] border-[#222] shadow-2xl overflow-hidden">
            <div className="p-4 pt-10">
              <div className="aspect-square bg-linear-to-br from-purple-600 to-blue-600 rounded-xl mb-4 shadow-lg" />
              <div className="space-y-2 text-left">
                <div className="h-4 w-3/4 bg-white/20 rounded" />
                <div className="h-3 w-1/2 bg-white/10 rounded" />
              </div>
              <div className="mt-8 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full bg-white/10" />
                  <div className="h-2 flex-1 bg-white/5 rounded" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <Badge className="w-full justify-center bg-accent-orange text-white border-none py-2 cursor-pointer">
                Rate This Album
              </Badge>
            </div>
          </div>

          {/* Yellow Stat Card */}
          <Card className="absolute top-10 -left-4 md:-left-16 p-5 bg-accent-yellow text-black border-none -rotate-3 animate-float z-20 shadow-xl">
            <p className="text-3xl font-black italic tracking-tighter">4.8/5</p>
            <p className="text-[10px] font-bold uppercase opacity-60">
              Global Rating
            </p>
          </Card>

          {/* Activity Card */}
          <Card className="absolute top-40 -right-4 md:-right-16 p-5 bg-accent-orange text-white border-none rotate-6 animate-float-delayed z-20 shadow-xl">
            <p className="text-xl font-black">Alex & 12 others</p>
            <p className="text-[10px] font-bold uppercase opacity-80">
              are listening now
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
