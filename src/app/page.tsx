import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default async function Home() {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();

  redirect(user ? "/dashboard" : "/login");
}
