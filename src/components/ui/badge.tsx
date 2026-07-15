import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "default" | "success" | "warning" | "danger" | "muted";

const tones: Record<BadgeTone, string> = {
  default: "bg-accent text-accent-foreground",
  success: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  warning: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  muted: "bg-muted text-muted-foreground",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}
