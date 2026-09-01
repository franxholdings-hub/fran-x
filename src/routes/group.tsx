import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { PHOTOS, type Photo } from "@/lib/photos";

const TITLE = "The FRAN-X Group | Companies & Ventures";
const DESCRIPTION =
  "A growing portfolio of FRAN-X companies across capital, energy, real estate, hospitality, aviation, automotive, technology, AI, agriculture and e-commerce.";

export const Route = createFileRoute("/group")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GroupPage,
});

export function statusTone(status: string) {
  switch (status) {
    case "Operating":
      return "border-[color:var(--success)]/50 text-[color:var(--success)]";
    case "In Development":
      return "border-primary/50 text-primary";
    case "Planned":
      return "border-border text-muted-foreground";
    default:
      return "border-border text-muted-foreground";
  }
}

const COMPANY_PHOTOS: Record<string, Photo> = {
  "fx-capital": PHOTOS.capital,
  "fx-oil": PHOTOS.energy,
  "fx-realty": PHOTOS.realEstate,
  "fx-hotels": PHOTOS.hospitality,
  "fx-air": PHOTOS.aviation,
  "fx-auto": PHOTOS.automotive,
  "fx-tech": PHOTOS.technology,
  "frix-ai": PHOTOS.ai,
  "fx-vault": PHOTOS.security,
  "fx-agric": PHOTOS.agriculture,
  eaizystore: PHOTOS.retail,
};

function GroupPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <div id="top" />
      <PageHero
        eyebrow="Corporate portfolio"
        title="The FRAN-X Group"
        subtitle="A growing portfolio of businesses across multiple industries. Each venture is listed with its accurate current status."
        photo={PHOTOS.capital}
      />
      <section className="container-x py-8 sm:py-10">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((c) => {
              const photo = COMPANY_PHOTOS[c.slug] ?? PHOTOS.capital;
              return (
              <article
                key={c.id}
                className="glass-panel group flex flex-col overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold">{c.name}</h2>
                  <Badge variant="outline" className={statusTone(c.status)}>
                    {c.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {c.industry}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-6 w-full">
                  <Link to="/contact">Explore {c.name}</Link>
                </Button>
                </div>
              </article>
              );
            })}
          </div>
        )}
        <p className="mt-6 rounded-lg border border-border/60 bg-surface/40 p-4 text-xs text-muted-foreground">
          Statuses are accurate at time of publication. Planned and future ventures are not
          represented as currently operating.
        </p>
      </section>
    </>
  );
}