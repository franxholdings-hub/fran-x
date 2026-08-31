// Admin: Digital Store Analytics — revenue dashboard with date filtering.

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { StatCard, PanelSection, Empty, Loading } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/ai-integration";

const RANGES = [
  { key: "today", label: "Today", days: 0 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "3m", label: "3 months", days: 90 },
  { key: "12m", label: "12 months", days: 365 },
] as const;

export function DigitalAnalytics() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[2]);

  const since = useMemo(() => {
    if (range.days === 0) {
      const d = new Date(); d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    return new Date(Date.now() - range.days * 864e5).toISOString();
  }, [range]);

  // Digital store payments (related_type one_time or subscription with digital metadata)
  const payments = useQuery({
    queryKey: ["digital-analytics", since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .in("related_type", ["one_time", "subscription"])
        .eq("verification_status", "verified")
        .gte("paid_at", since)
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = payments.data ?? [];
  const totalRevenue = rows.reduce((s, p: any) => s + Number(p.amount ?? 0), 0);
  const orderCount = rows.length;
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Categorize by notes/metadata (best-effort)
  const productRevenue = rows
    .filter((p: any) => p.related_type === "one_time")
    .reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);
  const subscriptionRevenue = rows
    .filter((p: any) => p.related_type === "subscription")
    .reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);

  // Best sellers (by service_product name frequency)
  const tally = new Map<string, { count: number; revenue: number }>();
  for (const p of rows as any[]) {
    const name = (p.service_product ?? "Unknown").split(" + ")[0];
    const e = tally.get(name) ?? { count: 0, revenue: 0 };
    e.count += 1; e.revenue += Number(p.amount ?? 0);
    tally.set(name, e);
  }
  const bestSellers = Array.from(tally.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              range.key === r.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total digital revenue" value={formatMoney(totalRevenue)} hint={`${range.label}`} />
        <StatCard label="Orders" value={orderCount} />
        <StatCard label="Avg. order value" value={formatMoney(avgOrder)} />
        <StatCard label="Subscription revenue" value={formatMoney(subscriptionRevenue)} />
        <StatCard label="Product revenue" value={formatMoney(productRevenue)} />
      </div>

      <PanelSection title="Best-selling products" description="Top digital products and subscriptions by revenue in this period.">
        {payments.isLoading ? (
          <Loading />
        ) : bestSellers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Product / Plan</th>
                  <th className="py-2 pr-3 text-right">Orders</th>
                  <th className="py-2 pr-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map(([name, stats]) => (
                  <tr key={name} className="border-b border-border/60">
                    <td className="py-2 pr-3 font-medium">{name}</td>
                    <td className="py-2 pr-3 text-right">{stats.count}</td>
                    <td className="py-2 pr-3 text-right">{formatMoney(stats.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No digital store sales in this period yet.</Empty>
        )}
      </PanelSection>

      <PanelSection title="Recent transactions" description="Latest verified digital store payments.">
        {rows.length ? (
          <div className="space-y-2">
            {(rows as any[]).slice(0, 12).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/40 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.service_product ?? "—"}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{p.transaction_id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">{p.related_type ?? "—"}</Badge>
                  <span className="font-display text-sm font-semibold">{formatMoney(Number(p.amount))}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty>No transactions yet.</Empty>
        )}
      </PanelSection>
    </div>
  );
}
