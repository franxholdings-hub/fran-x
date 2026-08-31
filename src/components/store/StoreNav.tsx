// Sticky sub-navigation for the FRAN-X Digital Store — appears on all /store routes.

import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { STORE_CATEGORIES } from "@/lib/digital-store/catalog";

export function StoreNav() {
  const { count, open } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-x flex h-14 items-center gap-1 overflow-x-auto">
        <Link
          to="/store"
          className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            pathname === "/store"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Store Home
        </Link>
        {STORE_CATEGORIES.filter((c) => c.id !== "resources").map((cat) => {
          const href =
            cat.id === "services"
              ? "/store/services"
              : cat.id === "frix-ai"
                ? "/store/frix-ai"
                : cat.id === "automation"
                  ? "/store/services"
                  : `/store/${cat.id}`;
          const active =
            pathname === href ||
            (cat.id === "automation" && pathname === "/store/services");
          return (
            <Link
              key={cat.id}
              to={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.shortLabel}
            </Link>
          );
        })}
        <Link
          to="/store/resource-pass"
          className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            pathname === "/store/resource-pass"
              ? "bg-metal/15 text-metal"
              : "text-metal hover:text-metal/80"
          }`}
        >
          Resource Pass
        </Link>

        <Button
          variant="outline"
          size="sm"
          className="ml-auto shrink-0 gap-1.5"
          onClick={open}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
