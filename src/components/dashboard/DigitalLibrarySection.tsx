// Customer Digital Library — "My Digital Products".
//
// Reads the user's verified payments to separate Owned Purchases (one-time)
// from Subscription Access. Uses the existing payments table (owner-read RLS),
// so it works without the digital_store migration being applied.

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookOpen, Crown, Download, FileText, Package, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection, Empty } from "@/components/admin/kit";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/digital-store/catalog";

type Payment = {
  id: string;
  transaction_id: string;
  service_product: string;
  amount: number;
  currency: string;
  payment_status: string;
  verification_status: string;
  related_type: string;
  paid_at: string | null;
  notes: string | null;
};

const CAT_ICON: Record<string, typeof FileText> = {
  templates: FileText,
  ebooks: BookOpen,
  finance: Wallet,
  resources: Crown,
};

export function DigitalLibrarySection() {
  const { user } = useAuth();

  const payments = useQuery({
    queryKey: ["digital-library", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user!.id)
        .eq("verification_status", "verified")
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Payment[];
    },
  });

  const owned = (payments.data ?? []).filter((p) => p.related_type === "one_time");
  const subscription = (payments.data ?? []).filter((p) => p.related_type === "subscription");

  const parseLines = (notes: string | null) => {
    if (!notes) return [];
    try {
      const parsed = JSON.parse(notes);
      return (parsed.lines ?? []) as { slug: string; name: string; kind: string; category?: string }[];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PanelSection
        title="Owned Purchases"
        description="Products you bought individually. These remain yours forever — even if you cancel a subscription."
        action={<Badge variant="outline">{owned.length} owned</Badge>}
      >
        {payments.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : owned.length === 0 ? (
          <Empty>
            No owned purchases yet.{" "}
            <Link to="/store" className="font-medium text-primary underline">
              Browse the Digital Store
            </Link>
          </Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {owned.flatMap((p) =>
              parseLines(p.notes).map((line) => {
                const Icon = CAT_ICON[line.category ?? "templates"] ?? Package;
                return (
                  <div key={`${p.id}-${line.slug}`} className="flex items-start gap-3 rounded-lg border border-border bg-surface/40 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNaira(p.amount)} · {new Date(p.paid_at ?? p.created_at ?? Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" disabled>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              }),
            )}
            {owned.length > 0 && owned.every((p) => parseLines(p.notes).length === 0) && (
              <div className="sm:col-span-2">
                {owned.map((p) => (
                  <div key={p.id} className="mb-2 flex items-center justify-between rounded-lg border border-border bg-surface/40 p-4">
                    <div>
                      <p className="text-sm font-medium">{p.service_product}</p>
                      <p className="text-xs text-muted-foreground">{formatNaira(p.amount)}</p>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">Verified</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PanelSection>

      <PanelSection
        title="Subscription Access"
        description="Resources available while your subscription is active. Access ends when the subscription expires."
        action={<Badge variant="outline">{subscription.length} subscriptions</Badge>}
      >
        {subscription.length === 0 ? (
          <Empty>
            No active subscriptions.{" "}
            <Link to="/store/resource-pass" className="font-medium text-primary underline">
              Get the Resource Pass
            </Link>
          </Empty>
        ) : (
          <div className="space-y-3">
            {subscription.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-metal/30 bg-metal/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-metal/30 bg-metal/10 text-metal">
                    <Crown className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.service_product}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNaira(p.amount)} · {new Date(p.paid_at ?? Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">Active access</Badge>
              </div>
            ))}
          </div>
        )}
      </PanelSection>
    </div>
  );
}
