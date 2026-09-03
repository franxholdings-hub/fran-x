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
            className="basis-[42%] pl-3 sm:basis-[31%] lg:basis-[23%] xl:basis-[18%]"
          >
            <ListingCard listing={l} saved={isSaved(l.id)} onToggleSave={() => toggle(l.id)} vertical />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:inline-flex" />
      <CarouselNext className="hidden sm:inline-flex" />
    </Carousel>
  );
}
