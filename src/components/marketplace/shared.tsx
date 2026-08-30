// FRAN-X Marketplace — small shared presentational helpers used across
// listing cards, the details page, filters and the dashboard sections.

import { Heart, ShieldCheck, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_MAP } from "@/lib/marketplace/catalog";
import type { CategoryId, ListingSource, ListingStatus } from "@/lib/marketplace/types";

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = CATEGORY_MAP[id].icon;
  return <Icon className={className} />;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** FRAN-X approval / verification indicator. */
export function VerifiedBadge({ verified, className }: { verified: boolean; className?: string }) {
  if (!verified) return null;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400", className)}
    >
      <ShieldCheck className="h-3 w-3" /> FRAN-X Verified
    </Badge>
  );
}

/** Distinguishes FRAN-X listings from approved third-party vendor listings. */
export function SourceBadge({ source, className }: { source: ListingSource; className?: string }) {
  if (source === "franx") {
    return (
      <Badge variant="default" className={cn("gap-1", className)}>
        <Building2 className="h-3 w-3" /> FRAN-X Listing
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className={cn("gap-1", className)}>
      Vendor Listing
    </Badge>
  );
}

const STATUS_TONE: Record<ListingStatus, string> = {
  draft: "border-border text-muted-foreground",
  pending: "border-primary/40 text-primary",
  approved: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  rejected: "border-destructive/40 text-destructive",
  published: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  closed: "border-border text-muted-foreground",
};

export function ListingStatusBadge({ status, className }: { status: ListingStatus; className?: string }) {
  const label = status === "pending" ? "Pending Review" : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant="outline" className={cn(STATUS_TONE[status], className)}>
      {label}
    </Badge>
  );
}

export function SaveButton({
  saved,
  onToggle,
  className,
  size = "icon",
}: {
  saved: boolean;
  onToggle: () => void;
  className?: string;
  size?: "icon" | "sm";
}) {
  return (
    <Button
      type="button"
      variant={saved ? "default" : "outline"}
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save opportunity"}
      className={cn(size === "icon" && "h-9 w-9", className)}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
      {size === "sm" ? <span className="ml-1">{saved ? "Saved" : "Save"}</span> : null}
    </Button>
  );
}

/** Required disclaimer for third-party vendor listings. */
export const VENDOR_DISCLAIMER =
  "FRAN-X facilitates discovery and inquiries for approved third-party vendor listings. FRAN-X does not automatically guarantee every third-party claim, ownership status, return, or transaction outcome. Buyers should perform their own due diligence before proceeding.";
