import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Plus, Power, Settings, Code2, BookOpen, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Empty, Loading, PanelSection, StatCard, toneForStatus } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  AI_CLIENT_STATUSES,
  AI_KNOWLEDGE_TYPES,
  AI_PROVIDERS,
  DEFAULT_SUGGESTED_QUESTIONS,
  WIDGET_DOMAIN_PLACEHOLDER,
  widgetInstallScript,
} from "@/lib/ai-integration";

type Client = {
  id: string;
  client_code: string;
  business_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  country: string | null;
  website: string | null;
  industry: string | null;
  status: string;
  branding: Record<string, unknown>;
  notes: string | null;
  created_at: string;
};

type Config = {
  client_id: string;
  provider: string;
  model: string;
  fallback_model: string | null;
  system_prompt: string;
  personality: string;
  temperature: number;
  usage_limit_monthly: number;
  token_limit_per_request: number;
  rate_limit_per_hour: number;
  is_approved: boolean;
};

type KnowledgeRow = {
  id: string;
  client_id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  is_active: boolean;
};

const WIDGET_DOMAIN =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: Record<string, string> }).env?.["VITE_FRANX_WIDGET_DOMAIN"]) ||
  WIDGET_DOMAIN_PLACEHOLDER;

export function AiClients() {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const clients = useQuery({
    queryKey: ["ai-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Client[];
    },
  });

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return clients.data ?? [];
    return (clients.data ?? []).filter(
      (c) =>
        c.business_name.toLowerCase().includes(t) ||
        c.client_code.toLowerCase().includes(t) ||
        (c.contact_email ?? "").toLowerCase().includes(t),
    );
  }, [clients.data, term]);

  const counts = useMemo(() => {
    const all = clients.data ?? [];
    return {
      total: all.length,
      active: all.filter((c) => c.status === "active").length,
      pending: all.filter((c) => c.status === "pending").length,
      suspended: all.filter((c) => c.status === "suspended").length,
    };
  }, [clients.data]);

  const selected = (clients.data ?? []).find((c) => c.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total clients" value={counts.total} />
        <StatCard label="Active" value={counts.active} />
        <StatCard label="Pending" value={counts.pending} />
        <StatCard label="Suspended" value={counts.suspended} />
      </div>

      <PanelSection
        title="AI Clients"
        description="Build, deploy and manage AI assistants for external businesses. Each client is fully isolated."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New Client
          </Button>
        }
      >
        <Input
          placeholder="Search by name, client code or email…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="mb-4 max-w-sm"
        />
        {clients.isLoading ? (
          <Loading />
        ) : filtered.length ? (
          <ul className="space-y-2">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelectedId(c.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-surface/40 px-4 py-3 text-left transition-colors hover:border-primary/50 ${
                    selectedId === c.id ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{c.business_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.client_code} · {c.contact_email ?? "no email"}
                    </p>
                  </div>
                  <Badge variant="outline" className={toneForStatus(c.status)}>
                    {c.status}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No AI clients yet. Create one to get started.</Empty>
        )}
      </PanelSection>

      {selected ? <ClientDetail client={selected} onClose={() => setSelectedId(null)} /> : null}

      {creating ? (
        <CreateClientDialog
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            setSelectedId(id);
            void qc.invalidateQueries({ queryKey: ["ai-clients"] });
          }}
        />
      ) : null}
    </div>
  );
}

/* ---------------- Client detail (config / knowledge / install) ---------------- */

