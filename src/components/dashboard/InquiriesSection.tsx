import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelSection, Empty, toneForStatus } from "@/components/admin/kit";
import { ChatPanel } from "@/components/site/ChatPanel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";

type Inquiry = {
  id: string;
  reference: string;
  status: string;
  kind: string;
  category: string | null;
  service: string | null;
  description: string;
  created_at: string;
};

// Map FRAN-X inquiry statuses to the dashboard's display statuses.
function displayStatus(s: string): string {
  const v = s.toLowerCase();
  if (v.includes("new") || v.includes("pending")) return "Pending";
  if (v.includes("review")) return "In Review";
  if (v.includes("respond") || v.includes("contact") || v.includes("qualified")) return "Responded";
  if (v.includes("closed") || v.includes("declined") || v.includes("won") || v.includes("lost")) return "Closed";
  return s;
}

export function InquiriesSection() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["my-inquiries", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Inquiry[];
    },
  });

  return (
    <div className="space-y-6">
      <PanelSection
        title="My Inquiries"
        description="Every request you have submitted to FRAN-X, with live status."
        action={
          <Button asChild size="sm">
            <Link to="/request">New request</Link>
          </Button>
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">
            You have not submitted a request yet.
            <div className="mt-4">
              <Button asChild size="sm">
                <Link to="/request">Request a service</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data!.map((row) => {
              const status = displayStatus(row.status);
              return (
                <article key={row.id} className="rounded-xl border border-border bg-surface/40 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs text-primary">{row.reference}</p>
                    <Badge variant="outline" className={toneForStatus(status)}>{status}</Badge>
                  </div>
                  <p className="mt-2 font-display text-sm font-semibold">
                    {row.category ?? row.kind}{row.service ? ` · ${row.service}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{row.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Submitted {new Date(row.created_at).toLocaleString()}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </PanelSection>

      {user ? (
        <PanelSection title="Message FRAN-X" description="Chat directly with the FRAN-X team about your requests.">
          <ChatPanel threadUserId={user.id} currentUserId={user.id} asAdmin={false} />
        </PanelSection>
      ) : null}
    </div>
  );
}
