import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHero } from "@/components/site/PageHero";
import { ChatPanel } from "@/components/site/ChatPanel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { INQUIRY_STATUSES } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | FRAN-X Holdings" },
      { name: "description", content: "FRAN-X internal dashboard for inquiries, users and messages." },
      { property: "og:title", content: "Admin Dashboard | FRAN-X Holdings" },
      { property: "og:description", content: "FRAN-X internal dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [thread, setThread] = useState<string | null>(null);

  const stats = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [visits, users, inquiries, messages] = await Promise.all([
        supabase.from("site_visits").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
      ]);
      return {
        visits: visits.count ?? 0,
        users: users.count ?? 0,
        inquiries: inquiries.count ?? 0,
        messages: messages.count ?? 0,
      };
    },
  });

  const inquiries = useQuery({
    queryKey: ["admin-inquiries"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const threads = useQuery({
    queryKey: ["admin-threads"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("thread_user_id, body, created_at, from_admin")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const seen = new Map<string, { body: string; created_at: string; from_admin: boolean }>();
      for (const m of data) if (!seen.has(m.thread_user_id)) seen.set(m.thread_user_id, m);
      return Array.from(seen.entries());
    },
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    void queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
  };

  if (loading) return null;
  if (!isAdmin) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">Restricted area</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This dashboard is available to FRAN-X administrators only.
        </p>
      </div>
    );
  }

  const unread = threads.data?.filter(([, m]) => !m.from_admin).length ?? 0;

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title="FRAN-X control centre"
        subtitle="Analytics, inquiries, client accounts and live messages in one place."
      />
      <section className="container-x py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total visits", stats.data?.visits],
            ["Total users", stats.data?.users],
            ["Inquiries", stats.data?.inquiries],
            ["Messages", stats.data?.messages],
          ].map(([label, value]) => (
            <div key={String(label)} className="glass-panel rounded-xl p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <p className="mt-3 font-display text-3xl font-semibold">{value ?? "—"}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold">Inquiries &amp; CRM</h2>
            <div className="mt-6 space-y-4">
              {inquiries.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
              ) : (inquiries.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No inquiries yet.</p>
              ) : (
                (inquiries.data ?? []).map((row) => (
                  <article key={row.id} className="rounded-xl border border-border bg-surface/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs text-primary">{row.reference}</p>
                      <Badge variant="outline">{row.kind}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {row.full_name} · {row.email}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{row.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <select
                        value={row.status}
                        onChange={(e) => void updateStatus(row.id, e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                      >
                        {INQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {row.user_id ? (
                        <button
                          type="button"
                          onClick={() => setThread(row.user_id)}
                          className="text-xs text-primary underline"
                        >
                          Open chat with client
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">Conversations</h2>
                {unread > 0 ? <Badge>{unread} active</Badge> : null}
              </div>
              <div className="mt-4 space-y-2">
                {(threads.data ?? []).map(([id, last]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setThread(id)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      thread === id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <p className="truncate text-xs text-muted-foreground">{id}</p>
                    <p className="mt-1 truncate text-sm">{last.body}</p>
                  </button>
                ))}
                {(threads.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No conversations yet.</p>
                ) : null}
              </div>
            </div>
            {thread && user ? (
              <ChatPanel
                threadUserId={thread}
                currentUserId={user.id}
                asAdmin
                title="Admin conversation"
              />
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}