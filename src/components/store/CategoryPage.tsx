// Shared category listing page for digital product categories
// (templates, ebooks, finance). Renders a filterable grid of product cards.

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCard, StoreSectionHeading } from "@/components/store/ProductCard";
import { PageHero } from "@/components/site/PageHero";
import {
  getPublishedProducts,
  STORE_CATEGORY_MAP,
  type StoreCategoryId,
} from "@/lib/digital-store/catalog";
import { PHOTOS } from "@/lib/photos";

export function CategoryPage({ categoryId }: { categoryId: StoreCategoryId }) {
  const cat = STORE_CATEGORY_MAP[categoryId];
  const all = useMemo(() => getPublishedProducts(categoryId), [categoryId]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const kw = query.trim().toLowerCase();
    if (!kw) return all;
    return all.filter((p) =>
      `${p.name} ${p.description} ${p.whatsIncluded.join(" ")}`
        .toLowerCase()
        .includes(kw),
    );
  }, [all, query]);

  const photoKey =
    categoryId === "templates"
      ? "data"
      : categoryId === "ebooks"
        ? "consulting"
        : "capital";

  return (
    <>
      <PageHero
        eyebrow="FRAN-X Digital Store"
        title={cat.label}
        subtitle={cat.blurb}
        photo={PHOTOS[photoKey]}
      />

      <section className="container-x py-10 sm:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <StoreSectionHeading
            subtitle={
              categoryId === "finance"
                ? "Educational resources for personal and business finance. These do not constitute personalized financial advice."
                : undefined
            }
          />
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${cat.shortLabel.toLowerCase()}…`}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Badge variant="outline">{filtered.length} products</Badge>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
