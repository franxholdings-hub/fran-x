// Cart drawer for the FRAN-X Digital Store — a "receipt style" side drawer.

import { Link } from "@tanstack/react-router";
import { Minus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { formatNaira } from "@/lib/digital-store/catalog";

export function CartDrawer() {
  const { items, remove, total, isOpen, setOpen, count } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingBag className="h-4 w-4" /> Your Cart
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
              <Link to="/store">Browse the Digital Store</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Subtotal summary — kept at the top so the floating WhatsApp
                button can never cover the amount a customer needs to pay. */}
            <div className="border-b border-border bg-surface/50 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl font-semibold">{formatNaira(total)}</span>
              </div>
            </div>

            {/* Product details — name, units and price live below the subtotal. */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.slug}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-surface/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {item.kind === "subscription" ? "Subscription" : item.category} · 1 unit
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-semibold">
                        {formatNaira(item.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(item.slug)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 py-4">
              <Button asChild className="w-full" size="lg" onClick={() => setOpen(false)}>
                <Link to="/store/checkout">
                  <span className="flex items-center gap-2">
                    Checkout via Paystack
                    <span className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      Paystack
                    </span>
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" /> Continue shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
