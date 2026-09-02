// Sticky sub-navigation for the FRAN-X Digital Store — appears on all /store routes.
//
// The store categories are laid out as a two-column icon grid inside a
// glassmorphism panel, mirroring the FRAN-X dashboard navigation style:
// each item is an icon + label, and the active item is a solid gold pill.

import { Link, useRouterState } from "@tanstack/react-router";
import { Crown, Home, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { STORE_CATEGORIES } from "@/lib/digital-store/catalog";

export function StoreNav() {
  const { count, open } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Store Home + the six non-resource categories + Resource Pass = 8 items.
  const categories = STORE_CATEGORIES.filter((c) => c.id !== "resources");

  const itemClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
    }`;

  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-x py-3">
        <div className="rounded-xl border border-white/10 bg-surface/40 p-2.5 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
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

          <div className="grid grid-cols-2 gap-1.5">
            <Link to="/store" className={itemClass(pathname === "/store")}>
              <Home className="h-4 w-4 shrink-0" />
              <span>Store Home</span>
            </Link>

            {categories.map((cat) => {
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
              const Icon = cat.icon;
              return (
                <Link key={cat.id} to={href} className={itemClass(active)}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{cat.shortLabel}</span>
                </Link>
              );
            })}

            <Link
              to="/store/resource-pass"
              className={itemClass(pathname === "/store/resource-pass")}
            >
              <Crown className="h-4 w-4 shrink-0" />
              <span>Resource Pass</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
