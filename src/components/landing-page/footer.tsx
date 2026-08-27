// components/landing-page/footer.tsx
import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080808] py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <span className="text-xl font-black tracking-tighter">CHORUS</span>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Nickolas Tran. All rights reserved.
        </p>

        <Link
          href="https://github.com/nickolastran/chorus"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chorus on GitHub"
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-white"
        >
          <Github className="h-5 w-5" />
          GitHub
        </Link>
      </div>
    </footer>
  );
}
