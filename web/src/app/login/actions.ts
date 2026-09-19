"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function loginError(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  const { email, password } = credentials(formData);
  if (!email || !password) loginError("Enter your email and password.");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) loginError(error.message);
  redirect("/");
}

export async function signUp(formData: FormData) {
  const { email, password } = credentials(formData);
  if (!email || password.length < 8) loginError("Use a valid email and a password of at least 8 characters.");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) loginError(error.message);
  if (!data.session) redirect("/login?message=Check your email to confirm the account, then sign in.");
  redirect("/");
}
