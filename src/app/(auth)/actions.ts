"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // 1. Extract data from the form
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // 2. Attempt to sign in with Supabase
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // If error, redirect back to login with an error query param
    redirect("/login?error=Could not authenticate user");
  }

  // 3. If successful, clear cache and redirect to dashboard
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // 1. Extract data from the form
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // 2. Create the user in Supabase
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/signup?error=Could not create user");
  }

  // 3. If successful, clear cache and redirect to dashboard
  // Note: If you have "Confirm Email" enabled in Supabase,
  // you might want to redirect to a "Check your email" page instead.
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
