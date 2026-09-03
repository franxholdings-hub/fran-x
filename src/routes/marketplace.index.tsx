import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Store } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PHOTOS } from "@/lib/photos";
import {
  applyFilters,
  emptyFilters,
  getFeatured,
  getLatest,
  getRecommended,
} from "@/lib/marketplace/catalog";
import { useCatalog, useFavorites } from "@/lib/marketplace/store";
import type { MarketplaceFilters } from "@/lib/marketplace/types";
import { MarketplaceFilters as FiltersBar } from "@/components/marketplace/MarketplaceFilters";
import { MarketNav } from "@/components/marketplace/MarketNav";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ListingCarousel } from "@/components/marketplace/ListingCarousel";

const TITLE = "FRAN-X Marketplace | Assets & Business Opportunities";
const DESCRIPTION =
  "Browse approved FRAN-X assets and business opportunities — automobiles, land & real estate, businesses and oil & gas / energy.";

export const Route = createFileRoute("/marketplace/")({
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
  component: Marketplace,
});

function Marketplace() {
  const catalog = useCatalog();
  const { isSaved, toggle } = useFavorites();
  const [filters, setFilters] = useState<MarketplaceFilters>(emptyFilters);
  const [browsing, setBrowsing] = useState(false);

  const featured = useMemo(() => getFeatured(catalog), [catalog]);
  const latest = useMemo(() => getLatest(catalog, 6), [catalog]);
  const recommended = useMemo(() => getRecommended(catalog, {}, 3), [catalog]);
  const results = useMemo(() => applyFilters(catalog, filters), [catalog, filters]);

  const onChange = (patch: Partial<MarketplaceFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  return (
    <>
      <MarketNav
        activeCategory={filters.category}
        onSelect={(category) => {
          setFilters(category === "all" ? emptyFilters() : { ...emptyFilters(), category });
          setBrowsing(true);
          document.getElementById("marketplace-browse")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <PageHero
        eyebrow="FRAN-X Marketplace"
        title="High-value assets & business opportunities."
        subtitle="A premium marketplace for FRAN-X and approved vendors to market automobiles, land & real estate, businesses and oil & gas / energy opportunities."
        photo={PHOTOS.opportunities}
      >
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => document.getElementById("marketplace-browse")?.scrollIntoView({ behavior: "smooth" })}>
            <Store className="h-4 w-4" /> Browse Marketplace
          </Button>
          <Button asChild variant="outline">
            <Link to="/portal">Open in dashboard</Link>
          </Button>
        </div>
      </PageHero>

      {/* Featured */}
      {featured.length > 0 ? (
        <section className="container-x py-6">
          <div className="flex items-center justify-between">
            <SectionHeading eyebrow="Premium" title="Featured opportunities" />
            <Badge variant="outline" className="hidden border-primary/40 text-primary sm:inline-flex">
              <Sparkles className="h-3 w-3" /> Admin-curated
            </Badge>
          </div>
          <div className="mt-6">
            <ListingCarousel listings={featured} isSaved={isSaved} toggle={toggle} />
          </div>
        </section>
      ) : null}

      {/* Browse / search / filter */}
      <section id="marketplace-browse" className="container-x scroll-mt-20 py-6 sm:py-8">
        <SectionHeading
          eyebrow="Browse"
          title={browsing ? "All listings" : "Latest listings"}
          subtitle="Search and filter across the FRAN-X Marketplace."
        />

        <div className="mt-6">
          <FiltersBar filters={filters} onChange={onChange} resultCount={results.length} />
        </div>
        <div className="mt-5 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((l) => (
            <ListingCard key={l.id} listing={l} saved={isSaved(l.id)} onToggleSave={() => toggle(l.id)} />
          ))}
        </div>
        {results.length === 0 ? (
          <div className="glass-panel mt-5 rounded-xl p-8 text-center">
            <p className="font-display text-base font-semibold">No listings match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try clearing some filters or broadening your search.</p>
            <Button variant="outline" className="mt-4" onClick={() => setFilters(emptyFilters())}>
              Clear filters
            </Button>
          </div>
        ) : null}
      </section>

      {/* Recommended */}
      <section className="container-x py-6 sm:py-8">
        <SectionHeading
          eyebrow="For you"
          title="Recommended opportunities"
          subtitle="Curated based on category and location — structured for future FRIX AI recommendations."
        />
        <div className="mt-4">
          <ListingCarousel listings={recommended} isSaved={isSaved} toggle={toggle} />
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="container-x py-6 sm:py-8">
        <div className="glass-panel flex flex-col items-start justify-between gap-4 rounded-xl p-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">For approved vendors</p>
            <p className="mt-1.5 font-display text-lg font-semibold">List an asset or opportunity on FRAN-X</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a listing, submit it for FRAN-X review, and receive inquiries once approved.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/portal">Start a listing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
