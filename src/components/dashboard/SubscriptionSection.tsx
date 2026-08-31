import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PanelSection, Empty } from "@/components/admin/kit";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

type Plan = {
  id: string;
  code: string;
  name: string;
  monthly_price: number;
  currency: string;
  billing_interval: string;
  trial_days: number;
  features: string[] | string;
  is_active: boolean;
  sort_order: number;
};

function parseFeatures(v: string[] | string): string[] {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v) as string[]; } catch { return []; }
}

export function SubscriptionSection() {
  const sub = useSubscription();

  const plans = useQuery({
    queryKey: ["plans-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Plan[];
    },
  });

  const plan = sub.data?.plan;
  const features = plan ? parseFeatures(plan.features as string[] | string) : [];
  const trialDays = sub.data?.trialDaysLeft ?? 0;
  const isTrial = sub.data?.isTrial;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PanelSection title="Current plan" description="Your active FRAN-X subscription (display only).">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-semibold">{plan?.name ?? "FRAN-X Explorer"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan?.billing_interval === "free" ? "Free plan" : `₦${Number(plan?.monthly_price ?? 0).toLocaleString()} / ${plan?.billing_interval ?? "mo"}`}
            </p>
            <Badge variant="outline" className="mt-2 capitalize">{sub.data?.status ?? "trial"}</Badge>
          </div>
          {isTrial && (
            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Trial countdown</span>
                <span>{trialDays} days left</span>
              </div>
              <Progress value={(trialDays / 7) * 100} />
            </div>
          )}
        </div>
      </PanelSection>

      <PanelSection title="Features included" description="What your current plan unlocks.">
        {features.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No feature list available for this plan.</Empty>
        )}
      </PanelSection>

      <PanelSection
        title="Available plans"
        description="Upgrade to unlock premium services and AI capabilities."
        action={
          <Button asChild>
            <Link to="/pricing"><Sparkles className="h-4 w-4" /> Upgrade</Link>
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {(plans.data ?? []).map((p) => {
            const isCurrent = plan?.code === p.code;
            return (
              <div key={p.id} className={`rounded-xl border p-4 sm:p-5 ${isCurrent ? "border-primary bg-primary/5" : "border-border bg-surface/40"}`}>
                <p className="font-display text-sm font-semibold">{p.name}</p>
                <p className="mt-1 text-lg font-semibold">
                  {p.billing_interval === "free" ? "Free" : `₦${Number(p.monthly_price).toLocaleString()}`}
                </p>
                {isCurrent && <Badge variant="outline" className="mt-2 border-primary/40 text-primary">Current</Badge>}
              </div>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
}
