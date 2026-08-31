// Service Request Dashboard — "My Services".
//
// Reads the user's service requests from the existing inquiries table
// (kind = "service"), so it works without the digital_store migration.

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Briefcase, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection, Empty, toneForStatus } from "@/components/admin/kit";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Inquiry = {
  id: string;
  reference: string;
  service: string | null;
  category: string | null;
  description: string;
  status: string;
  budget: string | null;
  timeline: string | null;
  assigned_to: string | null;
  created_at: string;
};

const STATUS_FLOW = ["New", "Reviewing", "In Progress", "Awaiting Customer", "Completed"];

export function ServicesSection() {
  const { user } = useAuth();

  const requests = useQuery({
    queryKey: ["my-service-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("user_id", user!.id)
        .eq("kind", "service")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Inquiry[];
    },
  });

  return (
    <PanelSection
      title="My Services"
      description="Track your digital service requests — from submission to delivery."
      action={
        <Button asChild size="sm">
          <Link to="/store/services">Request a service</Link>
        </Button>
      }
    >
      {requests.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : requests.data?.length ? (
        <div className="space-y-3">
          {requests.data.map((r) => {
            const stepIdx = STATUS_FLOW.indexOf(r.status);
            return (
              <div key={r.id} className="rounded-xl border border-border bg-surface/40 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs text-primary">{r.reference}</p>
                  <Badge variant="outline" className={toneForStatus(r.status)}>{r.status}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{r.service ?? r.category ?? "Service request"}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  {r.timeline && <span>Timeline: {r.timeline}</span>}
                  {r.budget && <span>Budget: {r.budget}</span>}
                  {r.assigned_to && <span>Assigned: {r.assigned_to}</span>}
                </div>

                {/* Status progress */}
                {stepIdx >= 0 && (
                  <div className="mt-4 flex items-center gap-1">
                    {STATUS_FLOW.map((s, i) => (
                      <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= stepIdx ? "bg-primary" : "bg-border"
                        }`}
                        title={s}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty>
          No service requests yet.{" "}
          <Link to="/store/services" className="font-medium text-primary underline">
            Explore digital services
          </Link>
        </Empty>
      )}
    </PanelSection>
  );
}
