import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ListingCard } from "./ListingCard";
import type { MarketplaceListing } from "@/lib/marketplace/types";

type Catalog = MarketplaceListing[];

export function ListingCarousel({
  listings,
  isSaved,
  toggle,
}: {
  listings: Catalog;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
}) {
  if (listings.length === 0) return null;

  return (
    <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
      <CarouselContent>
        {listings.map((l) => (
          <CarouselItem
            key={l.id}
            className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3"
          >
            <ListingCard listing={l} saved={isSaved(l.id)} onToggleSave={() => toggle(l.id)} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:inline-flex" />
      <CarouselNext className="hidden sm:inline-flex" />
    </Carousel>
  );
}
