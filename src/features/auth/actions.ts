"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

const emailPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const registerSchema = emailPasswordSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export async function loginAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/dashboard");
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { message: error.message };
  }

  redirect("/dashboard");
}

export async function registerAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/dashboard");
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } },
  });

  if (error) {
    return { message: error.message };
  }

  redirect("/dashboard");
}

export async function forgotPasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ email: z.string().email("Enter a valid email address.") }).safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { message: "Demo mode: configure Supabase environment variables to send password reset email." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);
  if (error) {
    return { message: error.message };
  }

  return { message: "If the account exists, a reset link has been sent." };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
