import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_MAP } from "@/lib/marketplace/catalog";
import type { MarketplaceListing } from "@/lib/marketplace/types";
import {
  CategoryIcon,
  VerifiedBadge,
  SourceBadge,
  SaveButton,
  formatDate,
} from "./shared";
import { InquiryDialog } from "./InquiryDialog";

export function ListingCard({
  listing,
  saved,
  onToggleSave,
}: {
  listing: MarketplaceListing;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const cat = CATEGORY_MAP[listing.category];
  return (
    <article className="glass-panel group flex flex-col overflow-hidden rounded-xl">
      <Link to="/marketplace/$slug" params={{ slug: listing.slug }} className="relative block aspect-[16/10] overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <SourceBadge source={listing.source} />
          {listing.featured ? (
            <Badge variant="outline" className="border-primary/40 bg-background/80 text-primary">
              Featured
            </Badge>
          ) : null}
        </div>
        <div className="absolute right-3 top-3">
          <SaveButton saved={saved} onToggle={onToggleSave} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CategoryIcon id={listing.category} className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground/80">{cat.shortLabel}</span>
          <span>·</span>
          <span>{listing.subtype}</span>
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-base font-semibold leading-snug">
          <Link to="/marketplace/$slug" params={{ slug: listing.slug }} className="hover:text-primary">
            {listing.title}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {listing.location}
        </p>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-display text-lg font-semibold text-primary">{listing.price}</span>
          <VerifiedBadge verified={listing.verified} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="truncate">{listing.vendorName}</span>
          <span>{formatDate(listing.dateListed)}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/marketplace/$slug" params={{ slug: listing.slug }}>View Details</Link>
          </Button>
          <InquiryDialog
            listing={listing}
            trigger={
              <Button size="sm">
                <MessageCircle className="h-4 w-4" /> Contact
              </Button>
            }
          />
        </div>
      </div>
    </article>
  );
}
