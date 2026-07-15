import { Card } from "@/components/ui/card";

export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </Card>
  );
}
