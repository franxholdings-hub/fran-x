import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Send, Compass, ClipboardList, Sparkles, Building2, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection, StatCard, Empty, toneForStatus } from "@/components/admin/kit";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import type { SectionKey } from "@/components/dashboard/DashboardShell";

const RECOMMENDED = [
  { title: "Lekki Phase 1 — 4 Bedroom Duplex", sector: "Real Estate", value: "₦185,000,000", icon: Building2 },
  { title: "Tokunbo Toyota Camry 2019", sector: "Automotive", value: "₦9,500,000", icon: Car },
  { title: "Logistics partnership — Lagos axis", sector: "Business", value: "Open", icon: Compass },
];

const ACTIVITY = [
  { label: "Inquiry FX-2041 received a response", time: "2 hours ago", tone: "completed" },
  { label: "You saved an opportunity", time: "Yesterday", tone: "pending" },
  { label: "FRIX AI conversation started", time: "2 days ago", tone: "new" },
];

export function HomeSection({ onNavigate }: { onNavigate: (k: SectionKey) => void }) {
  const { user } = useAuth();
  const sub = useSubscription();

  const inquiries = useQuery({
    queryKey: ["my-inquiries-count", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { count } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count ?? 0;
    },
  });

  const planName = sub.data?.plan?.name ?? "FRAN-X Explorer";
  const trialDays = sub.data?.trialDaysLeft ?? 0;
  const isTrial = sub.data?.isTrial;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Current plan / trial */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-xl p-4 sm:p-6">
        <div>
          <p className="eyebrow">Current plan</p>
          <p className="mt-2 font-display text-2xl font-semibold">{planName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isTrial
              ? `Free trial active — ${trialDays} day${trialDays === 1 ? "" : "s"} remaining.`
              : sub.data?.status === "active"
                ? "Subscription active."
                : "Explore FRAN-X with limited access."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onNavigate("subscription")}>
            View plan
          </Button>
          <Button asChild>
            <Link to="/pricing">Upgrade</Link>
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="My inquiries" value={inquiries.isLoading ? "—" : inquiries.data ?? 0} />
        <StatCard label="Saved opportunities" value={3} hint="mock" />
        <StatCard label="AI conversations" value={2} hint="mock" />
        <StatCard label="Trial days left" value={isTrial ? trialDays : "—"} />
      </div>

      {/* Quick actions */}
      <PanelSection title="Quick actions" description="Jump straight into the most common FRAN-X actions.">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Button asChild variant="outline" className="justify-start">
            <Link to="/request"><Send className="h-4 w-4" /> Request a service</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/opportunities"><Compass className="h-4 w-4" /> Submit opportunity</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/services"><ArrowRight className="h-4 w-4" /> Explore services</Link>
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => onNavigate("frix")}>
            <Sparkles className="h-4 w-4" /> Open FRIX AI
          </Button>
        </div>
      </PanelSection>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <PanelSection title="Recent activity" description="What has happened across your account.">
          <ul className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2.5 text-sm sm:px-4 sm:py-3">
                <span className="min-w-0">{a.label}</span>
                <Badge variant="outline" className={`shrink-0 ${toneForStatus(a.tone)}`}>{a.time}</Badge>
              </li>
            ))}
          </ul>
        </PanelSection>

        {/* Recommended opportunities */}
        <PanelSection
          title="Recommended opportunities"
          description="Curated FRAN-X opportunities matching your interests."
          action={
            <Button size="sm" variant="ghost" onClick={() => onNavigate("opportunities")}>
              View all
            </Button>
          }
        >
          <div className="space-y-3">
            {RECOMMENDED.map((o) => (
              <div key={o.title} className="flex items-center gap-3 rounded-lg border border-border bg-surface/40 p-3 sm:p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/30 text-primary">
                  <o.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.sector}</p>
                </div>
                <Badge variant="outline">{o.value}</Badge>
              </div>
            ))}
          </div>
        </PanelSection>
      </div>
    </div>
  );
}
