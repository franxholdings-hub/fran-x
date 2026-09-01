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
    <article className="group flex flex-row overflow-hidden rounded-xl border border-border bg-surface/40 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 sm:flex-col sm:hover:-translate-y-1">
      <Link
        to="/store/$slug"
        params={{ slug: product.slug }}
        className="relative block shrink-0 w-20 overflow-hidden sm:w-full sm:aspect-[4/3]"
      >
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/5 to-transparent sm:from-background/80 sm:via-background/10" />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 sm:top-3 sm:left-3">
          {product.bundle && (
            <Badge className="border-0 bg-primary px-1.5 py-0 text-[10px] text-primary-foreground sm:px-2 sm:py-0.5 sm:text-xs">
              <Package className="mr-1 h-3 w-3" /> Bundle
            </Badge>
          )}
          {product.featured && !product.bundle && (
            <Badge variant="outline" className="border-metal/50 bg-background/80 px-1.5 py-0 text-[10px] text-metal sm:px-2 sm:py-0.5 sm:text-xs">
              <Sparkles className="mr-1 h-3 w-3" /> Featured
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <Link to="/store/$slug" params={{ slug: product.slug }}>
          <h3 className="font-display text-sm font-semibold leading-snug transition-colors group-hover:text-primary sm:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-1 flex-1 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:line-clamp-2 sm:text-sm">
          {product.description}
        </p>

        <div className="mt-2 flex items-end justify-between gap-2 sm:mt-4">
          <div>
            <p className="font-display text-base font-semibold sm:text-xl">{formatNaira(product.price)}</p>
            {savings > 0 && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 sm:text-xs">
                Save {formatNaira(savings)}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {product.fileFormat}
          </Badge>
        </div>

        <div className="mt-3 flex gap-2 sm:mt-4">
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
      <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
