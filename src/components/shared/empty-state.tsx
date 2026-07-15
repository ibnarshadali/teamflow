import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
      <Inbox className="size-9 text-muted-foreground" />
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
