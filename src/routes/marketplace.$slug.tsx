import { useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, CalendarDays, Building2, ArrowRight, Info } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_MAP, getRelated } from "@/lib/marketplace/catalog";
import type { ListingSpecs } from "@/lib/marketplace/types";
import { useCatalog, useFavorites, useRecentlyViewed } from "@/lib/marketplace/store";
import { Gallery } from "@/components/marketplace/Gallery";
import { ListingCarousel } from "@/components/marketplace/ListingCarousel";
import { InquiryDialog } from "@/components/marketplace/InquiryDialog";
import {
  CategoryIcon,
  VerifiedBadge,
  SourceBadge,
  SaveButton,
  formatDate,
  VENDOR_DISCLAIMER,
} from "@/components/marketplace/shared";

export const Route = createFileRoute("/marketplace/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Marketplace listing | FRAN-X Holdings" },
      { name: "description", content: "FRAN-X Marketplace listing — assets and business opportunities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListingDetail,
});

function ListingDetail() {
  const { slug } = Route.useParams();
  const catalog = useCatalog();
  const { isSaved, toggle } = useFavorites();
  const { markViewed } = useRecentlyViewed();

  const listing = useMemo(() => catalog.find((l) => l.slug === slug), [catalog, slug]);
  const related = useMemo(() => (listing ? getRelated(listing, catalog) : []), [listing, catalog]);

  useEffect(() => {
    if (listing) markViewed(listing.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id]);

  if (!listing) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-semibold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This listing may have been closed or removed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const cat = CATEGORY_MAP[listing.category];
  const specs = specEntries(listing.specs, listing.category);

  return (
    <>
      <PageHero
        eyebrow={`${cat.shortLabel} · ${listing.subtype}`}
        title={listing.title}
        subtitle={listing.description}
      />

      <section className="container-x py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left: gallery + description */}
          <div className="space-y-6">
            <Gallery images={listing.images} alt={listing.title} />

            <div className="glass-panel rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold">Overview</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{listing.description}</p>

              {specs.length > 0 ? (
                <>
                  <h3 className="mt-6 font-display text-base font-semibold">Key specifications</h3>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    {specs.map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between rounded-lg border border-border/60 bg-surface/40 px-3 py-2 text-sm">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : null}
            </div>

            {listing.source === "vendor" ? (
              <div className="flex gap-3 rounded-xl border border-border/60 bg-surface/40 p-4 text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{VENDOR_DISCLAIMER}</p>
              </div>
            ) : null}
          </div>

          {/* Right: summary / actions */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-panel space-y-4 rounded-xl p-6">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge source={listing.source} />
                <VerifiedBadge verified={listing.verified} />
                {listing.featured ? (
                  <Badge variant="outline" className="border-primary/40 text-primary">Featured</Badge>
                ) : null}
              </div>

              <div>
                <p className="font-display text-3xl font-semibold text-primary">{listing.price}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {listing.location}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CategoryIcon id={listing.category} className="h-4 w-4 text-primary" />
                <span>{cat.label} · {listing.subtype}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-4 w-4" /> {listing.vendorName}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> {formatDate(listing.dateListed)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <InquiryDialog
                  listing={listing}
                  trigger={<Button size="lg" className="w-full">Make Inquiry</Button>}
                />
                <SaveButton
                  saved={isSaved(listing.id)}
                  onToggle={() => toggle(listing.id)}
                  size="sm"
                  className="h-10 w-full"
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 ? (
          <div className="mt-12">
            <SectionHeading eyebrow="More like this" title="Related listings" />
            <div className="mt-6">
              <ListingCarousel listings={related} isSaved={isSaved} toggle={toggle} />
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <Button asChild variant="outline">
            <Link to="/marketplace"><ArrowRight className="h-4 w-4 rotate-180" /> Back to Marketplace</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function specEntries(s: ListingSpecs, category: string): [string, string][] {
  const entries: [string, string][] = [];
  const map: Record<string, [string, string | number | undefined][]> = {
    automobiles: [
      ["Make", s.make], ["Model", s.model], ["Year", s.year], ["Mileage", s.mileage], ["Condition", s.condition],
    ],
    "real-estate": [
      ["Property type", s.propertyType], ["Size", s.size], ["Intended use", s.intendedUse],
    ],
    businesses: [["Industry", s.industry], ["Business type", s.businessType]],
    "oil-gas": [["Opportunity type", s.opportunityType]],
  };
  for (const [label, value] of map[category] ?? []) {
    if (value !== undefined && value !== "") entries.push([label, String(value)]);
  }
  return entries;
}
