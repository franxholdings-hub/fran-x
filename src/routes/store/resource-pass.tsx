import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Crown, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/site/PageHero";
import { AuthGateNotice } from "@/components/site/AuthGateNotice";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { getSubscriptionsByType, formatNaira } from "@/lib/digital-store/catalog";
import { PHOTOS } from "@/lib/photos";

export const Route = createFileRoute("/store/resource-pass")({
  head: () => ({
    meta: [
      { title: "FRAN-X Resource Pass | Premium Digital Subscription" },
      { name: "description", content: "Recurring premium access to selected business templates, e-books and financial guides, plus discounts." },
    ],
  }),
  component: ResourcePass,
});

function ResourcePass() {
  const { user } = useAuth();
  const { add } = useCart();
  const plans = getSubscriptionsByType("resource_pass");
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
      category: "resources",
      kind: "subscription",
      subCode: code,
    });
    setBusy(null);
  };

  return (
    <>
      <PageHero
        eyebrow="FRAN-X Resource Pass"
        title="Unlock the premium resource library"
        subtitle="Recurring access to a rotating library of premium business templates, selected e-books and financial guides — plus member discounts."
        photo={PHOTOS.opportunities}
      />

      <section className="container-x py-6 sm:py-8">
        {/* Dark "premium zone" cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => {
            const isAnnual = plan.annualPrice > 0;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const period = isAnnual ? "/year" : "/month";
            return (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-2xl border p-8 ${
                  plan.featured
                    ? "border-metal/40 bg-foreground text-background"
                    : "border-border bg-surface/40 text-foreground"
                }`}
              >
                {plan.badge && (
                  <Badge
                    className={`absolute top-5 right-5 border-0 ${
                      plan.featured ? "bg-metal text-background" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {plan.badge}
                  </Badge>
                )}
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-metal/30 bg-metal/10 text-metal">
                  <Crown className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-3xl font-semibold">{formatNaira(price)}</span>
                  <span className={`mb-1 text-sm ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}>
                    {period}
                  </span>
                </div>
                {isAnnual && (
                  <p className="mt-1 text-sm text-emerald-400">
                    ≈ 2 months savings vs monthly billing
                  </p>
                )}

                <ul className="mt-6 space-y-2.5">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span className={plan.featured ? "text-background/80" : ""}>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {user ? (
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.featured ? "secondary" : "default"}
                      disabled={busy === plan.id}
                      onClick={() => subscribe(plan.id, plan.name, price, plan.code)}
                    >
                      {busy === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Subscribe {period === "/year" ? "annually" : "monthly"}</>}
                    </Button>
                  ) : (
                    <Button asChild className="w-full" size="lg" variant={plan.featured ? "secondary" : "default"}>
                      <Link to="/auth">Sign in to subscribe</Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!user && (
          <div className="mt-8">
            <AuthGateNotice />
          </div>
        )}

        {/* Comparison note */}
        <div className="glass-panel mt-8 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-metal" />
            <div>
              <h3 className="font-display text-base font-semibold">How the Resource Pass works</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Subscription access remains active only while your subscription is valid. You do not permanently own
                subscription-only products unless you separately purchase them. One-time products you buy
                individually remain yours forever — even if you cancel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
