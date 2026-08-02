import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number;
  className?: string;
};

/** Compact KPI tile for HR overview / statistics. */
export function MetricCard({ label, value, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}
