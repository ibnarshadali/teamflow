import { cn } from "@/lib/utils/cn";

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-secondary-foreground",
        className,
      )}
    >
      {src ? <span aria-hidden className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} /> : initials}
    </span>
  );
}
