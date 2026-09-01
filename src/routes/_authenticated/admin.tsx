import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  Bot,
  Boxes,
  Brain,
  CircleDollarSign,
  ClipboardList,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHero } from "@/components/site/PageHero";
import { ChatPanel } from "@/components/site/ChatPanel";
import { AiClients } from "@/components/admin/ai-clients";
import { Revenue } from "@/components/admin/revenue";
import { DigitalProducts } from "@/components/admin/digital-products";
import { DigitalServices, DigitalPlans } from "@/components/admin/digital-services";
import { DigitalAnalytics } from "@/components/admin/digital-analytics";
import { Empty, Loading, PanelSection, StatCard, toneForStatus } from "@/components/admin/kit";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { INQUIRY_STATUSES } from "@/lib/site";
import { FRIX_AGENT_LABELS, KB_CATEGORIES } from "@/lib/frix";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "FRAN-X Command Center | Admin" },
      { name: "description", content: "FRAN-X internal command center for leads, projects, content, analytics and FRIX AI." },
      { property: "og:title", content: "FRAN-X Command Center" },
      { property: "og:description", content: "Internal control centre for FRAN-X Holdings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const PRIORITIES = ["Low", "Normal", "High", "Urgent"] as const;
const QUALITIES = ["Hot", "Warm", "Cold", "Unqualified"] as const;

function Admin() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!isAdmin) {
    return (
      <div className="container-x py-12 text-center">
        <h1 className="text-2xl font-semibold">Restricted area</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The FRAN-X Command Center is available to authorised administrators only.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="FRAN-X Command Center"
        title="Run the entire group from one console"
        subtitle="Leads, projects, opportunities, content, media, analytics, security and the FRIX AI system."
      />
      <section className="container-x py-10">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="overview"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="digital-store"><ShoppingBag className="h-4 w-4" /> Digital Store</TabsTrigger>
            <TabsTrigger value="crm"><ClipboardList className="h-4 w-4" /> Leads &amp; CRM</TabsTrigger>
            <TabsTrigger value="projects"><Boxes className="h-4 w-4" /> Projects</TabsTrigger>
            <TabsTrigger value="clients"><Users className="h-4 w-4" /> Clients</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="h-4 w-4" /> Messages</TabsTrigger>
            <TabsTrigger value="frix"><Bot className="h-4 w-4" /> FRIX AI</TabsTrigger>
            <TabsTrigger value="knowledge"><Brain className="h-4 w-4" /> Knowledge</TabsTrigger>
            <TabsTrigger value="ai-integration"><Sparkles className="h-4 w-4" /> AI Integration</TabsTrigger>
            <TabsTrigger value="revenue"><CircleDollarSign className="h-4 w-4" /> Revenue</TabsTrigger>
            <TabsTrigger value="cms"><ImageIcon className="h-4 w-4" /> Content</TabsTrigger>
            <TabsTrigger value="analytics"><Activity className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><Overview /></TabsContent>
          <TabsContent value="digital-store"><DigitalStore /></TabsContent>
          <TabsContent value="crm"><Crm /></TabsContent>
          <TabsContent value="projects"><Projects /></TabsContent>
          <TabsContent value="clients"><Clients /></TabsContent>
          <TabsContent value="messages">{user ? <Messages currentUserId={user.id} /> : null}</TabsContent>
          <TabsContent value="frix"><Frix /></TabsContent>
          <TabsContent value="knowledge"><Knowledge /></TabsContent>
          <TabsContent value="ai-integration"><AiClients /></TabsContent>
          <TabsContent value="plans"><Plans /></TabsContent>
          <TabsContent value="subscriptions"><Subscriptions /></TabsContent>
          <TabsContent value="payments"><Payments /></TabsContent>
          <TabsContent value="revenue"><Revenue /></TabsContent>
          <TabsContent value="cms"><Cms /></TabsContent>
          <TabsContent value="analytics"><Analytics /></TabsContent>
        </Tabs>
      </section>
    </>
  );
}

/* ---------------- Overview ---------------- */

