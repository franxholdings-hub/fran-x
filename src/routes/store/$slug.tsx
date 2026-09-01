import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Package, ShoppingCart, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/site/PageHero";
import { ValueMatrix, ProductCard, StoreSectionHeading } from "@/components/store/ProductCard";
import { useCart } from "@/hooks/useCart";
import {
  getProductBySlug,
  getRelatedProducts,
  getBundleOriginalTotal,
  formatNaira,
} from "@/lib/digital-store/catalog";
import { PHOTOS } from "@/lib/photos";

export const Route = createFileRoute("/store/$slug")({
  head: () => ({
    meta: [
      { title: "Digital Product | FRAN-X Digital Store" },
      { name: "description", content: "FRAN-X digital product — templates, e-books and financial guides." },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const product = getProductBySlug(slug);
  const { add, open } = useCart();

  if (!product) {
    return (
      <div className="container-x py-12 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Button asChild className="mt-4">
          <Link to="/store">Back to store</Link>
        </Button>
      </div>
    );
  }

  const photo = PHOTOS[product.cover];
  const related = getRelatedProducts(product, 4);
  const savings = product.bundle ? getBundleOriginalTotal(product) - product.price : 0;

  const addToCart = () => {
    add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      category: product.category,
      kind: "product",
    });
    toast.success(`${product.name} added to cart`);
  };

  const buyNow = () => {
    add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      category: product.category,
      kind: "product",
    });
    // navigate to checkout via window since cart drawer opens on add
    window.location.assign("/store/checkout");
  };

  return (
    <>
      <PageHero
        eyebrow={product.category.replace("-", " ")}
        title={product.name}
        subtitle={product.description}
        photo={photo}
      />

      <section className="container-x py-10 sm:py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Document previewer — blurred glimpse */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface/40">
            <div className="relative aspect-[4/3]">
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-full w-full object-cover blur-[2px] brightness-90"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-background/40 via-transparent to-background/60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg border border-border/60 bg-background/80 px-4 py-2 text-center backdrop-blur-sm">
                  <p className="text-xs font-medium text-muted-foreground">Preview</p>
                  <p className="font-display text-sm font-semibold">{product.fileFormat}</p>
                </div>
              </div>
            </div>
            {product.bundle && (
              <div className="flex flex-wrap gap-2 p-4">
                {product.bundleSlugs?.map((s) => {
                  const item = getProductBySlug(s);
                  return item ? (
                    <Badge key={s} variant="outline" className="text-[11px]">
                      <Package className="mr-1 h-3 w-3" /> {item.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Value matrix + purchase */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.bundle && (
                <Badge className="border-0 bg-primary text-primary-foreground">
                  <Package className="mr-1 h-3 w-3" /> Bundle
                </Badge>
              )}
              {product.featured && (
                <Badge variant="outline" className="border-metal/50 text-metal">
                  <Sparkles className="mr-1 h-3 w-3" /> Featured
                </Badge>
              )}
              <Badge variant="outline" className="uppercase">{product.fileFormat}</Badge>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <span className="font-display text-3xl font-semibold">{formatNaira(product.price)}</span>
              {savings > 0 && (
                <span className="mb-1 text-sm text-muted-foreground line-through">
                  {formatNaira(getBundleOriginalTotal(product))}
                </span>
              )}
              {savings > 0 && (
                <Badge variant="outline" className="mb-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  Save {formatNaira(savings)}
                </Badge>
              )}
            </div>

            <h2 className="mt-7 font-display text-lg font-semibold">What's included</h2>
            <div className="mt-3 rounded-xl border border-border bg-surface/40 p-5">
              <ValueMatrix items={product.whatsIncluded} />
            </div>

            {product.disclaimer && (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
                {product.disclaimer}
              </p>
            )}

            {/* Access note */}
            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                {product.hasFile
                  ? "Authenticated access — available in your digital library after purchase."
                  : "This product is listed but not yet published for download. Contact FRAN-X to be notified when the file is available."}
              </span>
            </div>

            {/* Desktop purchase buttons */}
            <div className="mt-6 hidden gap-3 lg:flex">
              <Button size="lg" className="flex-1" onClick={buyNow}>
                Buy Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={addToCart}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Related products — "You may also like" */}
        {related.length > 0 && (
          <div className="mt-6">
            <StoreSectionHeading eyebrow="You may also like" title="Related resources" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        <Button asChild variant="ghost" size="sm" className="mt-6">
          <Link to="/store"><ArrowLeft className="h-4 w-4" /> Back to store</Link>
        </Button>
      </section>

      {/* Sticky mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur-md lg:hidden" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}>
        <div className="container-x flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Price</p>
            <p className="font-display text-lg font-semibold">{formatNaira(product.price)}</p>
          </div>
          <Button size="sm" variant="outline" onClick={addToCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button size="sm" className="flex-1" onClick={buyNow}>
            Buy Now
          </Button>
        </div>
      </div>
    </>
  );
}
