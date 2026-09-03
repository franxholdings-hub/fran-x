import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/marketplace/catalog";
import type { MarketplaceFilters, SortMode } from "@/lib/marketplace/types";
import { cn } from "@/lib/utils";

export function MarketplaceFilters({
  filters,
  onChange,
  resultCount,
}: {
  filters: MarketplaceFilters;
  onChange: (patch: Partial<MarketplaceFilters>) => void;
  resultCount: number;
}) {
  const set = (patch: Partial<MarketplaceFilters>) => onChange(patch);

  return (
    <div className="glass-panel rounded-xl p-3 sm:p-4">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.keyword}
          onChange={(e) => set({ keyword: e.target.value })}
          placeholder="Search assets, opportunities, locations…"
          className="h-10 pl-9"
          aria-label="Search marketplace"
        />
      </div>

      {/* Category pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        <CategoryPill
          active={filters.category === "all"}
          onClick={() => set({ category: "all" })}
          label="All"
        />
        {CATEGORIES.map((c) => (
          <CategoryPill
            key={c.id}
            active={filters.category === c.id}
            onClick={() => set({ category: filters.category === c.id ? "all" : c.id })}
            label={c.shortLabel}
            icon={<c.icon className="h-3.5 w-3.5" />}
          />
        ))}
      </div>

      {/* Filter row */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Location</Label>
          <Input
            value={filters.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="e.g. Lagos"
            aria-label="Filter by location"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Listing type</Label>
          <Select value={filters.listingType} onValueChange={(v) => set({ listingType: v as MarketplaceFilters["listingType"] })}>
            <SelectTrigger aria-label="Filter by listing type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All listings</SelectItem>
              <SelectItem value="franx">FRAN-X listings</SelectItem>
              <SelectItem value="vendor">Vendor listings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Sort by</Label>
          <Select value={filters.sort} onValueChange={(v) => set({ sort: v as SortMode })}>
            <SelectTrigger aria-label="Sort listings"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: low to high</SelectItem>
              <SelectItem value="price-high">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <div className="flex w-full items-center gap-2">
            <Input
              type="number"
              min={0}
              value={filters.priceMin}
              onChange={(e) => set({ priceMin: e.target.value })}
              placeholder="Min ₦"
              aria-label="Minimum price"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              min={0}
              value={filters.priceMax}
              onChange={(e) => set({ priceMax: e.target.value })}
              placeholder="Max ₦"
              aria-label="Maximum price"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{resultCount}</span> {resultCount === 1 ? "result" : "results"}
        </p>
        <Button variant="ghost" size="sm" onClick={() => onChange({ keyword: "", category: "all", location: "", listingType: "all", sort: "newest", priceMin: "", priceMax: "" })}>
          <X className="h-4 w-4" /> Clear filters
        </Button>
      </div>
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