function ClientDetail({ client, onClose }: { client: Client; onClose: () => void }) {
  return (
    <PanelSection
      title={client.business_name}
      description={`${client.client_code} — manage AI configuration, knowledge base and installation.`}
      action={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <Tabs defaultValue="config">
        <TabsList className="mb-5 flex h-auto flex-wrap gap-1">
          <TabsTrigger value="config"><Settings className="h-4 w-4" /> Config</TabsTrigger>
          <TabsTrigger value="knowledge"><BookOpen className="h-4 w-4" /> Knowledge</TabsTrigger>
          <TabsTrigger value="install"><Code2 className="h-4 w-4" /> Install</TabsTrigger>
          <TabsTrigger value="manage"><Power className="h-4 w-4" /> Manage</TabsTrigger>
        </TabsList>
        <TabsContent value="config"><ClientConfig client={client} /></TabsContent>
        <TabsContent value="knowledge"><ClientKnowledge client={client} /></TabsContent>
        <TabsContent value="install"><ClientInstall client={client} /></TabsContent>
        <TabsContent value="manage"><ClientManage client={client} /></TabsContent>
      </Tabs>
    </PanelSection>
  );
}

function ClientConfig({ client }: { client: Client }) {
  const qc = useQueryClient();
  const config = useQuery({
    queryKey: ["ai-client-config", client.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_client_config")
        .select("*")
        .eq("client_id", client.id)
        .maybeSingle();
      return data as unknown as Config | null;
    },
  });

  const [form, setForm] = useState<Partial<Config>>({});
  const current = { ...(config.data ?? {}), ...form } as Config;

  const ensureConfig = useMutation({
    mutationFn: async () => {
      if (config.data) return config.data;
      const { data, error } = await supabase
        .from("ai_client_config")
        .insert({ client_id: client.id })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as Config;
    },
    onSuccess: (cfg) => {
      setForm({});
      void qc.invalidateQueries({ queryKey: ["ai-client-config", client.id] });
      return cfg;
    },
  });

  const save = useMutation({
    mutationFn: async (values: Partial<Config>) => {
      await ensureConfig.mutateAsync();
      const { error } = await supabase
        .from("ai_client_config")
        .update(values as never)
        .eq("client_id", client.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("AI configuration saved");
      setForm({});
      void qc.invalidateQueries({ queryKey: ["ai-client-config", client.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approve = useMutation({
    mutationFn: async (approved: boolean) => {
      await ensureConfig.mutateAsync();
      const { error } = await supabase
        .from("ai_client_config")
        .update({ is_approved: approved } as never)
        .eq("client_id", client.id);
      if (error) throw error;
    },
    onSuccess: (_v, approved) => {
      toast.success(approved ? "AI approved — widget is live" : "AI approval withdrawn");
      void qc.invalidateQueries({ queryKey: ["ai-client-config", client.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (config.isLoading) return <Loading />;

  const set = (k: keyof Config, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Approval status</p>
          <p className="text-xs text-muted-foreground">
            The widget only responds once the AI is approved.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={toneForStatus(current.is_approved ? "approved" : "pending")}>
            {current.is_approved ? "Approved" : "Not approved"}
          </Badge>
          <Button
            size="sm"
            variant={current.is_approved ? "outline" : "default"}
            onClick={() => approve.mutate(!current.is_approved)}
          >
            {current.is_approved ? "Withdraw" : "Approve AI"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Provider</Label>
          <Select value={current.provider ?? "lovable"} onValueChange={(v) => set("provider", v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AI_PROVIDERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Model</Label>
          <Input className="mt-1" value={current.model ?? ""} onChange={(e) => set("model", e.target.value)} placeholder="openai/gpt-5.6-terra" />
        </div>
        <div>
          <Label>Fallback model</Label>
          <Input className="mt-1" value={current.fallback_model ?? ""} onChange={(e) => set("fallback_model", e.target.value)} placeholder="(optional)" />
        </div>
        <div>
          <Label>Personality</Label>
          <Input className="mt-1" value={current.personality ?? ""} onChange={(e) => set("personality", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>System prompt</Label>
        <Textarea
          className="mt-1 min-h-28"
          value={current.system_prompt ?? ""}
          onChange={(e) => set("system_prompt", e.target.value)}
          placeholder="Instructions that define how this client's AI behaves…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Monthly message limit</Label>
          <Input className="mt-1" type="number" value={current.usage_limit_monthly ?? 0} onChange={(e) => set("usage_limit_monthly", Number(e.target.value))} />
        </div>
        <div>
          <Label>Token limit / request</Label>
          <Input className="mt-1" type="number" value={current.token_limit_per_request ?? 0} onChange={(e) => set("token_limit_per_request", Number(e.target.value))} />
        </div>
        <div>
          <Label>Rate limit / hour</Label>
          <Input className="mt-1" type="number" value={current.rate_limit_per_hour ?? 0} onChange={(e) => set("rate_limit_per_hour", Number(e.target.value))} />
        </div>
        <div>
          <Label>Temperature</Label>
          <Input className="mt-1" type="number" step="0.1" min="0" max="2" value={current.temperature ?? 0.4} onChange={(e) => set("temperature", Number(e.target.value))} />
        </div>
      </div>

      <Button onClick={() => save.mutate(form)} disabled={save.isPending || Object.keys(form).length === 0}>
        Save configuration
      </Button>
    </div>
  );
}

function ClientKnowledge({ client }: { client: Client }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const rows = useQuery({
    queryKey: ["ai-client-knowledge", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_client_knowledge")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as KnowledgeRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("ai_client_knowledge")
        .update({ is_active: !active } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ai-client-knowledge", client.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_client_knowledge").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      void qc.invalidateQueries({ queryKey: ["ai-client-knowledge", client.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add knowledge
        </Button>
      </div>
      {rows.isLoading ? (
        <Loading />
      ) : rows.data?.length ? (
        <ul className="space-y-2">
          {rows.data.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-surface/40 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{r.type}</Badge>
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.content}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Switch checked={r.is_active} onCheckedChange={() => toggle.mutate({ id: r.id, active: r.is_active })} />
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(r.id)}>Remove</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No knowledge items yet. Add FAQs, products, services and pricing so the AI can answer accurately.</Empty>
      )}
      {adding ? (
        <AddKnowledgeDialog
          clientId={client.id}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            void qc.invalidateQueries({ queryKey: ["ai-client-knowledge", client.id] });
          }}
        />
      ) : null}
    </div>
  );
}

function AddKnowledgeDialog({
  clientId,
  onClose,
  onSaved,
}: {
  clientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState("faq");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !content.trim()) throw new Error("Title and content are required.");
      const { error } = await supabase.from("ai_client_knowledge").insert({
        client_id: clientId,
        type,
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Knowledge added");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add knowledge</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AI_KNOWLEDGE_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Return policy" />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea className="mt-1 min-h-28" value={content} onChange={(e) => setContent(e.target.value)} placeholder="The full answer / details the AI should use…" />
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input className="mt-1" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="returns, refund, shipping" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClientInstall({ client }: { client: Client }) {
  const script = widgetInstallScript(client.client_code, WIDGET_DOMAIN);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-700 dark:text-amber-400">Deployment configuration required</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Set <code className="rounded bg-muted px-1">VITE_FRANX_WIDGET_DOMAIN</code> (and serve{" "}
          <code className="rounded bg-muted px-1">widget.js</code> from that origin) to replace the
          placeholder below with your live widget domain. The widget script and backend route must be
          deployed to a publicly reachable domain.
        </p>
      </div>
      <div>
        <Label>Installation code</Label>
        <pre className="mt-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs">
          <code>{script}</code>
        </pre>
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => {
            void navigator.clipboard.writeText(script);
            toast.success("Copied installation code");
          }}
        >
          <Copy className="h-4 w-4" /> Copy
        </Button>
      </div>
      <div className="text-sm">
        <p className="font-semibold">Install on:</p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li><b>HTML</b> — paste the snippet before <code>&lt;/body&gt;</code>.</li>
          <li><b>WordPress</b> — add to Appearance → Theme File Editor → <code>footer.php</code>, or a "Custom HTML" block.</li>
          <li><b>Shopify</b> — Online Store → Themes → Edit code → <code>theme.liquid</code> before <code>&lt;/body&gt;</code>.</li>
          <li><b>Wix</b> — Settings → Custom Code → Embed Custom HTML (site footer).</li>
          <li><b>Webflow</b> — Project Settings → Custom Code → Footer code.</li>
          <li><b>React</b> — add the script tag in <code>public/index.html</code> or via <code>react-helmet</code>.</li>
          <li><b>Next.js</b> — add in <code>app/layout.tsx</code> via <code>&lt;Script strategy="afterInteractive"&gt;</code>.</li>
        </ul>
      </div>
    </div>
  );
}

function ClientManage({ client }: { client: Client }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [business, setBusiness] = useState(client.business_name);
  const [contactName, setContactName] = useState(client.contact_name ?? "");
  const [contactEmail, setContactEmail] = useState(client.contact_email ?? "");
  const [contactPhone, setContactPhone] = useState(client.contact_phone ?? "");
  const [country, setCountry] = useState(client.country ?? "");
  const [website, setWebsite] = useState(client.website ?? "");
  const [industry, setIndustry] = useState(client.industry ?? "");
  const [aiName, setAiName] = useState(String(client.branding?.["ai_name"] ?? ""));
  const [welcome, setWelcome] = useState(String(client.branding?.["welcome_message"] ?? ""));
  const [suggested, setSuggested] = useState(
    Array.isArray(client.branding?.["suggested_questions"])
      ? (client.branding["suggested_questions"] as string[]).join("\n")
      : DEFAULT_SUGGESTED_QUESTIONS.join("\n"),
  );
  const [color, setColor] = useState(String(client.branding?.["primary_color"] ?? ""));
  const [whatsapp, setWhatsapp] = useState(String(client.branding?.["whatsapp_number"] ?? ""));
  const [notes, setNotes] = useState(client.notes ?? "");

  const update = useMutation({
    mutationFn: async () => {
      const branding = {
        ai_name: aiName.trim() || undefined,
        welcome_message: welcome.trim() || undefined,
        suggested_questions: suggested.split("\n").map((s) => s.trim()).filter(Boolean),
        primary_color: color.trim() || undefined,
        whatsapp_number: whatsapp.trim() || undefined,
      };
      const { error } = await supabase
        .from("ai_clients")
        .update({
          business_name: business.trim(),
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          country: country.trim() || null,
          website: website.trim() || null,
          industry: industry.trim() || null,
          notes: notes.trim() || null,
          branding,
        } as never)
        .eq("id", client.id);
      if (error) throw error;
      await supabase.from("audit_log").insert({
        actor_id: user?.id ?? null,
        actor_email: user?.email ?? null,
        action: "ai_client.update",
        entity: "ai_clients",
        entity_id: client.id,
      } as never);
    },
    onSuccess: () => {
      toast.success("Client updated");
      void qc.invalidateQueries({ queryKey: ["ai-clients"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("ai_clients")
        .update({ status } as never)
        .eq("id", client.id);
      if (error) throw error;
    },
    onSuccess: (_v, status) => {
      toast.success(`Client ${status}`);
      void qc.invalidateQueries({ queryKey: ["ai-clients"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Business name</Label>
          <Input className="mt-1" value={business} onChange={(e) => setBusiness(e.target.value)} />
        </div>
        <div>
          <Label>Industry</Label>
          <Input className="mt-1" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </div>
        <div>
          <Label>Contact name</Label>
          <Input className="mt-1" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div>
          <Label>Contact email</Label>
          <Input className="mt-1" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div>
          <Label>Contact phone</Label>
          <Input className="mt-1" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
        <div>
          <Label>Country</Label>
          <Input className="mt-1" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div>
          <Label>Website</Label>
          <Input className="mt-1" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <Label>WhatsApp number</Label>
          <Input className="mt-1" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="234…" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-4">
        <p className="text-sm font-semibold">Widget branding</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>AI name</Label>
            <Input className="mt-1" value={aiName} onChange={(e) => setAiName(e.target.value)} placeholder="e.g. Acme Assistant" />
          </div>
          <div>
            <Label>Primary color</Label>
            <Input className="mt-1" value={color} onChange={(e) => setColor(e.target.value)} placeholder="#4f46e5" />
          </div>
        </div>
        <div className="mt-4">
          <Label>Welcome message</Label>
          <Textarea className="mt-1" value={welcome} onChange={(e) => setWelcome(e.target.value)} />
        </div>
        <div className="mt-4">
          <Label>Suggested questions (one per line)</Label>
          <Textarea className="mt-1" value={suggested} onChange={(e) => setSuggested(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => update.mutate()} disabled={update.isPending}>Save changes</Button>
        {client.status !== "active" && (
          <Button variant="outline" onClick={() => setStatus.mutate("active")}>Activate</Button>
        )}
        {client.status !== "suspended" && (
          <Button variant="outline" onClick={() => setStatus.mutate("suspended")}>Suspend</Button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Create client ---------------- */

function CreateClientDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      if (!businessName.trim()) throw new Error("Business name is required.");
      const { data, error } = await supabase
        .from("ai_clients")
        .insert({
          business_name: businessName.trim(),
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          country: country.trim() || null,
          website: website.trim() || null,
          industry: industry.trim() || null,
          status: "pending",
        } as never)
        .select("*")
        .single();
      if (error) throw error;
      // seed a default config row
      await supabase.from("ai_client_config").insert({ client_id: (data as unknown as Client).id } as never);
      return data as unknown as Client;
    },
    onSuccess: (c) => {
      toast.success(`Client created: ${c.client_code}`);
      onCreated(c.id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New AI Client</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Business name *</Label>
            <Input className="mt-1" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <Label>Contact name</Label>
            <Input className="mt-1" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input className="mt-1" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div>
            <Label>Contact phone</Label>
            <Input className="mt-1" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div>
            <Label>Country</Label>
            <Input className="mt-1" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <Label>Website</Label>
            <Input className="mt-1" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <Label>Industry</Label>
            <Input className="mt-1" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Create client</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Re-export to satisfy the Bot icon import in admin shell without a circular dep.
export const _icon = Bot;
