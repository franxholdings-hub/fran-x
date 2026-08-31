// Service card for the FRAN-X Digital Services marketplace.

import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatNaira,
  type DigitalService,
} from "@/lib/digital-store/catalog";
import { PHOTOS } from "@/lib/photos";

export function ServiceCard({ service }: { service: DigitalService }) {
  const photo = PHOTOS[service.cover];

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface/40 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative h-36 overflow-hidden">
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="border-primary/40 bg-background/80 text-primary">
            {service.groupLabel}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold leading-snug">{service.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {service.billingLabel}
            </p>
            <p className="font-display text-xl font-semibold">{formatNaira(service.priceFrom)}</p>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {service.deliveryEstimate}
          </span>
        </div>

        <div className="mt-4">
          <Button asChild size="sm" className="w-full">
            <Link to="/store/services/$slug" params={{ slug: service.slug }}>
              {service.customQuoteOnly ? "Request a Quote" : "View & Request"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
