import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHero } from "@/components/site/PageHero";
import { ChatPanel } from "@/components/site/ChatPanel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal | FRAN-X Holdings" },
      {
        name: "description",
        content: "Track your FRAN-X requests, review status updates and chat with the FRAN-X team.",
      },
      { property: "og:title", content: "Client Portal | FRAN-X Holdings" },
      { property: "og:description", content: "Track your FRAN-X requests and chat with our team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Portal,
});

function Portal() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["my-inquiries", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHero
        eyebrow="Client portal"
        title="Your requests and conversations"
        subtitle="Track every request you have submitted and message the FRAN-X team directly."
      />
      <section className="container-x grid gap-8 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">My requests</h2>
            <Button asChild size="sm">
              <Link to="/request">New request</Link>
            </Button>
          </div>
          <div className="mt-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : (data ?? []).length === 0 ? (
              <div className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">
                You have not submitted a request yet.
              </div>
            ) : (
              (data ?? []).map((row) => (
                <article key={row.id} className="rounded-xl border border-border bg-surface/40 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs text-primary">{row.reference}</p>
                    <Badge variant="outline">{row.status}</Badge>
                  </div>
                  <p className="mt-2 font-display text-sm font-semibold">
                    {row.category ?? row.kind} {row.service ? `· ${row.service}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{row.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Submitted {new Date(row.created_at).toLocaleString()}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
        {user ? (
          <ChatPanel threadUserId={user.id} currentUserId={user.id} asAdmin={false} />
        ) : null}
      </section>
    </>
  );
}