import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/site/PageHero";
import { AuthGateNotice } from "@/components/site/AuthGateNotice";
import { useAuth } from "@/hooks/useAuth";
import { REQUEST_CATEGORIES, COMPLIANCE_NOTE } from "@/lib/site";
import { baseInquirySchema, submitInquiry } from "@/lib/inquiries";
import { PHOTOS } from "@/lib/photos";

const TITLE = "Request a Service | FRAN-X Holdings";
const DESCRIPTION =
  "Submit a structured service request to FRAN-X Holdings and receive a reference ID, review and proposal from our team.";

export const Route = createFileRoute("/request")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { service?: string; category?: string } => ({
    service: typeof search['service'] === "string" ? (search['service'] as string) : "",
    category: typeof search['category'] === "string" ? (search['category'] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestPage,
});

const STEPS = ["Category", "Details", "Contact", "Review"];

function RequestPage() {
  const { service, category: presetCategory } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    category: presetCategory || "",
    description: "",
    budget: "",
    timeline: "",
    full_name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    contact_method: "Email",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const next = () => {
    if (step === 0 && !form.category) {
      toast.error("Please choose a category");
      return;
    }
    if (step === 1 && form.description.trim().length < 10) {
      setErrors({ description: "Please describe your requirement (min. 10 characters)" });
      return;
    }
    if (step === 2) {
      const parsed = baseInquirySchema.safeParse(form);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
        setErrors(fieldErrors);
        return;
      }
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const ref = await submitInquiry({
        kind: "service",
        category: form.category,
        service: service || null,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        country: form.country,
        description: form.description,
        budget: form.budget,
        timeline: form.timeline,
        contact_method: form.contact_method,
      });
      setReference(ref);
      toast.success("Request submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Request a service"
        title="Tell FRAN-X what you need."
        subtitle="Four short steps. You will receive a reference ID and a response from our team."
        photo={PHOTOS.consulting}
      />

      <section className="container-x max-w-3xl py-14">
        {loading ? null : !user ? (
          <AuthGateNotice action="submit a service request" />
        ) : reference ? (
          <div className="glass-panel rounded-xl p-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-primary/40 text-primary">
              <Check className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold">Request received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your reference ID is{" "}
              <span className="font-mono text-foreground">{reference}</span>. Our team will review
              and respond shortly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/portal">Track in client portal</Link>
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/services" })}>
                Browse more services
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-6 sm:p-8">
            <ol className="flex flex-wrap gap-2">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    i === step
                      ? "border-primary bg-primary/10 text-primary"
                      : i < step
                        ? "border-border text-foreground"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {i + 1}. {label}
                </li>
              ))}
            </ol>

            <div className="mt-8 space-y-5">
              {step === 0 && (
                <div>
                  <Label>What do you need?</Label>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {REQUEST_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => set("category", cat)}
                        className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                          form.category === cat
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {service ? (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Linked service: <span className="text-foreground">{service}</span>
                    </p>
                  ) : null}
                </div>
              )}

              {step === 1 && (
                <>
                  <Field
                    label="Describe your requirement"
                    error={errors['description']}
                  >
                    <Textarea
                      rows={6}
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Goals, scope, features, context…"
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Budget range (optional)">
                      <Input value={form.budget} onChange={(e) => set("budget", e.target.value)} />
                    </Field>
                    <Field label="Timeline (optional)">
                      <Input value={form.timeline} onChange={(e) => set("timeline", e.target.value)} />
                    </Field>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" error={errors['full_name']}>
                      <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
                    </Field>
                    <Field label="Email" error={errors['email']}>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    </Field>
                    <Field label="Phone (optional)">
                      <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </Field>
                    <Field label="Company (optional)">
                      <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
                    </Field>
                    <Field label="Country (optional)">
                      <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
                    </Field>
                    <Field label="Preferred contact method">
                      <select
                        value={form.contact_method}
                        onChange={(e) => set("contact_method", e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {["Email", "Phone", "WhatsApp", "Portal chat"].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {step === 3 && (
                <dl className="space-y-3 text-sm">
                  {[
                    ["Category", form.category],
                    ["Service", service || "—"],
                    ["Description", form.description],
                    ["Budget", form.budget || "—"],
                    ["Timeline", form.timeline || "—"],
                    ["Name", form.full_name],
                    ["Email", form.email],
                    ["Phone", form.phone || "—"],
                    ["Company", form.company || "—"],
                    ["Country", form.country || "—"],
                    ["Contact method", form.contact_method],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[minmax(0,9rem)_1fr] gap-3 border-b border-border/60 pb-3">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="min-w-0 break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
              >
                <ArrowLeft /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit request"}
                </Button>
              )}
            </div>
          </div>
        )}

        <p className="mt-8 rounded-lg border border-border/60 bg-surface/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {COMPLIANCE_NOTE}
        </p>
      </section>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}