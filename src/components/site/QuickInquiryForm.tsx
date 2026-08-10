import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AuthGateNotice } from "@/components/site/AuthGateNotice";
import { useAuth } from "@/hooks/useAuth";
import { baseInquirySchema, submitInquiry, type InquiryPayload } from "@/lib/inquiries";

type ExtraField = {
  name: string;
  label: string;
  type?: "text" | "select" | "textarea";
  options?: readonly string[];
};

export function QuickInquiryForm({
  kind,
  category,
  gateAction,
  extraFields = [],
  submitLabel = "Submit",
}: {
  kind: InquiryPayload["kind"];
  category?: string;
  gateAction: string;
  extraFields?: ExtraField[];
  submitLabel?: string;
}) {
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    description: "",
    budget: "",
    timeline: "",
    contact_method: "Email",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = baseInquirySchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const ref = await submitInquiry({
        kind,
        category: category ?? (extra['opportunity_type'] ?? null),
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        country: form.country,
        description: form.description,
        budget: form.budget,
        timeline: form.timeline,
        contact_method: form.contact_method,
        details: extra,
      });
      setReference(ref);
      toast.success("Submitted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!user) return <AuthGateNotice action={gateAction} />;

  if (reference) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center">
        <h2 className="font-display text-xl font-semibold">Submission received</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Reference ID <span className="font-mono text-foreground">{reference}</span>. Our team will
          review and respond.
        </p>
        <Button asChild className="mt-6">
          <Link to="/portal">Track in client portal</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-2xl p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors['full_name']}>
          <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
        </Field>
        <Field label="Email" error={errors['email']}>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Phone (optional)">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Company (optional)">
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
        </Field>
      </div>

      {extraFields.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {extraFields.map((field) => (
            <Field key={field.name} label={field.label}>
              {field.type === "select" ? (
                <select
                  value={extra[field.name] ?? ""}
                  onChange={(e) => setExtra((p) => ({ ...p, [field.name]: e.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <Textarea
                  rows={3}
                  value={extra[field.name] ?? ""}
                  onChange={(e) => setExtra((p) => ({ ...p, [field.name]: e.target.value }))}
                />
              ) : (
                <Input
                  value={extra[field.name] ?? ""}
                  onChange={(e) => setExtra((p) => ({ ...p, [field.name]: e.target.value }))}
                />
              )}
            </Field>
          ))}
        </div>
      ) : null}

      <Field label="Describe your requirement" error={errors['description']}>
        <Textarea
          rows={6}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Budget (optional)">
          <Input value={form.budget} onChange={(e) => set("budget", e.target.value)} />
        </Field>
        <Field label="Timeline (optional)">
          <Input value={form.timeline} onChange={(e) => set("timeline", e.target.value)} />
        </Field>
        <Field label="Preferred contact">
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

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Submitting…" : submitLabel}
      </Button>
    </form>
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