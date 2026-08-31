import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Loader2, Lock, Minus, ShieldCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/site/PageHero";
import { AuthGateNotice } from "@/components/site/AuthGateNotice";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useQueryClient } from "@tanstack/react-query";
import { formatNaira } from "@/lib/digital-store/catalog";
import { PHOTOS } from "@/lib/photos";

export const Route = createFileRoute("/store/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | FRAN-X Digital Store" },
      { name: "description", content: "Secure checkout for FRAN-X digital products and subscriptions." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const { items, remove, total, clear, count } = useCart();
  const qc = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  // Handle Paystack return: ?reference=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (!reference) return;
    window.history.replaceState({}, "/store/checkout");
    (async () => {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const json = await res.json();
        if (json.success) {
          setDone(true);
          clear();
          toast.success("Payment verified — your order is complete!");
          void qc.invalidateQueries();
        } else {
          toast.error(json.error || `Payment not successful (${json.status || "unknown"})`);
        }
      } catch {
        toast.error("Could not verify payment. If you were charged, contact support.");
      }
    })();
  }, [qc, clear]);

  const checkout = async () => {
    if (!user) {
      toast.message("Sign in to checkout");
      return;
    }
    setPaying(true);
    try {
      const { data: { session } } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not start payment");
      if (json.authorization_url) window.location.href = json.authorization_url;
    } catch (e: any) {
      toast.error(e.message || "Could not start payment");
      setPaying(false);
    }
  };

  if (done) {
    return (
      <div className="container-x py-20">
        <div className="glass-panel mx-auto max-w-lg rounded-xl p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Check className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold">Order complete</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment was verified. Your digital products are now available in your library.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/portal" hash="library">Go to my library</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/store">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Complete your purchase"
        subtitle="Secure payment via Paystack. Every payment is verified server-side before access is granted."
        photo={PHOTOS.technology}
      />

      <section className="container-x py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Order summary */}
          <div>
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            {count === 0 ? (
              <div className="glass-panel mt-5 rounded-xl p-8 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">Your cart is empty.</p>
                <Button asChild className="mt-4">
                  <Link to="/store">Browse the store</Link>
                </Button>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.slug}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface/40 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {item.kind === "subscription" ? "Subscription" : item.category.replace("-", " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-semibold">{formatNaira(item.price)}</span>
                      <button
                        type="button"
                        onClick={() => remove(item.slug)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Payment panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg font-semibold">{formatNaira(total)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Taxes & fees</span>
                <span>Included</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-medium">Total</span>
                <span className="font-display text-2xl font-semibold">{formatNaira(total)}</span>
              </div>

              {!user ? (
                <div className="mt-6">
                  <AuthGateNotice />
                  <Button asChild className="mt-4 w-full">
                    <Link to="/auth">Sign in to checkout</Link>
                  </Button>
                </div>
              ) : (
                <Button
                  className="mt-6 w-full"
                  size="lg"
                  disabled={paying || count === 0}
                  onClick={checkout}
                >
                  {paying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Pay {formatNaira(total)} via Paystack
                    </>
                  )}
                </Button>
              )}

              <div className="mt-5 space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Server-side payment verification
                </p>
                <p className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  Access granted only after verification
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  One-time purchases are yours forever
                </p>
              </div>
              <Badge variant="outline" className="mt-4 border-primary/30 text-primary">
                Secured by Paystack
              </Badge>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
