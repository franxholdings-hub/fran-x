// Customer Digital Library — "My Digital Products".
//
// Owned purchases come from digital_library (granted only after a VERIFIED
// payment) joined with the product and its files. Each file downloads via
// the secure API — the customer's browser receives a short-lived signed
// URL, never a public file path. Purchases stay accessible forever.
//
// If the library has no rows yet (e.g. pre-migration purchases), a simple
// legacy view derived from verified payments is shown instead.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookOpen, Crown, Download, FileText, Loader2, Package, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection, Empty } from "@/components/admin/kit";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  downloadAllProductFiles,
  downloadProductFile,
  openProductFile,
  fileExt,
  type ProductFile,
} from "@/lib/digital-store/files";
import { formatNaira } from "@/lib/digital-store/catalog";
import { toast } from "sonner";

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

type OwnedRow = {
  id: string;
  product_slug: string;
  granted_at: string;
  product: { name: string; category: string; notes: string | null } | null;
};

const CAT_ICON: Record<string, typeof FileText> = {
  templates: FileText,
  ebooks: BookOpen,
  finance: Wallet,
  resources: Crown,
};

async function handleDownload(slug: string, file: ProductFile) {
  try {
    await downloadProductFile(slug, file.id);
  } catch (e: any) {
    toast.error(e.message || "Download failed");
  }
}

async function handleView(slug: string, file: ProductFile) {
  try {
    await openProductFile(slug, file.id);
  } catch (e: any) {
    toast.error(e.message || "Could not open file");
  }
}

function fIsPdf(f: ProductFile): boolean {
  return f.mime_type === "application/pdf" || f.file_name.toLowerCase().endsWith(".pdf");
}

export function DigitalLibrarySection() {
  const { user } = useAuth();
  const [bulk, setBulk] = useState<string | null>(null);

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

  const library = useQuery({
    queryKey: ["digital-library-owned", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_library")
        .select("id,product_slug,granted_at,product:digital_products(name,category,notes)")
        .eq("user_id", user!.id)
        .eq("access_type", "owned")
        .eq("is_active", true)
        .order("granted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OwnedRow[];
    },
  });

  const ownedSlugs = (library.data ?? []).map((r) => r.product_slug);
  const files = useQuery({
    queryKey: ["library-files", user?.id, ownedSlugs],
    enabled: !!user && ownedSlugs.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_product_files")
        .select("id,product_slug,kind,file_name,mime_type,file_size,version,created_at")
        .in("product_slug", ownedSlugs)
        .eq("kind", "product");
      if (error) throw error;
      return (data ?? []) as unknown as ProductFile[];
    },
  });

  const legacyOwned = (payments.data ?? []).filter((p) => p.related_type === "one_time");
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
        action={<Badge variant="outline">{library.data?.length ?? legacyOwned.length} owned</Badge>}
      >
        {library.isLoading || payments.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (library.data ?? []).length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {(library.data ?? []).map((row) => {
              const productFiles = (files.data ?? []).filter((f) => f.product_slug === row.product_slug);
              const Icon = CAT_ICON[row.product?.category ?? "templates"] ?? Package;
              return (
                <div key={row.id} className="flex flex-col rounded-lg border border-border bg-surface/40 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{row.product?.name ?? row.product_slug}</p>
                      <p className="text-xs text-muted-foreground">
                        Purchased: {new Date(row.granted_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {row.product?.notes && (
                    <div className="mt-3 rounded-md border border-border/60 bg-background/40 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">How to use this product</p>
                      <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                        {row.product.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                    {productFiles.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Files are being prepared — check back shortly.
                      </p>
                    ) : (
                      <>
                        {productFiles.map((f) => (
                          <span key={f.id} className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(row.product_slug, f)}
                            >
                              <Download className="h-3.5 w-3.5" /> Download {fileExt(f.file_name)}
                            </Button>
                            {fIsPdf(f) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Read / View"
                                onClick={() => handleView(row.product_slug, f)}
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </span>
                        ))}
                        {productFiles.length > 1 && (
                          <Button
                            size="sm"
                            disabled={bulk === row.product_slug}
                            onClick={async () => {
                              setBulk(row.product_slug);
                              try {
                                await downloadAllProductFiles(
                                  row.product_slug,
                                  productFiles.map((f) => f.id),
                                );
                              } catch (e: any) {
                                toast.error(e.message || "Download failed");
                              } finally {
                                setBulk(null);
                              }
                            }}
                          >
                            {bulk === row.product_slug ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            Download all files
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : legacyOwned.length > 0 ? (
          // Legacy view — verified purchases made before the library grants existed.
          <div className="space-y-2">
            {legacyOwned.flatMap((p) =>
              parseLines(p.notes).map((line) => (
                <div key={`${p.id}-${line.slug}`} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 p-4">
                  <div>
                    <p className="text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNaira(p.amount)} · {new Date(p.paid_at ?? Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">Verified</Badge>
                </div>
              )),
            )}
            {legacyOwned.every((p) => parseLines(p.notes).length === 0) && (
              legacyOwned.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 p-4">
                  <div>
                    <p className="text-sm font-medium">{p.service_product}</p>
                    <p className="text-xs text-muted-foreground">{formatNaira(p.amount)}</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">Verified</Badge>
                </div>
              ))
            )}
          </div>
        ) : (
          <Empty>
            No owned purchases yet.{" "}
            <Link to="/store" className="font-medium text-primary underline">
              Browse the Digital Store
            </Link>
          </Empty>
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

