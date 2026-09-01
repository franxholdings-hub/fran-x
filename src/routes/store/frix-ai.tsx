import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bot, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/site/PageHero";
import { AuthGateNotice } from "@/components/site/AuthGateNotice";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { getSubscriptionsByType, formatNaira } from "@/lib/digital-store/catalog";
import { PHOTOS } from "@/lib/photos";

export const Route = createFileRoute("/store/frix-ai")({
  head: () => ({
    meta: [
      { title: "FRIX AI Subscriptions | FRAN-X Digital Store" },
      { name: "description", content: "FRIX AI subscription plans with clearly defined usage limits and features." },
    ],
  }),
  component: FrixAiPage,
});

function FrixAiPage() {
  const { user } = useAuth();
  const { add } = useCart();
  const plans = getSubscriptionsByType("frix_ai");
  const [busy, setBusy] = useState<string | null>(null);

  const subscribe = (planId: string, name: string, price: number, code: string) => {
    if (!user) {
      toast.message("Sign in to subscribe");
      return;
    }
    setBusy(planId);
    add({
      slug: code,
      name,
      price,
      currency: "NGN",
      category: "frix-ai",
      kind: "subscription",
      subCode: code,
    });
    setBusy(null);
  };

  return (
    <>
      <PageHero
        eyebrow="FRIX AI Subscriptions"
        title="AI capabilities with clear, honest limits"
        subtitle="Choose a FRIX AI plan that matches your needs. Every plan lists exactly what it includes — no exaggerated claims."
        photo={PHOTOS.ai}
      />

      <section className="container-x py-6 sm:py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-panel flex flex-col rounded-xl p-5 ${
                plan.featured ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-500">
                  <Bot className="h-[1.15rem] w-[1.15rem]" />
                </span>
                {plan.badge && (
                  <Badge variant="outline" className={plan.featured ? "border-primary/40 text-primary" : ""}>
                    {plan.badge}
                  </Badge>
                )}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{plan.name}</h3>
              <div className="mt-2 flex items-end gap-1">
                <span className="font-display text-2xl font-semibold">{formatNaira(plan.monthlyPrice)}</span>
                <span className="mb-1 text-sm text-muted-foreground">/month</span>
              </div>
              {plan.usageLimit && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Up to {plan.usageLimit.toLocaleString()} conversations / month
                </p>
              )}

              <ul className="mt-4 flex-1 space-y-2">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {user ? (
                  <Button
                    className="w-full"
                    disabled={busy === plan.id}
                    onClick={() => subscribe(plan.id, plan.name, plan.monthlyPrice, plan.code)}
                  >
                    {busy === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/auth">Sign in to subscribe</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="mt-8">
            <AuthGateNotice />
          </div>
        )}

        <div className="glass-panel mt-10 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
            <div>
              <h3 className="font-display text-base font-semibold">About FRIX AI limits</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Usage limits reflect what the FRIX AI system actually supports. Conversation counts are monthly and
                reset each billing cycle. If FRIX AI already has an existing pricing configuration, it is preserved
                unless changed by an administrator.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
