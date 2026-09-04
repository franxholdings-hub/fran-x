import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { formatMoney } from "@/lib/ai-integration";

const TITLE = "Pricing & Plans | FRAN-X Technologies";
const DESCRIPTION =
  "Start free with the FRAN-X Explorer 7-day trial, then subscribe to unlock premium FRAN-X services and AI capabilities.";

type Plan = {
  id: string;
  code: string;
  name: string;
  setup_fee: number;
  monthly_price: number;
  currency: string;
  usage_limit: number;
  features: string[] | string;
  is_active: boolean;
  sort_order: number;
  billing_interval: string;
  trial_days: number;
  description: string;
  product_type: string;
};

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { user } = useAuth();
  const sub = useSubscription();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

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

  // Handle Paystack return: ?reference=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (!reference) return;
    window.history.replaceState({}, "", "/pricing");
    (async () => {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success("Payment verified — your subscription is active!");
          void qc.invalidateQueries({ queryKey: ["subscription"] });
        } else {
          toast.error(json.error || `Payment not successful (${json.status || "unknown"})`);
        }
      } catch {
        toast.error("Could not verify payment. If you were charged, contact support.");
      }
    })();
  }, [qc]);

  const startTrial = async () => {
    if (!user) return;
    setBusy("explorer");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/subscription/start-trial", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not start trial");
      toast.success("Your 7-day Explorer trial has started!");
      void qc.invalidateQueries({ queryKey: ["subscription"] });
    } catch (e: any) {
      toast.error(e.message || "Could not start trial");
    } finally {
      setBusy(null);
    }
  };

  const subscribe = async (plan: Plan) => {
    if (!user) {
      toast.message("Sign in to subscribe");
      return;
    }
    if (plan.billing_interval === "free") {
      await startTrial();
      return;
    }
    setBusy(plan.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ planId: plan.id, email: user.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not start payment");
      if (json.authorization_url) window.location.href = json.authorization_url;
    } catch (e: any) {
      toast.error(e.message || "Could not start payment");
      setBusy(null);
    }
  };

  const currentPlanCode = sub.data?.plan?.code;
  const isOnTrial = sub.data?.isTrial;

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Choose your FRAN-X plan"
        subtitle="Start free for 7 days. Upgrade anytime to unlock premium services and AI."
      />
      <section className="container-x py-8 sm:py-10">
        {sub.data && sub.data.status !== "none" && (
          <div className="glass-panel mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl p-5">
            <div>
              <p className="text-sm text-muted-foreground">Your current plan</p>
              <p className="font-display text-lg font-semibold">
                {sub.data.plan?.name ?? "—"}
                {isOnTrial && sub.data.trialDaysLeft > 0 && (
                  <Badge variant="outline" className="ml-3 border-primary/40 text-primary">
                    Trial · {sub.data.trialDaysLeft} days left
                  </Badge>
                )}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">{sub.data.status}</Badge>
          </div>
        )}

        {plans.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(plans.data ?? []).map((plan) => {
              const features = Array.isArray(plan.features)
                ? plan.features
                : (() => {
                    try { return JSON.parse(plan.features) as string[]; } catch { return []; }
                  })();
              const isCurrent = currentPlanCode === plan.code;
              const isFree = plan.billing_interval === "free";
              const priceLabel = isFree
                ? "Free"
                : formatMoney(Number(plan.monthly_price), plan.currency) +
                  (plan.billing_interval === "yearly" ? "/yr" : "/mo");
              return (
                <div
                  key={plan.id}
                  className={`glass-panel flex flex-col rounded-xl p-6 ${
                    plan.code === "professional" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                    {plan.code === "professional" && (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        <Sparkles className="mr-1 h-3 w-3" /> Popular
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <p className="mt-4 font-display text-3xl font-semibold">{priceLabel}</p>
                  {!isFree && Number(plan.setup_fee) > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      + {formatMoney(Number(plan.setup_fee), plan.currency)} setup
                    </p>
                  )}
                  {plan.trial_days > 0 && (
                    <p className="mt-1 text-xs text-primary">{plan.trial_days}-day free trial</p>
                  )}

                  <ul className="mt-4 flex-1 space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5">
                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full">Current plan</Button>
                    ) : isFree && user ? (
                      isOnTrial ? (
                        <Button variant="outline" disabled className="w-full">Trial active</Button>
                      ) : (
                        <Button
                          className="w-full"
                          disabled={busy === "explorer"}
                          onClick={() => subscribe(plan)}
                        >
                          {busy === "explorer" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start free trial"}
                        </Button>
                      )
                    ) : (
                      <Button
                        className="w-full"
                        disabled={busy === plan.id}
                        onClick={() => subscribe(plan)}
                      >
                        {busy === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!user && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="font-medium text-primary underline">Sign in</Link> to start your free trial or subscribe.
          </p>
        )}
      </section>
    </>
  );
}
