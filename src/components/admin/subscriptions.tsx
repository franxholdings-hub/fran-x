import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Empty, Loading, PanelSection, toneForStatus } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SUBSCRIPTION_STATUSES } from "@/lib/ai-integration";

type Row = {
  id: string;
  status: string;
  started_at: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  plan: { name: string; code: string } | null;
  user_email?: string;
};

export function Subscriptions() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [status, setStatus] = useState("all");

  const rows = useQuery({
    queryKey: ["admin-subscriptions", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plan:ai_packages(name, code)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const subs = data as unknown as Row[];
      // resolve user emails from profiles
      const userIds = Array.from(new Set(subs.map((s) => (s as unknown as { user_id: string }).user_id)));
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, email").in("id", userIds)
        : { data: [] as { id: string; email: string }[] };
      const emails = new Map((profiles ?? []).map((p) => [p.id, p.email]));
      return subs.map((s) => ({
        ...s,
        user_email: emails.get((s as unknown as { user_id: string }).user_id) ?? "—",
      }));
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase.from("subscriptions").update(values as never).eq("id", id);
      if (error) throw error;
      await supabase.from("audit_log").insert({
        actor_id: user?.id ?? null, actor_email: user?.email ?? null,
        action: "subscription.update", entity: "subscriptions", entity_id: id,
        after_value: values as never,
      } as never);
    },
    onSuccess: () => {
      toast.success("Subscription updated");
      void qc.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (rows.data ?? []).filter((s) => status === "all" || s.status === status);

  return (
    <PanelSection
      title="Subscriptions"
      description="Every member subscription and its lifecycle. Admins can suspend, cancel or reactivate."
      action={
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All statuses</option>
          {SUBSCRIPTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                <th className="py-2 pr-3">Member</th>
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Started</th>
                <th className="py-2 pr-3">Trial ends</th>
                <th className="py-2 pr-3">Renews</th>
                <th className="py-2 pr-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2 pr-3">{s.user_email}</td>
                  <td className="py-2 pr-3">{s.plan?.name ?? "—"}</td>
                  <td className="py-2 pr-3"><Badge variant="outline" className={toneForStatus(s.status)}>{s.status}</Badge></td>
                  <td className="py-2 pr-3 whitespace-nowrap text-xs">{new Date(s.started_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-3 whitespace-nowrap text-xs">{s.trial_ends_at ? new Date(s.trial_ends_at).toLocaleDateString() : "—"}</td>
                  <td className="py-2 pr-3 whitespace-nowrap text-xs">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</td>
                  <td className="py-2 pr-3">
                    <select
                      value={s.status}
                      onChange={(e) => {
                        const v: Record<string, unknown> = { status: e.target.value };
                        if (e.target.value === "cancelled") v.cancelled_at = new Date().toISOString();
                        update.mutate({ id: s.id, values: v });
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {SUBSCRIPTION_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No subscriptions yet.</Empty>
      )}
    </PanelSection>
  );
}
