import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { SITE } from "@/lib/site";

const TITLE = "Sign In or Register | FRAN-X Holdings Client Access";
const DESCRIPTION =
  "Create a FRAN-X Holdings account to submit service requests, track projects and chat with the FRAN-X team.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  full_name: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });

  useEffect(() => {
    if (user) void navigate({ to: "/portal", replace: true });
  }, [user, navigate]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setPending(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.full_name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email to confirm your account");
          return;
        }
        toast.success("Welcome to FRAN-X Holdings");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setPending(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
  };

  return (
    <section className="container-x flex min-h-[80vh] max-w-md flex-col justify-center py-16">
      <div className="glass-panel rounded-2xl p-8">
        <p className="eyebrow">Client access</p>
        <h1 className="mt-3 text-2xl font-semibold">
          {mode === "signup" ? "Create your FRAN-X account" : "Sign in to FRAN-X"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register to submit requests, track projects and chat with our team.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-border bg-surface/60 p-5 text-sm">
            We sent a confirmation link to <span className="text-foreground">{form.email}</span>.
            Confirm your email to activate your account.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" ? (
              <div>
                <Label className="mb-2 block">Full name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                />
              </div>
            ) : null}
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-2 block">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={google}>
          Continue with Google
        </Button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setSent(false);
          }}
          className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New to FRAN-X? Create an account"}
        </button>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our <Link to="/legal/terms" className="underline">Terms</Link> and{" "}
        <Link to="/legal/privacy" className="underline">Privacy Policy</Link>. {SITE.name}.
      </p>
    </section>
  );
}