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
} from "./shared";
import { InquiryDialog } from "./InquiryDialog";

/** Compact marketplace listing card — horizontal on mobile, vertical on
 *  larger screens, mirroring the Digital Store product card density. */
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
    <article className="glass-panel group flex flex-row overflow-hidden rounded-xl transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 sm:flex-col sm:hover:-translate-y-1">
      <Link
        to="/marketplace/$slug"
        params={{ slug: listing.slug }}
        className="relative block shrink-0 w-28 overflow-hidden sm:w-full sm:aspect-[4/3]"
      >
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/5 to-transparent sm:from-background/80 sm:via-background/10" />
        <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
          <SaveButton saved={saved} onToggle={onToggleSave} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <SourceBadge source={listing.source} />
          {listing.featured ? (
            <Badge variant="outline" className="border-primary/40 bg-background/80 px-1.5 py-0 text-[10px] text-primary">
              Featured
            </Badge>
          ) : null}
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CategoryIcon id={listing.category} className="h-3 w-3 text-primary" />
          <span className="font-medium text-foreground/80">{cat.shortLabel}</span>
        </div>

        <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug sm:text-[0.95rem]">
          <Link to="/marketplace/$slug" params={{ slug: listing.slug }} className="transition-colors group-hover:text-primary">
            {listing.title}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {listing.location}
        </p>

        <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-muted-foreground sm:line-clamp-2">{listing.description}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-display text-sm font-semibold text-primary sm:text-base">{listing.price}</span>
          <VerifiedBadge verified={listing.verified} />
        </div>

        <div className="mt-2.5 flex gap-2 sm:mt-3">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/marketplace/$slug" params={{ slug: listing.slug }}>View</Link>
          </Button>
          <InquiryDialog
            listing={listing}
            trigger={
              <Button size="sm" className="flex-1">
                <MessageCircle className="h-4 w-4" /> Contact
              </Button>
            }
          />
        </div>
      </div>
    </article>
  );
}
