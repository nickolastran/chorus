import { cn } from "@/lib/utils";

/** Falls back to an initial when a profile has no picture, which is the
 *  common case since Chorus has no upload flow yet.
 *
 *  Deliberately a plain <img>: avatar_url is an arbitrary user-supplied URL,
 *  and routing those through next/image would point the optimizer at any host
 *  a user names. At avatar sizes there is nothing to optimise anyway. */
export function Avatar({
  url,
  name,
  size = 40,
  className,
}: {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 font-bold text-white/70 uppercase",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        name.charAt(0)
      )}
    </span>
  );
}
