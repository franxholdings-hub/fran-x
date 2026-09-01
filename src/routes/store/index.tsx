import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreSectionHeading } from "@/components/store/ProductCard";
import { PanelSection } from "@/components/admin/kit";
import { PageHero } from "@/components/site/PageHero";
import {
  STORE_CATEGORIES,
  getFeaturedProducts,
  getBundleOriginalTotal,
  formatNaira,
} from "@/lib/digital-store/catalog";
import { PHOTOS } from "@/lib/photos";

const TITLE = "FRAN-X Digital Store | Templates, E-Books, Services & Subscriptions";
const DESCRIPTION =
  "Business templates, e-books, financial guides, digital services and subscriptions — the FRAN-X digital toolkit for Nigerian enterprises.";

export const Route = createFileRoute("/store/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: StoreHome,
});

// Category tiles for the main store navigation — structured to mirror the
// dashboard Profile section (PanelSection + compact bordered cards).
const BENTO = [
  { cat: STORE_CATEGORIES[0], href: "/store/templates" as const },
  { cat: STORE_CATEGORIES[1], href: "/store/ebooks" as const },
  { cat: STORE_CATEGORIES[2], href: "/store/finance" as const },
  { cat: STORE_CATEGORIES[3], href: "/store/frix-ai" as const },
  { cat: STORE_CATEGORIES[4], href: "/store/services" as const },
  { cat: STORE_CATEGORIES[5], href: "/store/services" as const },
];

function StoreHome() {
  const featured = getFeaturedProducts(8);
  const startupBundle = featured.find((p) => p.bundle);

  return (
    <>
      <PageHero
        eyebrow="FRAN-X Digital Store"
        title="The digital toolkit for ambitious businesses."
        subtitle="Templates, e-books, financial guides, professional services and subscriptions — discover, learn, buy and grow."
        photo={PHOTOS.technology}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/store/templates">Browse Templates <ArrowRight /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/store/resource-pass">Get the Resource Pass</Link>
          </Button>
        </div>
      </PageHero>

      {/* Category navigation — mirrors the Profile section (PanelSection + compact bordered cards) */}
      <section className="container-x py-6 sm:py-8">
        <PanelSection
          title="Explore the store"
          description="Everything you need to build and grow — templates, e-books, finance guides, AI, services and automation."
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {BENTO.map(({ cat, href }) => (
              <Link
                key={cat.id}
                to={href}
                className="group rounded-lg border border-border bg-surface/40 p-3 transition-colors hover:border-primary/40 hover:bg-surface/60"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <cat.icon className="h-[1.15rem] w-[1.15rem]" />
                  </span>
                  <p className="font-display text-sm font-semibold leading-snug">{cat.shortLabel}</p>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{cat.blurb}</p>
              </Link>
            ))}
          </div>
        </PanelSection>
      </section>

      {/* Featured startup bundle highlight */}
      {startupBundle && (
        <section className="container-x pb-3">
          <div className="relative overflow-hidden rounded-2xl border border-metal/30 bg-gradient-to-br from-metal/10 via-surface/40 to-background p-5 sm:p-8">
            <div className="relative max-w-2xl">
              <Badge className="border-0 bg-metal text-background">
                <Package className="mr-1 h-3 w-3" /> Bundle
              </Badge>
              <h2 className="mt-3 font-display text-xl font-semibold sm:text-2xl">
                {startupBundle.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {startupBundle.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="font-display text-2xl font-semibold">
                  {formatNaira(startupBundle.price)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatNaira(getBundleOriginalTotal(startupBundle))}
                </span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  Save {formatNaira(getBundleOriginalTotal(startupBundle) - startupBundle.price)}
                </Badge>
              </div>
              <Button asChild className="mt-4" size="lg">
                <Link to="/store/$slug" params={{ slug: startupBundle.slug }}>
                  View bundle <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="container-x py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <StoreSectionHeading eyebrow="Featured" title="Popular digital products" />
          <Button asChild variant="ghost" size="sm">
            <Link to="/store/templates">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Revenue ticker / social proof */}
      <section className="container-x pb-10">
        <div className="glass-panel flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-[1.15rem] w-[1.15rem]" />
            </span>
            <div>
              <p className="text-sm font-semibold">Trusted by Nigerian entrepreneurs</p>
              <p className="text-xs text-muted-foreground">
                Real business resources, professional services and recurring value.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-metal" />
            Discover · Learn · Buy · Subscribe · Grow
          </div>
        </div>
      </section>
    </>
  );
}
