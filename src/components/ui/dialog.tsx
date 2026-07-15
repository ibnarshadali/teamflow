"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/45 p-0 sm:items-center sm:justify-center sm:p-6" role="presentation">
      <section
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        aria-modal="true"
        role="dialog"
        className={cn("max-h-[92vh] w-full overflow-auto rounded-t-md border bg-card shadow-xl sm:max-w-2xl sm:rounded-md", className)}
      >
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h2 id="dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p id="dialog-description" className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button aria-label="Close dialog" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
