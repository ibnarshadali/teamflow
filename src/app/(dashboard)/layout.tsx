import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserData } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase!.auth.getUser();
    if (!user) {
      redirect("/login");
    }
  }

  const data = await getCurrentUserData();

  return <AppShell data={data}>{children}</AppShell>;
}
