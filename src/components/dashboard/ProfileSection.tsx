import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PanelSection, StatCard } from "@/components/admin/kit";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  created_at: string;
};

export function ProfileSection() {
  const { user } = useAuth();
  const sub = useSubscription();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const profile = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Profile | null;
    },
  });

  const [form, setForm] = useState({ full_name: "", phone: "", company: "", country: "" });

  const startEdit = () => {
    const p = profile.data;
    setForm({
      full_name: p?.full_name ?? "",
      phone: p?.phone ?? "",
      company: p?.company ?? "",
      country: p?.country ?? "",
    });
    setEditing(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim() || null,
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          country: form.country.trim() || null,
        } as never)
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      setEditing(false);
      void qc.invalidateQueries({ queryKey: ["my-profile", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const p = profile.data;
  const initials = ((p?.full_name || user?.email || "?").trim().slice(0, 2)).toUpperCase();

  return (
    <div className="space-y-6">
      <PanelSection title="My Profile" description="Your personal information and account status.">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 font-display text-2xl font-semibold text-primary">
            {initials}
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-semibold">{p?.full_name ?? "FRAN-X member"}</p>
            <p className="text-sm text-muted-foreground">{p?.email ?? user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className={sub.data?.isTrial ? "border-primary/40 text-primary" : "border-emerald-500/40 text-emerald-600"}>
                {sub.data?.isTrial ? "Trial" : sub.data?.status === "active" ? "Active" : "Limited"}
              </Badge>
              {p?.company ? <Badge variant="outline">{p.company}</Badge> : null}
            </div>
          </div>
          {!editing && (
            <Button variant="outline" onClick={startEdit}>Edit profile</Button>
          )}
        </div>
      </PanelSection>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Member since" value={p ? new Date(p.created_at).toLocaleDateString() : "—"} />
        <StatCard label="Account status" value={sub.data?.isTrial ? "Trial" : "Active"} />
        <StatCard label="Plan" value={sub.data?.plan?.name ?? "Explorer"} />
      </div>

      <PanelSection title="Contact information" description="How FRAN-X reaches you.">
        {editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input className="mt-1" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Company</Label>
              <Input className="mt-1" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <Label>Country</Label>
              <Input className="mt-1" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <Info label="Full name" value={p?.full_name} />
            <Info label="Email" value={p?.email ?? user?.email} />
            <Info label="Phone" value={p?.phone} />
            <Info label="Company" value={p?.company} />
            <Info label="Country" value={p?.country} />
          </dl>
        )}
      </PanelSection>

      <PanelSection title="Profile photo" description="Photo upload is coming soon — your initials are shown for now.">
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <Switch checked={false} disabled /> Enable photo upload (coming soon)
        </label>
      </PanelSection>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 px-4 py-3">
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}
