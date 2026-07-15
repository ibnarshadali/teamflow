import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input type="password" autoComplete="current-password" {...props} />;
}

export function SearchInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("pl-9", className)} type="search" {...props} />
    </div>
  );
}
