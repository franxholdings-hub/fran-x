// Customer Digital Library — "My Digital Products".
//
// Owned purchases (with secure downloads), subscription access, and a full
// purchase history with a "Buy again" action. Downloads are authorised
// server-side by /api/store/download, which issues a short-lived signed URL.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookOpen, Crown, Download, FileText, Package, RotateCcw, Unlock, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PanelSection, Empty } from "@/components/admin/kit";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, getProductBySlug } from "@/lib/digital-store/catalog";


type Payment = {
  id: string;
  transaction_id: string;
  service_product: string;
  amount: number;
  currency: string;
  payment_status: string;
  verification_status: string;
  related_type: string;
  related_id: string | null;
  paid_at: string | null;
  created_at: string;
  notes: string | null;
};

type Line = { slug: string; name: string; kind: string; category?: string; price?: number };

const CAT_ICON: Record<string, typeof FileText> = {
  templates: FileText,
  ebooks: BookOpen,
  finance: Wallet,
  resources: Crown,
};

function parseLines(notes: string | null): Line[] {
  if (!notes) return [];
  try {
    const parsed = JSON.parse(notes) as { lines?: Line[] };
    return parsed.lines ?? [];
  } catch {
    return [];
  }
}

export function DigitalLibrarySection() {
  const { user } = useAuth();
  const { add, setOpen } = useCart();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [reader, setReader] = useState<{ name: string; body: string } | null>(null);


  const payments = useQuery({
    queryKey: ["digital-library", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Payment[];
    },
  });

  const all = payments.data ?? [];
  const verified = all.filter((p) => p.verification_status === "verified");
  const owned = verified.filter((p) => p.related_type === "one_time");
  const subscription = verified.filter((p) => p.related_type === "subscription");

  const download = async (slug: string, name: string) => {
    setDownloading(slug);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/store/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ slug }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (res.ok && json.url) {
        window.open(json.url, "_blank", "noopener");
        return;
      }
      if (res.status === 404) {
        // No uploaded file — fall back to the PDF generated from the
        // written e-book / template content.
        const { downloadProductFile } = await import("@/lib/store/download-client");
        await downloadProductFile(slug, name, "pdf");
        return;
      }
      throw new Error(json.error || "Download unavailable.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDownloading(null);
    }
  };

  const read = async (slug: string) => {
    setReading(slug);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/store/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ slug }),
      });
      const json = (await res.json()) as { name?: string; body?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "Could not open this product.");
      setReader({
        name: json.name ?? slug,
        body: json.body?.trim()
          ? json.body
          : "The written content for this product has not been published yet. You can still download the file if one is attached.",
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReading(null);
    }
  };

  const buyAgain = (line: Line) => {

    const product = getProductBySlug(line.slug);
    if (!product) {
      toast.error("This product is no longer available.");
      return;
    }
    add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      kind: "product",
      currency: product.currency,
      category: product.category,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PanelSection
        title="Owned Purchases"
        description="Products you bought individually. Download the full file any time — these remain yours forever."
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
            {owned.flatMap((p) => {
              const lines = parseLines(p.notes);
              const fallback: Line[] = lines.length
                ? lines
                : [{ slug: p.related_id ?? p.id, name: p.service_product, kind: "product" }];
              return fallback.map((line) => {
                const Icon = CAT_ICON[line.category ?? "templates"] ?? Package;
                return (
                  <div key={`${p.id}-${line.slug}`} className="rounded-lg border border-border bg-surface/40 p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{line.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNaira(p.amount)} · {new Date(p.paid_at ?? p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">
                        <Unlock className="mr-1 h-3 w-3" /> Unlocked
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => void read(line.slug)} disabled={reading === line.slug}>
                        <BookOpen className="h-3.5 w-3.5" />
                        {reading === line.slug ? "Opening…" : "Read now"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void download(line.slug, line.name)}
                        disabled={downloading === line.slug}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {downloading === line.slug ? "Preparing…" : "Download"}
                      </Button>
                    </div>
                  </div>

                );
              });
            })}
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
                      {formatNaira(p.amount)} · {new Date(p.paid_at ?? p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">Active access</Badge>
              </div>
            ))}
          </div>
        )}
      </PanelSection>

      <PanelSection
        title="Purchase History"
        description="Every order you have placed, including pending and failed payments. You can buy any item again."
        action={<Badge variant="outline">{all.length} orders</Badge>}
      >
        {payments.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : all.length === 0 ? (
          <Empty>
            No orders yet.{" "}
            <Link to="/store" className="font-medium text-primary underline">
              Visit the Digital Store
            </Link>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {all.map((p) => {
                  const lines = parseLines(p.notes);
                  const isVerified = p.verification_status === "verified";
                  return (
                    <tr key={p.id} className="border-b border-border/60 align-top">
                      <td className="py-2 pr-3">
                        <p className="font-medium">{p.service_product || "Order"}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{p.transaction_id}</p>
                      </td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">
                        {new Date(p.paid_at ?? p.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-3 text-right">{formatNaira(p.amount)}</td>
                      <td className="py-2 pr-3">
                        <Badge
                          variant="outline"
                          className={
                            isVerified
                              ? "border-emerald-500/40 text-emerald-600"
                              : p.payment_status === "pending"
                                ? "border-amber-500/40 text-amber-600"
                                : "border-destructive/40 text-destructive"
                          }
                        >
                          {isVerified ? "Paid" : p.payment_status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap justify-end gap-1">
                          {(lines.length
                            ? lines.filter((l) => l.kind !== "subscription")
                            : []
                          ).map((line) => (
                            <Button
                              key={line.slug}
                              size="sm"
                              variant="ghost"
                              onClick={() => buyAgain(line)}
                              title={`Buy ${line.name} again`}
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Buy again
                            </Button>
                          ))}
                          {lines.length === 0 && (
                            <Button asChild size="sm" variant="ghost">
                              <Link to="/store">Shop</Link>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PanelSection>

      {/* Reading window — renders the secure-fetched e-book body */}
      <Dialog open={reader !== null} onOpenChange={(open) => !open && setReader(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-5 py-4 sm:px-6">
            <DialogTitle className="flex items-center gap-2 font-display text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              {reader?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
            <article className="whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
              {reader?.body}
            </article>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
