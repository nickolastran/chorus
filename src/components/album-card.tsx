import Link from "next/link";
import Image from "next/image";
import { StarRating } from "@/components/star-rating";

export function AlbumCard({
  id,
  title,
  subtitle,
  image,
  rating,
  rank,
  circle = false,
}: {
  id: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  rating?: number | null;
  rank?: number;
  circle?: boolean;
  href?: string;
}) {
  return (
    <Link href={`/albums/${id}`} className="group block w-full">
      <div
        className={`relative mb-3 aspect-square overflow-hidden border border-white/5 bg-[#1A1A1A] transition-all duration-300 group-hover:scale-105 group-hover:border-white/20 ${
          circle ? "rounded-full" : "rounded-xl"
        }`}
      >
        {rank != null && (
          <span className="absolute top-2 left-2 z-10 rounded border border-white/10 bg-black/70 px-2 py-0.5 text-xs font-bold backdrop-blur-md">
            #{rank}
          </span>
        )}
        {image && (
          <Image src={image} alt={title} fill className="object-cover" sizes="180px" />
        )}
      </div>
      <h3 className="truncate text-sm font-bold text-white/90 group-hover:text-white">
        {title}
      </h3>
      {subtitle && (
        <p className="truncate text-xs text-[#A7A7A7]">{subtitle}</p>
      )}
      {rating != null && <StarRating rating={rating} size={12} className="mt-1" />}
    </Link>
  );
}
