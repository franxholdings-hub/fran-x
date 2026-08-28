import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty, Loading, PanelSection } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BILLING_INTERVALS, PLAN_PRODUCT_TYPES, formatMoney } from "@/lib/ai-integration";

type Plan = {
  id: string;
  code: string;
  name: string;
  setup_fee: number;
  monthly_price: number;
  currency: string;
  usage_limit: number;
  features: string[] | string;
  is_active: boolean;
  sort_order: number;
  billing_interval: string;
  trial_days: number;
  description: string;
  product_type: string;
};

const EMPTY = {
  code: "",
  name: "",
  setup_fee: 0,
  monthly_price: 0,
  currency: "NGN",
  usage_limit: 1000,
  features: "",
  is_active: true,
  sort_order: 0,
  billing_interval: "monthly",
  trial_days: 0,
  description: "",
  product_type: "platform",
};

function parseFeatures(v: string): string[] {
  try {
    if (v.startsWith("[")) return JSON.parse(v) as string[];
  } catch { /* fall through */ }
  return v.split("\n").map((s) => s.trim()).filter(Boolean);
}

export function Plans() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);

  const plans = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_packages")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Plan[];
    },
  });

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const features = parseFeatures(String(values.features));
      const payload = {
        ...values,
        features,
        setup_fee: Number(values.setup_fee) || 0,
        monthly_price: Number(values.monthly_price) || 0,
        usage_limit: Number(values.usage_limit) || 0,
        sort_order: Number(values.sort_order) || 0,
        trial_days: Number(values.trial_days) || 0,
      } as Record<string, unknown>;
      if (editing) {
        const { error } = await supabase.from("ai_packages").update(payload as never).eq("id", editing.id);
        if (error) throw error;
        await supabase.from("audit_log").insert({
          actor_id: user?.id ?? null, actor_email: user?.email ?? null,
          action: "plan.update", entity: "ai_packages", entity_id: editing.id,
        } as never);
      } else {
        const { error } = await supabase.from("ai_packages").insert(payload as never);
        if (error) throw error;
        await supabase.from("audit_log").insert({
          actor_id: user?.id ?? null, actor_email: user?.email ?? null,
          action: "plan.create", entity: "ai_packages",
        } as never);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Plan updated" : "Plan created");
      setEditing(null);
      setCreating(false);
      void qc.invalidateQueries({ queryKey: ["admin-plans"] });
      void qc.invalidateQueries({ queryKey: ["plans-public"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PanelSection
      title="Subscription Plans"
      description="Manage every FRAN-X plan — platform and AI integration — without code changes. Pricing, billing interval, trial, features and status are all editable here."
      action={
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New plan
        </Button>
      }
    >
      {plans.isLoading ? (
        <Loading />
      ) : plans.data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Interval</th>
                <th className="py-2 pr-3 text-right">Price</th>
                <th className="py-2 pr-3">Trial</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {plans.data.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-muted-foreground">{p.sort_order}</td>
                  <td className="py-2 pr-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{p.code}</p>
                  </td>
                  <td className="py-2 pr-3"><Badge variant="outline">{p.product_type}</Badge></td>
                  <td className="py-2 pr-3 capitalize">{p.billing_interval}</td>
                  <td className="py-2 pr-3 text-right">
                    {p.billing_interval === "free" ? "Free" : formatMoney(Number(p.monthly_price), p.currency)}
                  </td>
                  <td className="py-2 pr-3">{p.trial_days ? `${p.trial_days}d` : "—"}</td>
                  <td className="py-2 pr-3">
                    <Badge variant="outline" className={p.is_active ? "border-emerald-500/40 text-emerald-600" : "border-destructive/40 text-destructive"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No plans yet.</Empty>
      )}

      {(editing || creating) && (
        <PlanDialog
          plan={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(v) => save.mutate(v)}
          pending={save.isPending}
        />
      )}
    </PanelSection>
  );
}

function PlanDialog({
  plan,
  onClose,
  onSave,
  pending,
}: {
  plan: Plan | null;
  onClose: () => void;
  onSave: (v: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const featuresStr = plan
    ? Array.isArray(plan.features)
      ? plan.features.join("\n")
      : (() => { try { return JSON.parse(plan.features).join("\n"); } catch { return plan.features; } })()
    : "";
  const [f, setF] = useState<Record<string, unknown>>(
    plan
      ? { ...plan, features: featuresStr }
      : { ...EMPTY },
  );

  const set = (k: string, v: unknown) => setF((prev) => ({ ...prev, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit plan" : "New plan"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Plan name</Label>
            <Input className="mt-1" value={f.name as string} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label>Code (unique)</Label>
            <Input className="mt-1" value={f.code as string} disabled={!!plan} onChange={(e) => set("code", e.target.value)} placeholder="e.g. pro" />
          </div>
          <div>
            <Label>Product type</Label>
            <Select value={f.product_type as string} onValueChange={(v) => set("product_type", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLAN_PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Billing interval</Label>
            <Select value={f.billing_interval as string} onValueChange={(v) => set("billing_interval", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BILLING_INTERVALS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Monthly / recurring price</Label>
            <Input className="mt-1" type="number" value={f.monthly_price as number} onChange={(e) => set("monthly_price", e.target.value)} />
          </div>
          <div>
            <Label>Setup fee (one-time)</Label>
            <Input className="mt-1" type="number" value={f.setup_fee as number} onChange={(e) => set("setup_fee", e.target.value)} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input className="mt-1" value={f.currency as string} onChange={(e) => set("currency", e.target.value)} />
          </div>
          <div>
            <Label>Usage limit (messages/month)</Label>
            <Input className="mt-1" type="number" value={f.usage_limit as number} onChange={(e) => set("usage_limit", e.target.value)} />
          </div>
          <div>
            <Label>Trial duration (days)</Label>
            <Input className="mt-1" type="number" value={f.trial_days as number} onChange={(e) => set("trial_days", e.target.value)} />
          </div>
          <div>
            <Label>Display order</Label>
            <Input className="mt-1" type="number" value={f.sort_order as number} onChange={(e) => set("sort_order", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea className="mt-1" value={f.description as string} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Features (one per line)</Label>
            <Textarea className="mt-1" rows={5} value={f.features as string} onChange={(e) => set("features", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <Switch checked={f.is_active as boolean} onCheckedChange={(v) => set("is_active", v)} /> Active (visible on pricing page)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!(f.name as string).trim() || !(f.code as string).trim()) {
                toast.error("Name and code are required.");
                return;
              }
              onSave(f);
            }}
            disabled={pending}
          >
            {pending ? "Saving…" : "Save plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
