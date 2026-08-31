// Admin: Digital Services + Subscription Plans management.

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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Empty, Loading, PanelSection } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney } from "@/lib/ai-integration";

type Service = {
  id: string; slug: string; name: string; group_label: string; service_group: string;
  price_from: number; billing_type: string; billing_label: string; description: string;
  whats_included: string[] | string; delivery_estimate: string; is_active: boolean;
  featured: boolean; custom_quote_only: boolean; sort_order: number; requests_count: number;
};

type Plan = {
  id: string; code: string; name: string; plan_type: string; monthly_price: number;
  annual_price: number; benefits: string[] | string; usage_limit: number | null;
  is_active: boolean; featured: boolean; badge: string | null; sort_order: number;
  subscribers_count: number;
};

const BILLING_TYPES = ["one_time", "monthly", "annual", "custom"] as const;
const SERVICE_GROUPS = ["website", "marketing", "branding", "automation", "retainer"] as const;

export function DigitalServices() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  const services = useQuery({
    queryKey: ["admin-digital-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("digital_services").select("*").order("sort_order");
      if (error) throw error;
      return data as unknown as Service[];
    },
  });

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const payload = {
        ...values,
        whats_included: String(values.whats_included).split("\n").map((s: string) => s.trim()).filter(Boolean),
        price_from: Number(values.price_from) || 0,
        sort_order: Number(values.sort_order) || 0,
      } as Record<string, unknown>;
      if (editing) {
        const { error } = await supabase.from("digital_services").update(payload as never).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("digital_services").insert(payload as never);
        if (error) throw error;
      }
      await supabase.from("audit_log").insert({
        actor_id: user?.id ?? null, actor_email: user?.email ?? null,
        action: editing ? "digital_service.update" : "digital_service.create", entity: "digital_services",
      } as never);
    },
    onSuccess: () => { toast.success(editing ? "Service updated" : "Service created"); setEditing(null); setCreating(false); void qc.invalidateQueries({ queryKey: ["admin-digital-services"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("digital_services").update({ is_active: value } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-digital-services"] }),
  });

  return (
    <PanelSection
      title="Digital Services"
      description="Manage service pricing, billing type and delivery estimates. Admins can set one-time, monthly, annual or custom-quote billing."
      action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New service</Button>}
    >
      {services.isLoading ? (
        <Loading />
      ) : services.data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Service</th>
                <th className="py-2 pr-3">Group</th>
                <th className="py-2 pr-3">Billing</th>
                <th className="py-2 pr-3 text-right">From</th>
                <th className="py-2 pr-3">Requests</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {services.data.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2 pr-3"><p className="font-medium">{s.name}</p><p className="font-mono text-[11px] text-muted-foreground">{s.slug}</p></td>
                  <td className="py-2 pr-3">{s.group_label}</td>
                  <td className="py-2 pr-3 capitalize">{s.billing_type.replace("_", " ")}</td>
                  <td className="py-2 pr-3 text-right">{formatMoney(Number(s.price_from))}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{s.requests_count ?? 0}</td>
                  <td className="py-2 pr-3">
                    <label className="flex items-center gap-2">
                      <Switch checked={s.is_active} onCheckedChange={(v) => toggle.mutate({ id: s.id, value: v })} />
                      <span className="text-xs">{s.is_active ? "Active" : "Disabled"}</span>
                    </label>
                  </td>
                  <td className="py-2 pr-3"><Button size="sm" variant="ghost" onClick={() => setEditing(s)}><Pencil className="h-3.5 w-3.5" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No digital services yet.</Empty>
      )}

      {(editing || creating) && (
        <ServiceDialog service={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={(v) => save.mutate(v)} pending={save.isPending} />
      )}
    </PanelSection>
  );
}

function ServiceDialog({ service, onClose, onSave, pending }: {
  service: Service | null; onClose: () => void; onSave: (v: Record<string, unknown>) => void; pending: boolean;
}) {
  const [f, setF] = useState<Record<string, unknown>>(
    service
      ? { ...service, whats_included: (Array.isArray(service.whats_included) ? service.whats_included : (() => { try { return JSON.parse(service.whats_included); } catch { return []; } })()).join("\n") }
      : { slug: "", name: "", group_label: "Website Services", service_group: "website", price_from: 0, billing_type: "one_time", billing_label: "From", description: "", whats_included: "", delivery_estimate: "", custom_quote_only: false, featured: false, is_active: true, sort_order: 0 },
  );
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{service ? "Edit service" : "New service"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Name</Label><Input className="mt-1" value={f.name as string} onChange={(e) => set("name", e.target.value)} /></div>
          <div><Label>Slug</Label><Input className="mt-1" value={f.slug as string} disabled={!!service} onChange={(e) => set("slug", e.target.value)} /></div>
          <div><Label>Group label</Label><Input className="mt-1" value={f.group_label as string} onChange={(e) => set("group_label", e.target.value)} /></div>
          <div>
            <Label>Service group</Label>
            <Select value={f.service_group as string} onValueChange={(v) => set("service_group", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICE_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Starting price</Label><Input className="mt-1" type="number" value={f.price_from as number} onChange={(e) => set("price_from", e.target.value)} /></div>
          <div>
            <Label>Billing type</Label>
            <Select value={f.billing_type as string} onValueChange={(v) => set("billing_type", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{BILLING_TYPES.map((b) => <SelectItem key={b} value={b}>{b.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Billing label</Label><Input className="mt-1" value={f.billing_label as string} onChange={(e) => set("billing_label", e.target.value)} /></div>
          <div><Label>Delivery estimate</Label><Input className="mt-1" value={f.delivery_estimate as string} onChange={(e) => set("delivery_estimate", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea className="mt-1" value={f.description as string} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>What's included (one per line)</Label><Textarea className="mt-1" rows={4} value={f.whats_included as string} onChange={(e) => set("whats_included", e.target.value)} /></div>
          <label className="flex items-center gap-2"><Switch checked={f.custom_quote_only as boolean} onCheckedChange={(v) => set("custom_quote_only", v)} /> Custom quote only</label>
          <label className="flex items-center gap-2"><Switch checked={f.featured as boolean} onCheckedChange={(v) => set("featured", v)} /> Featured</label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!(f.name as string).trim() || !(f.slug as string).trim()) { toast.error("Name and slug are required."); return; } onSave(f); }} disabled={pending}>{pending ? "Saving…" : "Save service"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Subscription plans ---

export function DigitalPlans() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);

  const plans = useQuery({
    queryKey: ["admin-digital-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("digital_plans").select("*").order("sort_order");
      if (error) throw error;
      return data as unknown as Plan[];
    },
  });

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const payload = {
        ...values,
        benefits: String(values.benefits).split("\n").map((s: string) => s.trim()).filter(Boolean),
        monthly_price: Number(values.monthly_price) || 0,
        annual_price: Number(values.annual_price) || 0,
        sort_order: Number(values.sort_order) || 0,
      } as Record<string, unknown>;
      if (editing) {
        const { error } = await supabase.from("digital_plans").update(payload as never).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("digital_plans").insert(payload as never);
        if (error) throw error;
      }
      await supabase.from("audit_log").insert({
        actor_id: user?.id ?? null, actor_email: user?.email ?? null,
        action: editing ? "digital_plan.update" : "digital_plan.create", entity: "digital_plans",
      } as never);
    },
    onSuccess: () => { toast.success(editing ? "Plan updated" : "Plan created"); setEditing(null); setCreating(false); void qc.invalidateQueries({ queryKey: ["admin-digital-plans"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PanelSection
      title="Digital Store Subscriptions"
      description="Resource Pass and FRIX AI plans. Set monthly/annual pricing, benefits and limits — independent of the main site subscriptions."
      action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New plan</Button>}
    >
      {plans.isLoading ? (
        <Loading />
      ) : plans.data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3 text-right">Monthly</th>
                <th className="py-2 pr-3 text-right">Annual</th>
                <th className="py-2 pr-3">Subs</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {plans.data.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2 pr-3"><p className="font-medium">{p.name}</p><p className="font-mono text-[11px] text-muted-foreground">{p.code}</p></td>
                  <td className="py-2 pr-3"><Badge variant="outline">{p.plan_type.replace("_", " ")}</Badge></td>
                  <td className="py-2 pr-3 text-right">{p.monthly_price > 0 ? formatMoney(Number(p.monthly_price)) : "—"}</td>
                  <td className="py-2 pr-3 text-right">{p.annual_price > 0 ? formatMoney(Number(p.annual_price)) : "—"}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{p.subscribers_count ?? 0}</td>
                  <td className="py-2 pr-3"><Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No digital subscription plans yet.</Empty>
      )}

      {(editing || creating) && (
        <PlanDialog plan={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={(v) => save.mutate(v)} pending={save.isPending} />
      )}
    </PanelSection>
  );
}

function PlanDialog({ plan, onClose, onSave, pending }: {
  plan: Plan | null; onClose: () => void; onSave: (v: Record<string, unknown>) => void; pending: boolean;
}) {
  const [f, setF] = useState<Record<string, unknown>>(
    plan
      ? { ...plan, benefits: (Array.isArray(plan.benefits) ? plan.benefits : (() => { try { return JSON.parse(plan.benefits); } catch { return []; } })()).join("\n") }
      : { code: "", name: "", plan_type: "resource_pass", monthly_price: 0, annual_price: 0, benefits: "", usage_limit: null, is_active: true, featured: false, badge: "", sort_order: 0 },
  );
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{plan ? "Edit plan" : "New plan"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Name</Label><Input className="mt-1" value={f.name as string} onChange={(e) => set("name", e.target.value)} /></div>
          <div><Label>Code (unique)</Label><Input className="mt-1" value={f.code as string} disabled={!!plan} onChange={(e) => set("code", e.target.value)} /></div>
          <div>
            <Label>Plan type</Label>
            <Select value={f.plan_type as string} onValueChange={(v) => set("plan_type", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="resource_pass">Resource Pass</SelectItem><SelectItem value="frix_ai">FRIX AI</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Monthly price</Label><Input className="mt-1" type="number" value={f.monthly_price as number} onChange={(e) => set("monthly_price", e.target.value)} /></div>
          <div><Label>Annual price</Label><Input className="mt-1" type="number" value={f.annual_price as number} onChange={(e) => set("annual_price", e.target.value)} /></div>
          <div><Label>Usage limit (FRIX AI)</Label><Input className="mt-1" type="number" value={(f.usage_limit as number) ?? ""} onChange={(e) => set("usage_limit", e.target.value || null)} /></div>
          <div><Label>Badge</Label><Input className="mt-1" value={(f.badge as string) ?? ""} onChange={(e) => set("badge", e.target.value)} /></div>
          <div><Label>Sort order</Label><Input className="mt-1" type="number" value={f.sort_order as number} onChange={(e) => set("sort_order", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Benefits (one per line)</Label><Textarea className="mt-1" rows={5} value={f.benefits as string} onChange={(e) => set("benefits", e.target.value)} /></div>
          <label className="flex items-center gap-2"><Switch checked={f.is_active as boolean} onCheckedChange={(v) => set("is_active", v)} /> Active</label>
          <label className="flex items-center gap-2"><Switch checked={f.featured as boolean} onCheckedChange={(v) => set("featured", v)} /> Featured</label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!(f.name as string).trim() || !(f.code as string).trim()) { toast.error("Name and code are required."); return; } onSave(f); }} disabled={pending}>{pending ? "Saving…" : "Save plan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
