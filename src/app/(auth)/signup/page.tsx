import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FcGoogle } from "react-icons/fc";
import { signup } from "../actions";

export default function SignupPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8 tracking-tight">
        Sign up to Chorus
      </h1>

      <form action={signup} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold ml-1">
            What&apos;s your email?
          </label>
          <Input
            name="email"
            type="email"
            required
            placeholder="name@domain.com"
            className="bg-[#121212] border-[#727272] h-12 rounded-md focus:border-white transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold ml-1">Create a password</label>
          <PasswordInput name="password" required placeholder="Password" />
        </div>

        {/* Primary Button: Changed to h-12 to match Google button */}
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-full text-base shadow-lg shadow-purple-900/20 transition-transform active:scale-95">
          Sign up
        </Button>
      </form>

      <div className="relative my-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#292929]"></span>
        </div>
        <span className="relative bg-[#121212] px-4 text-sm font-bold">or</span>
      </div>

      {/* Google Button (Standard Reference Size: h-12) */}
      <Button
        variant="outline"
        className="w-full border-[#727272] hover:border-white bg-transparent h-12 rounded-full font-bold flex gap-3 transition-all"
      >
        <FcGoogle className="w-5 h-5" />
        Sign up with Google
      </Button>

      <div className="mt-12 pt-8 border-t border-[#292929] text-center">
        <p className="text-[#A7A7A7]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white font-bold hover:underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}
