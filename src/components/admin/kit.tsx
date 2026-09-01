import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="glass-panel rounded-xl p-4 sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{value ?? "—"}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function PanelSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="glass-panel rounded-xl p-3.5 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function toneForStatus(status: string) {
  const s = status.toLowerCase();
  if (["completed", "approved", "operating", "paid", "accepted"].some((k) => s.includes(k)))
    return "border-emerald-500/40 text-emerald-600 dark:text-emerald-400";
  if (["declined", "archived", "overdue", "rejected"].some((k) => s.includes(k)))
    return "border-destructive/40 text-destructive";
  if (["new", "reviewing", "pending", "sent"].some((k) => s.includes(k)))
    return "border-primary/40 text-primary";
  return "border-border text-muted-foreground";
}
