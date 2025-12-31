import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { signOut } from "@/app/dashboard/actions"; // Import the action

export default function DashboardNav({ user }: { user: User }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#121212] backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
        {/* Left Side */}
        <div className="flex items-center gap-8">
          <span className="font-bold tracking-tighter text-white">CHORUS</span>
          <span className="text-sm text-muted-foreground hidden md:block">
            Upcoming Events
          </span>
        </div>

        {/* Center Search */}
        <div className="relative w-full max-w-xl hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="bg-white/5 pl-10 border-none text-white placeholder:text-muted-foreground"
            placeholder="Search albums, artists, or users..."
          />
        </div>

        {/* Right Side (User Profile) */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-xs text-[#A7A7A7] hidden sm:block">
            {user.email}
          </span>

          {/* Sign Out Button Form */}
          <form action={signOut}>
            <Button
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-white hover:bg-white/10"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
