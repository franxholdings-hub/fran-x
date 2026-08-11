import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { COMPLIANCE_NOTE } from "@/lib/site";
import type { ServiceRow } from "@/lib/search";
import { PHOTOS, type Photo } from "@/lib/photos";

const CATEGORY_PHOTOS: Record<string, Photo> = {
  "Technology & Digital": PHOTOS.technology,
  "AI & Automation": PHOTOS.ai,
  "Business & Data": PHOTOS.data,
  "Marketing & Copywriting": PHOTOS.marketing,
  "Creative & Media": PHOTOS.marketing,
  "E-commerce": PHOTOS.ecommerce,
  "Real Estate": PHOTOS.realEstate,
  Automotive: PHOTOS.automotive,
  "Oil & Gas / Energy": PHOTOS.energy,
};

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
    const readable = params.slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    const title = `${readable} | FRAN-X Holdings Services`;
    const description = `Request ${readable} from FRAN-X Holdings — professional delivery for businesses, startups, investors and organizations.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data as ServiceRow | null;
    },
  });

  if (isLoading) {
    return (
      <div className="container-x py-20">
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-semibold">Service not found</h1>
        <Button asChild className="mt-6">
          <Link to="/services">Back to services</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={data.category}
        title={data.name}
        subtitle={data.description}
        photo={CATEGORY_PHOTOS[data.category] ?? PHOTOS.technology}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/request" search={{ service: data.slug, category: "" }}>
              {data.cta}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/services">Browse all services</Link>
          </Button>
        </div>
      </PageHero>
      <section className="container-x max-w-3xl py-14">
        <h2 className="font-display text-lg font-semibold">What you get</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li>• A structured scoping conversation with the FRAN-X team.</li>
          <li>• A written proposal covering deliverables, timeline and commercials.</li>
          <li>• A single reference ID so you can track progress in your client portal.</li>
          <li>• Direct communication by portal chat, email, phone or WhatsApp.</li>
        </ul>
        <p className="mt-10 rounded-lg border border-border/60 bg-surface/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {COMPLIANCE_NOTE}
        </p>
      </section>
    </>
  );
}