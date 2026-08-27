"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <nav className="border-b border-white/10 bg-[#0A0A0A]/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-black tracking-tighter text-white shrink-0"
        >
          CHORUS
        </Link>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7A7A7]" />
            <Input
              placeholder="Search albums, artists, or users..."
              className="bg-[#121212] border-transparent focus:border-white/20 pl-10 text-white rounded-full h-10 transition-all placeholder:text-[#555]"
            />
          </div>
        </div>

        {/* Right: User Email & Sign Out */}
        <div className="flex items-center gap-6 shrink-0">
          <span className="text-sm text-[#A7A7A7] hidden lg:block">
            {user.email}
          </span>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/10"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
