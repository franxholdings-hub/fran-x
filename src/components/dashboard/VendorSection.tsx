import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Pencil, Send, Trash2, Eye, Inbox, Store } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PanelSection, StatCard, Empty, toneForStatus } from "@/components/admin/kit";
import { VendorListingForm } from "@/components/marketplace/VendorListingForm";
import { ListingStatusBadge, formatDate } from "@/components/marketplace/shared";
import { CATEGORY_MAP } from "@/lib/marketplace/catalog";
import { useVendorListings, useMarketplaceInquiries, type VendorDraft } from "@/lib/marketplace/store";
import type { ListingStatus, MarketplaceListing } from "@/lib/marketplace/types";

const STATUS_TABS: { key: ListingStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "published", label: "Published" },
  { key: "closed", label: "Closed" },
];

export function VendorSection() {
  const { listings, createListing, updateListing, setStatus, removeListing } = useVendorListings();
  const { inquiries } = useMarketplaceInquiries();
  const [tab, setTab] = useState<ListingStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceListing | undefined>(undefined);

  const vendorInquiries = useMemo(() => {
    const ids = new Set(listings.map((l) => l.id));
    return inquiries.filter((i) => ids.has(i.listingId));
  }, [inquiries, listings]);

  const filtered = useMemo(
    () => (tab === "all" ? listings : listings.filter((l) => l.status === tab)),
    [listings, tab],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: listings.length };
    for (const l of listings) c[l.status ?? "draft"] = (c[l.status ?? "draft"] ?? 0) + 1;
    return c;
  }, [listings]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (l: MarketplaceListing) => {
    setEditing(l);
    setFormOpen(true);
  };

  const handleSaved = (draft: VendorDraft, action: "draft" | "submit") => {
    if (editing) {
      updateListing(editing.id, draft);
      if (action === "submit") setStatus(editing.id, "pending");
    } else {
      const created = createListing(draft);
      if (action === "submit") setStatus(created.id, "pending");
    }
    setFormOpen(false);
    setEditing(undefined);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PanelSection
        title="Vendor Hub"
        description="Create and manage your FRAN-X Marketplace listings. All listings are reviewed by FRAN-X before publishing."
        action={
          <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(undefined); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Listing</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit listing" : "Create a listing"}</DialogTitle>
                <DialogDescription>
                  Only approved FRAN-X asset and opportunity categories are permitted.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                <VendorListingForm
                  {...(editing ? { listing: editing } : {})}
                  onSaved={handleSaved}
                  onCancel={() => { setFormOpen(false); setEditing(undefined); }}
                />
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Performance */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total listings" value={listings.length} />
          <StatCard label="Published" value={counts["published"] ?? 0} />
          <StatCard label="Pending review" value={counts["pending"] ?? 0} />
          <StatCard label="Inquiries received" value={vendorInquiries.length} hint="mock" />
        </div>

        {/* Approval workflow note */}
        <div className="mt-4 rounded-lg border border-border/60 bg-surface/40 p-4 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Approval workflow:</span> Draft → Pending Review →
          FRAN-X Approval → Published. If rejected, edit and resubmit. The backend approval system will be
          connected by FRAN-X later.
        </div>
      </PanelSection>

      {/* My Listings */}
      <PanelSection title="My Listings" description="Manage your marketplace listings and their status.">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ListingStatus | "all")}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
                {counts[t.key ?? "all"] ? (
                  <Badge variant="secondary" className="ml-1.5">{counts[t.key ?? "all"]}</Badge>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/30 p-10 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border text-muted-foreground">
                <Store className="h-6 w-6" />
              </span>
              <p className="mt-3 font-medium">No listings here yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tab === "all" ? "Create your first marketplace listing." : `No ${tab} listings.`}
              </p>
              {tab === "all" ? (
                <Button size="sm" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4" /> Add Listing</Button>
              ) : null}
            </div>
          ) : (
            filtered.map((l) => (
              <article key={l.id} className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-4 sm:flex-row sm:items-center">
                <img src={l.images[0]} alt={l.title} className="h-20 w-full rounded-lg object-cover sm:h-16 sm:w-24" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ListingStatusBadge status={l.status ?? "draft"} />
                    <Badge variant="outline">{CATEGORY_MAP[l.category].shortLabel}</Badge>
                  </div>
                  <p className="mt-1.5 truncate font-medium">{l.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {l.location} · {l.price} · {formatDate(l.dateListed)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {l.status === "rejected" || l.status === "draft" ? (
                    <Button size="sm" variant="outline" onClick={() => { setStatus(l.id, "pending"); }}>
                      <Send className="h-4 w-4" /> Resubmit
                    </Button>
                  ) : null}
                  {l.status === "draft" ? (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(l.id, "pending")}>
                      <Send className="h-4 w-4" /> Submit
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(l)} aria-label="Edit listing">
                    <Pencil className="h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
                  </Button>
                  {l.status === "published" ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/marketplace/$slug" params={{ slug: l.slug }}><Eye className="h-4 w-4" /> View</Link>
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" onClick={() => removeListing(l.id)} aria-label="Delete listing">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </PanelSection>

      {/* Customer inquiries */}
      <PanelSection title="Customer inquiries" description="Inquiries received on your published listings.">
        {vendorInquiries.length ? (
          <ul className="space-y-3">
            {vendorInquiries.map((i) => (
              <li key={i.id} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs text-primary">{i.id}</p>
                  <Badge variant="outline" className={toneForStatus(i.status)}>{i.status}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium">{i.listingTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{i.name} · {i.email} · {i.phone}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{i.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(i.createdAt)} · via {i.contactMethod}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-surface/30 p-6 text-sm text-muted-foreground">
            <Inbox className="h-5 w-5" /> No inquiries received yet.
          </div>
        )}
      </PanelSection>
    </div>
  );
}
