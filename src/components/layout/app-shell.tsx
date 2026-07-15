"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderKanban, ListTodo, Menu, Moon, Settings, Sun, User, Users, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";
import type { TeamFlowData } from "@/types";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "My Tasks", icon: ListTodo },
  { href: "/team", label: "Team", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ data, children }: { data: TeamFlowData; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  }

  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r bg-card md:block",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} data={data} />
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 md:hidden">
          <aside className="h-full w-72 border-r bg-card">
            <div className="flex justify-end p-3">
              <Button aria-label="Close navigation" variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <SidebarContent collapsed={false} data={data} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}
      <div className={cn("min-h-screen", collapsed ? "md:pl-20" : "md:pl-64")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/92 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <Button aria-label="Open navigation" variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <Button aria-label="Collapse sidebar" variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setCollapsed((value) => !value)}>
              <Menu className="size-5" />
            </Button>
            {data.demoMode ? (
              <span className="rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning">Demo mode</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button aria-label="Toggle theme" variant="ghost" size="icon" onClick={toggleTheme}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit">Log out</Button>
            </form>
            <Avatar name={data.currentUser.name} src={data.currentUser.avatarUrl} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  collapsed,
  data,
  onNavigate,
}: {
  collapsed: boolean;
  data: TeamFlowData;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">TF</span>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate font-semibold">TeamFlow</p>
            <p className="truncate text-xs text-muted-foreground">{data.workspace.name}</p>
          </div>
        ) : null}
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                active && "bg-accent text-accent-foreground",
                collapsed && "justify-center px-0",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
      {!collapsed ? (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar name={data.currentUser.name} src={data.currentUser.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{data.currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">{data.currentUser.email}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
