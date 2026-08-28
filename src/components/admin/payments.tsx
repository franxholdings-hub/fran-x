import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Empty, Loading, PanelSection, toneForStatus } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/ai-integration";

type Row = {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  paystack_reference: string | null;
  payment_status: string;
  verification_status: string;
  verification_source: string | null;
  paid_at: string | null;
  created_at: string;
  service_product: string | null;
  plan: { name: string } | null;
};

export function Payments() {
  const [status, setStatus] = useState("all");

  const config = useQuery({
    queryKey: ["paystack-config"],
    queryFn: async () => {
      const r = await fetch("/api/paystack/status");
      return (await r.json()) as { configured: boolean };
    },
  });

  const rows = useQuery({
    queryKey: ["admin-payments", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, plan:ai_packages(name)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  const filtered = (rows.data ?? []).filter((p) => status === "all" || p.payment_status === status);

  return (
    <div className="space-y-6">
      <PanelSection
        title="Paystack"
        description="Server-side integration. The secret key is never exposed to the browser, public API responses or widgets."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className={config.data?.configured ? "border-emerald-500/40 text-emerald-600" : "border-destructive/40 text-destructive"}>
            {config.data?.configured ? "Secret key configured" : "Secret key NOT configured"}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Webhook URL: <code className="rounded bg-surface/60 px-1.5 py-0.5">/api/paystack/webhook</code> — add it in your
            Paystack dashboard → Settings → Webhooks. Signatures are verified with your secret key (no separate webhook secret).
          </p>
        </div>
      </PanelSection>

      <PanelSection
        title="Payments"
        description="Every payment is verified server-side with Paystack before it is marked successful. Verified payments flow into Revenue History."
        action={
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All statuses</option>
            {["pending", "successful", "failed", "abandoned", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        }
      >
        {rows.isLoading ? (
          <Loading />
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Reference</th>
                  <th className="py-2 pr-3">Plan / product</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Verified</th>
                  <th className="py-2 pr-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2 pr-3 whitespace-nowrap text-xs">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{p.paystack_reference ?? p.transaction_id}</td>
                    <td className="py-2 pr-3">{p.plan?.name ?? p.service_product ?? "—"}</td>
                    <td className="py-2 pr-3 text-right font-medium">{formatMoney(Number(p.amount), p.currency)}</td>
                    <td className="py-2 pr-3"><Badge variant="outline" className={toneForStatus(p.payment_status)}>{p.payment_status}</Badge></td>
                    <td className="py-2 pr-3">
                      <Badge variant="outline" className={p.verification_status === "verified" ? "border-emerald-500/40 text-emerald-600" : "border-muted-foreground/40 text-muted-foreground"}>
                        {p.verification_status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-xs">{p.verification_source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No payments recorded yet.</Empty>
        )}
      </PanelSection>
    </div>
  );
}
