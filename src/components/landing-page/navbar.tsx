// components/landing-page/navbar.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tighter">
          CHORUS
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-sm font-bold text-muted-foreground hover:text-white"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-6 h-9 text-sm">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
