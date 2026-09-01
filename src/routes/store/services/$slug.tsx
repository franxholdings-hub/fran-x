import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/site/PageHero";
import { AuthGateNotice } from "@/components/site/AuthGateNotice";
import { ValueMatrix } from "@/components/store/ProductCard";
import { useAuth } from "@/hooks/useAuth";
import { getServiceBySlug, formatNaira } from "@/lib/digital-store/catalog";
import { submitInquiry } from "@/lib/inquiries";
import { PHOTOS } from "@/lib/photos";

export const Route = createFileRoute("/store/services/$slug")({
  head: () => ({
    meta: [
      { title: "Digital Service | FRAN-X Digital Store" },
      { name: "description", content: "Professional digital service from FRAN-X." },
    ],
  }),
  component: ServiceDetail,
});

const BUDGETS = ["Under ₦50,000", "₦50,000 – ₦150,000", "₦150,000 – ₦500,000", "₦500,000+", "Not sure yet"];
const TIMELINES = ["ASAP", "1–2 weeks", "1 month", "1–3 months", "Flexible"];

function ServiceDetail() {
  const { slug } = Route.useParams();
  const service = getServiceBySlug(slug);
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [form, setForm] = useState({
    goals: "",
    budget: "",
    timeline: "",
    full_name: "",
    email: "",
    phone: "",
    company: "",
  });

  if (!service) {
    return (
      <div className="container-x py-12 text-center">
        <h1 className="text-2xl font-semibold">Service not found</h1>
        <Button asChild className="mt-4">
          <Link to="/store/services">Back to services</Link>
        </Button>
      </div>
    );
  }

  const photo = PHOTOS[service.cover];
  const isCustom = service.customQuoteOnly || service.billingType === "custom";

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!user) {
      toast.message("Sign in to submit a service request");
      return;
    }
    setSubmitting(true);
    try {
      const ref = await submitInquiry({
        kind: "service",
        category: service.groupLabel,
        service: service.name,
        full_name: form.full_name || user.email?.split("@")[0] || "Client",
        email: form.email || user.email || "",
        phone: form.phone || null,
        company: form.company || null,
        description: `Service: ${service.name}\nGoals: ${form.goals}\nBudget: ${form.budget}\nTimeline: ${form.timeline}`,
        budget: form.budget || null,
        timeline: form.timeline || null,
        details: { service_slug: service.slug, starting_price: service.priceFrom, billing_type: service.billingType },
      });
      setReference(ref);
      toast.success("Service request submitted!");
    } catch (e: any) {
      toast.error(e.message || "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <div className="container-x py-8">
        <div className="glass-panel mx-auto max-w-lg rounded-xl p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Check className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold">Request received</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your reference ID is <span className="font-mono font-semibold text-primary">{reference}</span>. Our team will review your brief and reach out shortly.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link to="/portal" hash="inquiries">Track in dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/store/services">Browse more services</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={service.groupLabel}
        title={service.name}
        subtitle={service.description}
        photo={photo}
      />

      <section className="container-x py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Scope of work */}
          <div>
            <h2 className="font-display text-xl font-semibold">Scope of work</h2>
            <p className="mt-1 text-sm text-muted-foreground">Exactly what's included before you submit a request.</p>
            <div className="mt-6 rounded-xl border border-border bg-surface/40 p-5">
              <ValueMatrix items={service.whatsIncluded} />
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {service.deliveryEstimate}
              </span>
              <Badge variant="outline" className="capitalize">{service.billingType.replace("_", " ")}</Badge>
            </div>
          </div>

          {/* Briefing gateway */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {service.billingLabel}
                  </p>
                  <p className="font-display text-2xl font-semibold">{formatNaira(service.priceFrom)}</p>
                </div>
                {isCustom && <Badge variant="outline" className="border-metal/50 text-metal">Custom quote</Badge>}
              </div>

              {!user ? (
                <div className="mt-5">
                  <AuthGateNotice />
                  <Button asChild className="mt-4 w-full">
                    <Link to="/auth">Sign in to continue</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Step indicator */}
                  <div className="mt-6 flex items-center gap-2 text-xs">
                    {["Goals", "Timeline", "Contact"].map((label, i) => (
                      <span
                        key={label}
                        className={`flex-1 rounded-md px-2 py-1 text-center font-medium ${
                          step === i ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {i + 1}. {label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 space-y-4">
                    {step === 0 && (
                      <div>
                        <Label>What are your goals for this project?</Label>
                        <Textarea
                          className="mt-1.5"
                          rows={4}
                          value={form.goals}
                          onChange={(e) => set("goals", e.target.value)}
                          placeholder="Describe what you want to achieve…"
                        />
                        <Label className="mt-4 block">Budget range</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {BUDGETS.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => set("budget", b)}
                              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                form.budget === b
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                        <Button className="mt-5 w-full" onClick={() => setStep(1)} disabled={form.goals.trim().length < 5}>
                          Continue <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {step === 1 && (
                      <div>
                        <Label>Preferred timeline</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {TIMELINES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => set("timeline", t)}
                              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                form.timeline === t
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        <div className="mt-5 flex gap-2">
                          <Button variant="outline" onClick={() => setStep(0)}>
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button className="flex-1" onClick={() => setStep(2)} disabled={!form.timeline}>
                            Continue <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-3">
                        <div>
                          <Label>Full name</Label>
                          <Input className="mt-1.5" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Your name" />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input className="mt-1.5" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" defaultValue={user.email ?? ""} />
                        </div>
                        <div>
                          <Label>Phone (optional)</Label>
                          <Input className="mt-1.5" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234…" />
                        </div>
                        <div>
                          <Label>Company (optional)</Label>
                          <Input className="mt-1.5" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company name" />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button variant="outline" onClick={() => setStep(1)}>
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button className="flex-1" onClick={submit} disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isCustom ? "Request a quote" : "Submit request"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <p className="mt-3 px-1 text-xs text-muted-foreground">
              {isCustom
                ? "Complex projects are quoted individually after we review your brief."
                : "Starting price shown. Final pricing depends on your project scope."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
