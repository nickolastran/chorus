import { Music } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#0A0A0A] px-6 pt-16 font-sans text-white">
      <Link href="/" className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
          <Music className="text-black h-6 w-6" />
        </div>
        <span className="text-xl font-black tracking-tighter uppercase">
          Chorus
        </span>
      </Link>

      {/* Single grey box container using canonical spacing max-w-112.5 (450px) */}
      <div className="w-full max-w-112.5 rounded-2xl bg-[#121212] p-10 shadow-2xl md:p-12 border border-white/5">
        {children}
      </div>
    </div>
  );
}
