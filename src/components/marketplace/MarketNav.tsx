// Sticky sub-navigation for the FRAN-X Marketplace — mirrors the Digital Store
// StoreNav: a two-column glassmorphism icon grid that stays pinned to the top.
// The active category is shown as a solid gold pill.

import { LayoutGrid } from "lucide-react";
import { CATEGORIES } from "@/lib/marketplace/catalog";
import type { CategoryId } from "@/lib/marketplace/types";
import { CategoryIcon } from "./shared";

type CategoryFilter = CategoryId | "all";

export function MarketNav({
  activeCategory,
  onSelect,
}: {
  activeCategory: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}) {
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
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onSelect("all")}
              className={itemClass(activeCategory === "all")}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span>All</span>
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={itemClass(activeCategory === c.id)}
              >
                <CategoryIcon id={c.id} className="h-4 w-4 shrink-0" />
                <span>{c.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
