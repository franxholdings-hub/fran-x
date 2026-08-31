// Shared building blocks for the FRAN-X Digital Store storefront.

import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Package, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import {
  formatNaira,
  getBundleOriginalTotal,
  type DigitalProduct,
} from "@/lib/digital-store/catalog";
import { PHOTOS } from "@/lib/photos";

/** A premium product card for the digital store grids. */
export function ProductCard({ product }: { product: DigitalProduct }) {
  const { add } = useCart();
  const photo = PHOTOS[product.cover];
  const savings = product.bundle ? getBundleOriginalTotal(product) - product.price : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface/40 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <Link
        to="/store/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.bundle && (
            <Badge className="border-0 bg-primary text-primary-foreground">
              <Package className="mr-1 h-3 w-3" /> Bundle
            </Badge>
          )}
          {product.featured && !product.bundle && (
            <Badge variant="outline" className="border-metal/50 bg-background/80 text-metal">
              <Sparkles className="mr-1 h-3 w-3" /> Featured
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link to="/store/$slug" params={{ slug: product.slug }}>
          <h3 className="font-display text-base font-semibold leading-snug transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-xl font-semibold">{formatNaira(product.price)}</p>
            {savings > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Save {formatNaira(savings)}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {product.fileFormat}
          </Badge>
        </div>

        <div className="mt-4 flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link to="/store/$slug" params={{ slug: product.slug }}>
              View <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              add({
                slug: product.slug,
                name: product.name,
                price: product.price,
                currency: product.currency,
                category: product.category,
                kind: "product",
              })
            }
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}

/** A compact "what's included" value matrix using 1px rules. */
export function ValueMatrix({ items }: { items: string[] }) {
  return (
    <ul className="divide-y divide-border/60">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 py-2.5 text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Section heading for store pages. */
export function StoreSectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>}
    </div>
  );
}
