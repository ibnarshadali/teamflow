"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
