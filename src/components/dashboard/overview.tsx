"use client";

import { useRef } from "react";
import Image from "next/image";
import { MusicItem } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface OverviewProps {
  newAlbums: MusicItem[];
  newSongs: MusicItem[];
  topSongs: MusicItem[];
  topAlbums: MusicItem[];
}

export default function DashboardOverview({
  newAlbums,
  newSongs,
  topSongs,
  topAlbums,
}: OverviewProps) {
  return (
    <div className="space-y-12 pb-20">
      <HorizontalSection title="New Album Releases" items={newAlbums} />
      <HorizontalSection title="New Song Releases" items={newSongs} isCircle />
      <HorizontalSection title="Top 50 Albums" items={topAlbums} showRank />
      <HorizontalSection
        title="Top 50 Songs"
        items={topSongs}
        showRank
        isCircle
      />
    </div>
  );
}

// --- Reusable Horizontal Scrolling Section ---
function HorizontalSection({
  title,
  items,
  showRank = false,
  isCircle = false,
}: {
  title: string;
  items: MusicItem[];
  showRank?: boolean;
  isCircle?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  // Scroll handler
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Scroll amount is roughly 70% of the screen width for a good "page turn" feel
      const scrollAmount = current.clientWidth * 0.7;

      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative group">
      <h2 className="text-2xl font-bold mb-4 text-white tracking-tight px-1">
        {title}
      </h2>

      {/* Left Navigation Arrow */}
      <ScrollButton direction="left" onClick={() => scroll("left")} />

      {/* Right Navigation Arrow */}
      <ScrollButton direction="right" onClick={() => scroll("right")} />

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 px-1 scroll-smooth"
      >
        {items.map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="flex-none w-35 group/item cursor-pointer"
          >
            <div
              className={`
              relative aspect-square bg-[#1A1A1A] mb-3 overflow-hidden border border-white/5
              transition-all duration-300 group-hover/item:scale-105 group-hover/item:border-white/20
              ${isCircle ? "rounded-full" : "rounded-xl"}
            `}
            >
              {showRank && item.rank && (
                <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold text-white border border-white/10">
                  #{item.rank}
                </div>
              )}

              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              )}
            </div>

            <h3 className="font-bold text-sm truncate text-white/90 group-hover/item:text-white">
              {item.title}
            </h3>
            <p className="text-xs text-[#A7A7A7] truncate">{item.artist}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- Navigation Button Component ---
function ScrollButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.8)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        absolute top-1/2 -translate-y-1/2 z-20
        bg-black/50 text-white p-2 rounded-full border border-white/10 backdrop-blur-md
        opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex
        ${direction === "left" ? "-left-4" : "-right-4"}
      `}
      aria-label={`Scroll ${direction}`}
    >
      {direction === "left" ? (
        <ChevronLeft className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
    </motion.button>
  );
}