function Overview() {
  const stats = useQuery({
    queryKey: ["cc-stats"],
    queryFn: async () => {
      const count = async (table: string, filter?: (q: never) => never) => {
        const q = supabase.from(table as never).select("id", { count: "exact", head: true });
        const { count: c } = await (filter ? filter(q as never) : q);
        return c ?? 0;
      };
      const since = new Date(Date.now() - 7 * 864e5).toISOString();
      const [visits, users, inquiries, messages, projects, conversations, weekVisits, openLeads] = await Promise.all([
        count("site_visits"),
        count("profiles"),
        count("inquiries"),
        count("messages"),
        count("projects"),
        count("ai_conversations"),
        supabase.from("site_visits").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).in("status", ["New", "Reviewing"]),
      ]);
      return {
        visits,
        users,
        inquiries,
        messages,
        projects,
        conversations,
        weekVisits: weekVisits.count ?? 0,
        openLeads: openLeads.count ?? 0,
      };
    },
  });

  const notifications = useQuery({
    queryKey: ["cc-notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const audit = useQuery({
    queryKey: ["cc-audit"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total visits" value={stats.data?.visits} hint={`${stats.data?.weekVisits ?? 0} in the last 7 days`} />
        <StatCard label="Registered users" value={stats.data?.users} />
        <StatCard label="Inquiries" value={stats.data?.inquiries} hint={`${stats.data?.openLeads ?? 0} awaiting action`} />
        <StatCard label="Client messages" value={stats.data?.messages} />
        <StatCard label="Active projects" value={stats.data?.projects} />
        <StatCard label="FRIX AI conversations" value={stats.data?.conversations} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSection title="Live activity feed" description="Every new inquiry and system event as it happens.">
          {notifications.isLoading ? (
            <Loading />
          ) : notifications.data?.length ? (
            <ul className="space-y-3">
              {notifications.data.map((n) => (
                <li key={n.id} className="rounded-lg border border-border bg-surface/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <Badge variant="outline">{n.kind}</Badge>
                  </div>
                  {n.body ? <p className="mt-1 text-sm text-muted-foreground">{n.body}</p> : null}
                  <p className="mt-1 text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No activity yet.</Empty>
          )}
        </PanelSection>

        <PanelSection title="Audit log" description="Administrative actions recorded for accountability.">
          {audit.isLoading ? (
            <Loading />
          ) : audit.data?.length ? (
            <ul className="space-y-2 text-sm">
              {audit.data.map((a) => (
                <li key={a.id} className="rounded-lg border border-border bg-surface/40 px-4 py-3">
                  <p className="font-medium">
                    {a.action} · <span className="text-muted-foreground">{a.entity}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.actor_email ?? "system"} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No administrative actions recorded yet.</Empty>
          )}
        </PanelSection>
      </div>
    </div>
  );
}

/* ---------------- Digital Store ---------------- */

function DigitalStore() {
  return (
    <div className="space-y-6">
      <DigitalAnalytics />
      <DigitalProducts />
      <DigitalServices />
      <DigitalPlans />
    </div>
  );
}

/* ---------------- CRM ---------------- */

function Crm() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [term, setTerm] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { user } = useAuth();

  const inquiries = useQuery({
    queryKey: ["cc-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return data;
    },
  });

  const notes = useQuery({
    queryKey: ["cc-notes", openId],
    enabled: Boolean(openId),
    queryFn: async () => {
      const { data } = await supabase.from("inquiry_notes").select("*").eq("inquiry_id", openId!).order("created_at");
      return data ?? [];
    },
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase.from("inquiries").update(values as never).eq("id", id);
      if (error) throw error;
      await supabase.from("audit_log").insert({
        actor_id: user?.id ?? null,
        actor_email: user?.email ?? null,
        action: "inquiry.update",
        entity: "inquiries",
        entity_id: id,
        after_value: values as never,
      });
    },
    onSuccess: () => {
      toast.success("Lead updated");
      void qc.invalidateQueries({ queryKey: ["cc-inquiries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addNote = useMutation({
    mutationFn: async () => {
      if (!openId || !note.trim()) return;
      const { error } = await supabase.from("inquiry_notes").insert({
        inquiry_id: openId,
        author_id: user?.id ?? null,
        body: note.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNote("");
      void qc.invalidateQueries({ queryKey: ["cc-notes", openId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const list = inquiries.data ?? [];
    const t = term.trim().toLowerCase();
    return list.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (kind === "all" || r.kind === kind) &&
        (!t ||
          [r.reference, r.full_name, r.email, r.description, r.category, r.service]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(t))),
    );
  }, [inquiries.data, status, kind, term]);

  return (
    <div className="space-y-6">
      <div className="glass-panel flex flex-wrap items-center gap-3 rounded-xl p-4">
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search leads…" className="max-w-xs" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All statuses</option>
          {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          {["all", "service", "website", "app", "opportunity", "contact"].map((k) => (
            <option key={k} value={k}>{k === "all" ? "All types" : k}</option>
          ))}
        </select>
        <Badge variant="outline">{rows.length} shown</Badge>
      </div>

      {inquiries.isLoading ? (
        <Loading rows={4} />
      ) : rows.length === 0 ? (
        <Empty>No leads match these filters.</Empty>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-border bg-surface/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs text-primary">{row.reference}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{row.kind}</Badge>
                  {row.source ? <Badge variant="outline">{row.source}</Badge> : null}
                  {row.lead_quality ? <Badge className={toneForStatus(row.lead_quality)} variant="outline">{row.lead_quality}</Badge> : null}
                  <Badge variant="outline" className={toneForStatus(row.status)}>{row.status}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold">
                {row.full_name} · {row.email}
                {row.phone ? ` · ${row.phone}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{row.description}</p>
              {row.ai_summary ? (
                <details className="mt-3 rounded-lg border border-primary/25 bg-primary/5 p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-primary">FRIX AI lead summary</summary>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-muted-foreground">{row.ai_summary}</pre>
                </details>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select
                  value={row.status}
                  onChange={(e) => patch.mutate({ id: row.id, values: { status: e.target.value } })}
                  className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={row.priority ?? "Normal"}
                  onChange={(e) => patch.mutate({ id: row.id, values: { priority: e.target.value } })}
                  className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  {PRIORITIES.map((s) => <option key={s} value={s}>{s} priority</option>)}
                </select>
                <select
                  value={row.lead_quality ?? ""}
                  onChange={(e) => patch.mutate({ id: row.id, values: { lead_quality: e.target.value || null } })}
                  className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="">Unrated</option>
                  {QUALITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Input
                  defaultValue={row.assigned_to ?? ""}
                  onBlur={(e) => e.target.value !== (row.assigned_to ?? "") && patch.mutate({ id: row.id, values: { assigned_to: e.target.value || null } })}
                  placeholder="Assign to…"
                  className="h-9 w-40 text-xs"
                />
                <Input
                  type="date"
                  defaultValue={row.follow_up_date ?? ""}
                  onChange={(e) => patch.mutate({ id: row.id, values: { follow_up_date: e.target.value || null } })}
                  className="h-9 w-40 text-xs"
                />
                <Button size="sm" variant="ghost" onClick={() => setOpenId(openId === row.id ? null : row.id)}>
                  {openId === row.id ? "Hide notes" : "Notes & follow-up"}
                </Button>
              </div>

              {openId === row.id ? (
                <div className="mt-4 space-y-3 rounded-lg border border-border p-4">
                  <Input
                    defaultValue={row.next_action ?? ""}
                    placeholder="Next action"
                    onBlur={(e) => patch.mutate({ id: row.id, values: { next_action: e.target.value || null } })}
                  />
                  <div className="space-y-2">
                    {(notes.data ?? []).map((n) => (
                      <p key={n.id} className="rounded-md bg-surface/60 px-3 py-2 text-xs">
                        {n.body}
                        <span className="ml-2 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                      </p>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note…" />
                    <Button size="sm" onClick={() => addNote.mutate()} disabled={addNote.isPending}>Save</Button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Projects ---------------- */

function Projects() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({ title: "", kind: "website", platform: "", summary: "" });

  const projects = useQuery({
    queryKey: ["cc-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!draft.title.trim()) throw new Error("Project title is required");
      const { error } = await supabase.from("projects").insert({
        title: draft.title.trim(),
        kind: draft.kind,
        platform: draft.platform || null,
        summary: draft.summary || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft({ title: "", kind: "website", platform: "", summary: "" });
      toast.success("Project created");
      void qc.invalidateQueries({ queryKey: ["cc-projects"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase.from("projects").update(values as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cc-projects"] }),
  });

  return (
    <div className="space-y-6">
      <PanelSection title="Create a project" description="Track website, mobile app and business delivery projects.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Project title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {["website", "mobile app", "ai", "consulting", "commercial"].map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <Input placeholder="Platform (iOS, Android, Web…)" value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value })} />
          <Input placeholder="Summary" value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
        </div>
        <Button className="mt-4" onClick={() => create.mutate()} disabled={create.isPending}>Add project</Button>
      </PanelSection>

      {projects.isLoading ? (
        <Loading />
      ) : projects.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.data.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-surface/40 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{p.title}</p>
                <Badge variant="outline" className={toneForStatus(p.status)}>{p.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.kind}{p.platform ? ` · ${p.platform}` : ""}</p>
              {p.summary ? <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p> : null}
              <div className="mt-4 space-y-2">
                <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Progress {p.progress}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={p.progress}
                  onMouseUp={(e) => patch.mutate({ id: p.id, values: { progress: Number((e.target as HTMLInputElement).value) } })}
                  onTouchEnd={(e) => patch.mutate({ id: p.id, values: { progress: Number((e.target as HTMLInputElement).value) } })}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={p.status}
                    onChange={(e) => patch.mutate({ id: p.id, values: { status: e.target.value } })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    {["Planning", "In Progress", "Review", "Completed", "On Hold"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Input type="date" defaultValue={p.deadline ?? ""} onChange={(e) => patch.mutate({ id: p.id, values: { deadline: e.target.value || null } })} className="h-9 w-40 text-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty>No projects yet.</Empty>
      )}
    </div>
  );
}

/* ---------------- Clients ---------------- */

function Clients() {
  const clients = useQuery({
    queryKey: ["cc-clients"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const byUser = new Map<string, string[]>();
      for (const r of roles ?? []) byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role]);
      return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? ["user"] }));
    },
  });

  return (
    <PanelSection title="Client accounts" description="Every registered account and its access level.">
      {clients.isLoading ? (
        <Loading />
      ) : clients.data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Roles</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.data.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-2 pr-4">{c.full_name ?? "—"}</td>
                  <td className="py-2 pr-4">{c.email}</td>
                  <td className="py-2 pr-4">{c.company ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {c.roles.map((r) => <Badge key={r} variant="outline">{r}</Badge>)}
                    </div>
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No registered accounts yet.</Empty>
      )}
    </PanelSection>
  );
}

/* ---------------- Messages ---------------- */

function Messages({ currentUserId }: { currentUserId: string }) {
  const [thread, setThread] = useState<string | null>(null);

  const threads = useQuery({
    queryKey: ["cc-threads"],
    refetchInterval: 20000,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("thread_user_id, body, created_at, from_admin, read_at")
        .order("created_at", { ascending: false })
        .limit(400);
      const seen = new Map<string, { body: string; created_at: string; from_admin: boolean }>();
      for (const m of data ?? []) if (!seen.has(m.thread_user_id)) seen.set(m.thread_user_id, m);
      const ids = Array.from(seen.keys());
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", ids)
        : { data: [] };
      const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.email || p.id]));
      return Array.from(seen.entries()).map(([id, last]) => ({ id, last, name: names.get(id) ?? id }));
    },
  });

  const waiting = (threads.data ?? []).filter((t) => !t.last.from_admin).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <PanelSection title="Conversations" description="Clients waiting for a reply appear first." action={waiting ? <Badge>{waiting} awaiting reply</Badge> : null}>
        <div className="space-y-2">
          {(threads.data ?? []).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setThread(t.id)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${thread === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{t.name}</p>
                {!t.last.from_admin ? <Badge variant="outline" className="border-primary/40 text-primary">New</Badge> : null}
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{t.last.body}</p>
            </button>
          ))}
          {(threads.data ?? []).length === 0 ? <Empty>No client conversations yet.</Empty> : null}
        </div>
      </PanelSection>
      {thread ? <ChatPanel threadUserId={thread} currentUserId={currentUserId} asAdmin title="Admin conversation" /> : <Empty>Select a conversation to reply.</Empty>}
    </div>
  );
}

/* ---------------- FRIX AI ---------------- */

function Frix() {
  const qc = useQueryClient();

  const settings = useQuery({
    queryKey: ["cc-ai-settings"],
    queryFn: async () => (await supabase.from("ai_settings").select("*").maybeSingle()).data,
  });
  const agents = useQuery({
    queryKey: ["cc-ai-agents"],
    queryFn: async () => (await supabase.from("ai_agents").select("*").order("sort_order")).data ?? [],
  });
  const conversations = useQuery({
    queryKey: ["cc-ai-conversations"],
    queryFn: async () =>
      (await supabase.from("ai_conversations").select("*").order("created_at", { ascending: false }).limit(60)).data ?? [],
  });
  const unknown = useQuery({
    queryKey: ["cc-ai-unknown"],
    queryFn: async () =>
      (await supabase.from("ai_unknown_questions").select("*").eq("resolved", false).order("created_at", { ascending: false }).limit(50)).data ?? [],
  });
  const callbacks = useQuery({
    queryKey: ["cc-callbacks"],
    queryFn: async () => (await supabase.from("callback_requests").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const saveSettings = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { error } = await supabase.from("ai_settings").update(values as never).eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("AI settings saved");
      void qc.invalidateQueries({ queryKey: ["cc-ai-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAgent = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase.from("ai_agents").update({ is_enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cc-ai-agents"] }),
  });

  const s = settings.data;

  return (
    <div className="space-y-6">
      <PanelSection title="FRIX AI control" description="Global switches for the AI Business Concierge.">
        {s ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">FRIX AI enabled</p>
                <p className="text-xs text-muted-foreground">Turn the concierge on or off across the website.</p>
              </div>
              <Switch checked={s.ai_enabled} onCheckedChange={(v) => saveSettings.mutate({ ai_enabled: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Show lead score to clients</p>
                <p className="text-xs text-muted-foreground">Scores stay internal unless enabled.</p>
              </div>
              <Switch checked={s.show_score_to_user} onCheckedChange={(v) => saveSettings.mutate({ show_score_to_user: v })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input defaultValue={s.tone} onBlur={(e) => saveSettings.mutate({ tone: e.target.value })} placeholder="Tone" />
              <Input defaultValue={s.business_hours} onBlur={(e) => saveSettings.mutate({ business_hours: e.target.value })} placeholder="Business hours" />
            </div>
            <Textarea defaultValue={s.base_instructions} rows={4} onBlur={(e) => saveSettings.mutate({ base_instructions: e.target.value })} placeholder="Base instructions" />
            <Textarea defaultValue={s.escalation_rules} rows={3} onBlur={(e) => saveSettings.mutate({ escalation_rules: e.target.value })} placeholder="Escalation rules" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input type="number" defaultValue={s.hot_threshold} onBlur={(e) => saveSettings.mutate({ hot_threshold: Number(e.target.value) })} placeholder="Hot threshold" />
              <Input type="number" defaultValue={s.warm_threshold} onBlur={(e) => saveSettings.mutate({ warm_threshold: Number(e.target.value) })} placeholder="Warm threshold" />
              <Input type="number" defaultValue={s.cold_threshold} onBlur={(e) => saveSettings.mutate({ cold_threshold: Number(e.target.value) })} placeholder="Cold threshold" />
            </div>
          </div>
        ) : (
          <Loading rows={2} />
        )}
      </PanelSection>

      <PanelSection title="Specialised AI agents" description="The FRIX router selects the right specialist per enquiry.">
        <div className="grid gap-3 md:grid-cols-2">
          {(agents.data ?? []).map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{a.name}</p>
                <Switch checked={a.is_enabled} onCheckedChange={(v) => toggleAgent.mutate({ id: a.id, is_enabled: v })} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">Domains: {a.domains.join(", ")}</p>
            </div>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="AI conversations" description="Qualified leads, scores and escalations captured by FRIX AI.">
        {conversations.data?.length ? (
          <div className="space-y-3">
            {conversations.data.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-surface/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{c.contact_name ?? "Anonymous visitor"} · {FRIX_AGENT_LABELS[c.agent_slug] ?? c.agent_slug}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.classification ? <Badge variant="outline" className={toneForStatus(c.classification)}>{c.classification}</Badge> : null}
                    {c.lead_score !== null ? <Badge variant="outline">{c.lead_score}/100</Badge> : null}
                    {c.escalated ? <Badge variant="outline" className="border-destructive/40 text-destructive">Escalated</Badge> : null}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.contact_email ?? "no email"} · {c.message_count} messages · {new Date(c.created_at).toLocaleString()}
                </p>
                {c.risk_flags?.length ? (
                  <p className="mt-2 text-xs text-destructive">Risk: {c.risk_flags.join(", ")} — additional verification recommended.</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <Empty>No AI conversations yet.</Empty>
        )}
      </PanelSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSection title="Unanswered questions" description="Add answers to the knowledge base so FRIX AI can handle them next time.">
          {unknown.data?.length ? (
            <ul className="space-y-2 text-sm">
              {unknown.data.map((u) => (
                <li key={u.id} className="flex items-start justify-between gap-3 rounded-lg border border-border px-4 py-3">
                  <span>{u.question}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await supabase.from("ai_unknown_questions").update({ resolved: true }).eq("id", u.id);
                      void qc.invalidateQueries({ queryKey: ["cc-ai-unknown"] });
                    }}
                  >
                    Resolve
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing outstanding.</Empty>
          )}
        </PanelSection>

        <PanelSection title="Callback requests" description="Consultation and callback bookings from the concierge.">
          {callbacks.data?.length ? (
            <ul className="space-y-2 text-sm">
              {callbacks.data.map((c) => (
                <li key={c.id} className="rounded-lg border border-border px-4 py-3">
                  <p className="font-medium">{c.full_name ?? "Client"} · {c.contact_value ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.preferred_date ?? "any date"} {c.preferred_time ?? ""} {c.timezone ?? ""} · {c.status}
                  </p>
                  {c.reason ? <p className="mt-1 text-xs text-muted-foreground">{c.reason}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No callback requests yet.</Empty>
          )}
        </PanelSection>
      </div>
    </div>
  );
}

/* ---------------- Knowledge base ---------------- */

function Knowledge() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [draft, setDraft] = useState({ category: KB_CATEGORIES[0] as string, title: "", content: "", tags: "", reference_code: "", valid_until: "" });

  const entries = useQuery({
    queryKey: ["cc-kb"],
    queryFn: async () => (await supabase.from("knowledge_base").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!draft.title.trim() || !draft.content.trim()) throw new Error("Title and content are required");
      const { error } = await supabase.from("knowledge_base").insert({
        category: draft.category,
        title: draft.title.trim(),
        content: draft.content.trim(),
        reference_code: draft.reference_code || null,
        valid_until: draft.valid_until || null,
        tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft({ category: KB_CATEGORIES[0] as string, title: "", content: "", tags: "", reference_code: "", valid_until: "" });
      toast.success("Knowledge entry added");
      void qc.invalidateQueries({ queryKey: ["cc-kb"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase.from("knowledge_base").update(values as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cc-kb"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cc-kb"] }),
  });

  return (
    <div className="space-y-6">
      <PanelSection title="Add verified knowledge" description="FRIX AI answers only from verified, active entries — nothing else.">
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {KB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Input placeholder="Reference code (optional)" value={draft.reference_code} onChange={(e) => setDraft({ ...draft, reference_code: e.target.value })} />
          <Input type="date" placeholder="Valid until" value={draft.valid_until} onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })} />
        </div>
        <Textarea className="mt-3" rows={4} placeholder="Verified content" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
        <Input className="mt-3" placeholder="Tags, comma separated" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
        <Button className="mt-4" onClick={() => create.mutate()} disabled={create.isPending}>Add to knowledge base</Button>
      </PanelSection>

      {entries.isLoading ? (
        <Loading />
      ) : entries.data?.length ? (
        <div className="space-y-3">
          {entries.data.map((k) => (
            <div key={k.id} className="rounded-xl border border-border bg-surface/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{k.title}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{k.category}</Badge>
                  {k.reference_code ? <Badge variant="outline">{k.reference_code}</Badge> : null}
                  {k.valid_until ? <Badge variant="outline">until {k.valid_until}</Badge> : null}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{k.content}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <Switch checked={k.is_active} onCheckedChange={(v) => patch.mutate({ id: k.id, values: { is_active: v } })} /> Active
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={k.is_verified} onCheckedChange={(v) => patch.mutate({ id: k.id, values: { is_verified: v } })} /> Verified
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={k.is_confidential} onCheckedChange={(v) => patch.mutate({ id: k.id, values: { is_confidential: v } })} /> Internal only
                </label>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(k.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty>No knowledge entries yet. FRIX AI will forward every question to the team until you add some.</Empty>
      )}
    </div>
  );
}

/* ---------------- CMS ---------------- */

function Cms() {
  const qc = useQueryClient();
  const services = useQuery({
    queryKey: ["cc-services"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });
  const companies = useQuery({
    queryKey: ["cc-companies"],
    queryFn: async () => (await supabase.from("companies").select("*").order("sort_order")).data ?? [],
  });
  const faqs = useQuery({
    queryKey: ["cc-faqs"],
    queryFn: async () => (await supabase.from("faqs").select("*").order("sort_order")).data ?? [],
  });
  const media = useQuery({
    queryKey: ["cc-media"],
    queryFn: async () => (await supabase.from("media_assets").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const [faq, setFaq] = useState({ question: "", answer: "" });

  const patchService = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase.from("services").update(values as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cc-services"] }),
  });
  const patchCompany = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase.from("companies").update(values as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cc-companies"] }),
  });
  const addFaq = useMutation({
    mutationFn: async () => {
      if (!faq.question.trim() || !faq.answer.trim()) throw new Error("Question and answer are required");
      const { error } = await supabase.from("faqs").insert({ question: faq.question.trim(), answer: faq.answer.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setFaq({ question: "", answer: "" });
      void qc.invalidateQueries({ queryKey: ["cc-faqs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PanelSection title="Services catalogue" description="Publish, hide, feature and price every FRAN-X service.">
        <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {(services.data ?? []).map((s) => (
            <div key={s.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{s.name}</p>
                <Badge variant="outline">{s.category}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <Switch checked={s.is_active} onCheckedChange={(v) => patchService.mutate({ id: s.id, values: { is_active: v } })} /> Published
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={s.is_featured} onCheckedChange={(v) => patchService.mutate({ id: s.id, values: { is_featured: v } })} /> Featured
                </label>
                <Input
                  defaultValue={s.pricing_info ?? ""}
                  placeholder="Pricing note"
                  className="h-9 w-56 text-xs"
                  onBlur={(e) => patchService.mutate({ id: s.id, values: { pricing_info: e.target.value || null } })}
                />
              </div>
            </div>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="FRAN-X Group companies" description="Manage the portfolio, statuses and links.">
        <div className="grid gap-3 md:grid-cols-2">
          {(companies.data ?? []).map((c) => (
            <div key={c.id} className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.industry}</p>
              <div className="mt-3 space-y-2">
                <select
                  value={c.status}
                  onChange={(e) => patchCompany.mutate({ id: c.id, values: { status: e.target.value } })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  {["Operating", "In Development", "Planned"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Input defaultValue={c.link ?? ""} placeholder="Website link" className="h-9 text-xs" onBlur={(e) => patchCompany.mutate({ id: c.id, values: { link: e.target.value || null } })} />
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={c.is_active} onCheckedChange={(v) => patchCompany.mutate({ id: c.id, values: { is_active: v } })} /> Visible
                </label>
              </div>
            </div>
          ))}
        </div>
      </PanelSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSection title="FAQs" description="Published on the site and used by FRIX AI.">
          <div className="space-y-2">
            <Input placeholder="Question" value={faq.question} onChange={(e) => setFaq({ ...faq, question: e.target.value })} />
            <Textarea rows={3} placeholder="Answer" value={faq.answer} onChange={(e) => setFaq({ ...faq, answer: e.target.value })} />
            <Button size="sm" onClick={() => addFaq.mutate()} disabled={addFaq.isPending}>Add FAQ</Button>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {(faqs.data ?? []).map((f) => (
              <li key={f.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium">{f.question}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.answer}</p>
              </li>
            ))}
          </ul>
        </PanelSection>

        <PanelSection title="Media library" description="Logos, photography and documents registered for the site.">
          {media.data?.length ? (
            <ul className="space-y-2 text-sm">
              {media.data.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
                  <span className="truncate">{m.name}</span>
                  <Badge variant="outline">{m.category}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No media registered yet.</Empty>
          )}
        </PanelSection>
      </div>
    </div>
  );
}

/* ---------------- Analytics ---------------- */

function Analytics() {
  const visits = useQuery({
    queryKey: ["cc-analytics"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data } = await supabase.from("site_visits").select("path, created_at, device, referrer").gte("created_at", since).limit(5000);
      const rows = data ?? [];
      const byPath = new Map<string, number>();
      const byDay = new Map<string, number>();
      const byDevice = new Map<string, number>();
      const byReferrer = new Map<string, number>();
      for (const r of rows) {
        byPath.set(r.path, (byPath.get(r.path) ?? 0) + 1);
        const day = r.created_at.slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + 1);
        byDevice.set(r.device ?? "unknown", (byDevice.get(r.device ?? "unknown") ?? 0) + 1);
        if (r.referrer) byReferrer.set(new URL(r.referrer, "https://x").hostname || r.referrer, (byReferrer.get(r.referrer) ?? 0) + 1);
      }
      const top = (m: Map<string, number>) => Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
      return { total: rows.length, paths: top(byPath), days: Array.from(byDay.entries()).sort(), devices: top(byDevice), referrers: top(byReferrer) };
    },
  });

  const max = Math.max(1, ...(visits.data?.days.map(([, n]) => n) ?? [1]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Visits (30 days)" value={visits.data?.total} />
        <StatCard label="Tracked pages" value={visits.data?.paths.length} />
        <StatCard label="Devices" value={visits.data?.devices.length} />
      </div>

      <PanelSection title="Daily traffic" description="Page views per day over the last 30 days.">
        {visits.data?.days.length ? (
          <div className="flex h-40 items-end gap-1">
            {visits.data.days.map(([day, n]) => (
              <div key={day} className="flex-1" title={`${day}: ${n}`}>
                <div className="rounded-t bg-primary/70" style={{ height: `${(n / max) * 140}px` }} />
              </div>
            ))}
          </div>
        ) : (
          <Empty>No traffic recorded yet.</Empty>
        )}
      </PanelSection>

      <div className="grid gap-6 lg:grid-cols-3">
        <PanelSection title="Top pages">
          <ul className="space-y-1 text-sm">
            {(visits.data?.paths ?? []).map(([p, n]) => (
              <li key={p} className="flex justify-between gap-3 border-b border-border/50 py-1.5">
                <span className="truncate">{p}</span>
                <span className="text-muted-foreground">{n}</span>
              </li>
            ))}
          </ul>
        </PanelSection>
        <PanelSection title="Devices">
          <ul className="space-y-1 text-sm">
            {(visits.data?.devices ?? []).map(([d, n]) => (
              <li key={d} className="flex justify-between gap-3 border-b border-border/50 py-1.5">
                <span>{d}</span>
                <span className="text-muted-foreground">{n}</span>
              </li>
            ))}
          </ul>
        </PanelSection>
        <PanelSection title="Referrers">
          {visits.data?.referrers.length ? (
            <ul className="space-y-1 text-sm">
              {visits.data.referrers.map(([r, n]) => (
                <li key={r} className="flex justify-between gap-3 border-b border-border/50 py-1.5">
                  <span className="truncate">{r}</span>
                  <span className="text-muted-foreground">{n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Mostly direct traffic.</Empty>
          )}
        </PanelSection>
      </div>
    </div>
  );
}
