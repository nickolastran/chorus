import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FcGoogle } from "react-icons/fc";
import { login } from "../actions";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8 tracking-tight">
        Log in to Chorus
      </h1>

      {/* Google Button (Standard Reference Size: h-12) */}
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

      <form action={login} className="space-y-4">
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

        {/* Primary Button: Changed to h-12 to match Google button */}
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-full text-base mt-4 transition-transform active:scale-95 shadow-lg shadow-purple-900/20">
          Log In
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
