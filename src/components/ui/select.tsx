import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("h-10 w-full rounded-md border bg-card px-3 text-sm disabled:opacity-60", className)}
      {...props}
    >
      {children}
    </select>
  );
}
