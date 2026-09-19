"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
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

async function authCallbackUrl(): Promise<string | undefined> {
  const requestHeaders = await headers();
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configuredOrigin) return `${configuredOrigin}/auth/callback`;

  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host")?.trim();
  if (!host) return undefined;

  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}/auth/callback`;
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
  const emailRedirectTo = await authCallbackUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
  });
  if (error) loginError(error.message);
  if (!data.session) redirect("/login?message=Check your email to confirm the account, then sign in.");
  redirect("/");
}

export async function resendConfirmation(formData: FormData) {
  const { email } = credentials(formData);
  if (!email) loginError("Enter your email address first.");
  const supabase = await createClient();
  const emailRedirectTo = await authCallbackUrl();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
  });
  if (error) loginError(error.message);
  redirect("/login?message=Confirmation email sent. Check your inbox and use the newest link.");
}
