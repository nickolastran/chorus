"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FcGoogle } from "react-icons/fc";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get data from the form
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Log in with Supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // 2. CRITICAL STEP: Refresh the router to update server cookies
      router.refresh();

      // 3. Redirect to Dashboard
      router.push("/dashboard");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8 tracking-tight">
        Log in to Chorus
      </h1>

      <Button
        variant="outline"
        className="w-full border-[#727272] hover:border-white bg-transparent h-12 rounded-full font-bold flex gap-3 mb-8 transition-all"
      >
        <FcGoogle className="w-5 h-5" />
        Continue with Google
      </Button>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#292929]"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#121212] px-2 text-[#A7A7A7] font-bold">or</span>
        </div>
      </div>

      {/* Show Error Message if login fails */}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* Changed form action to onSubmit */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold ml-1">Email address</label>
          <Input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="bg-[#121212] border-[#727272] h-12 focus:border-white rounded-md transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold ml-1">Password</label>
          <PasswordInput name="password" required placeholder="Password" />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-full text-base mt-4 transition-transform active:scale-95 shadow-lg shadow-purple-900/20 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-[#292929] pt-8">
        <p className="text-[#A7A7A7]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-white font-bold hover:underline underline-offset-4"
          >
            Sign up for Chorus
          </Link>
        </p>
      </div>
    </>
  );
}
