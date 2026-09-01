import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_CATEGORIES, COMPLIANCE_NOTE } from "@/lib/site";
import { searchServices, categoryAnchor, type ServiceRow } from "@/lib/search";
import { PHOTOS } from "@/lib/photos";

const TITLE = "Services | Web, App, AI, Consulting, Real Estate & Energy | FRAN-X";
const DESCRIPTION =
  "Search the full FRAN-X services directory: website development, mobile apps, AI solutions, business consulting, e-commerce, real estate, automotive and oil & gas services.";

const EXAMPLES = [
  "I need a website",
  "I need a mobile app",
  "I need an AI chatbot",
  "I want to sell my car",
  "I need a property",
  "I need business consulting",
  "I need an online store",
  "I have an oil buyer",
];

export const Route = createFileRoute("/services")({
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
  component: ServicesPage,
});

function ServicesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ServiceRow[];
    },
  });

  const services = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const byCategory = category === "All" ? services : services.filter((s) => s.category === category);
    return searchServices(byCategory, query);
  }, [services, category, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ServiceRow[]>();
    for (const s of filtered) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const searching = query.trim().length > 0;

  return (
    <>
      <PageHero
        eyebrow="Services directory"
        title="Find the exact service you need."
        subtitle="Type what you need in plain language — FRAN-X will match it to the right service."
        photo={PHOTOS.marketing}
      >
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. I need a website with online payments"
              aria-label="Search services"
              className="h-11 rounded-lg border-border bg-surface pl-10 text-sm"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuery(ex)}
                className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </PageHero>

      <section className="container-x py-8 sm:py-10">
        <div className="flex flex-wrap gap-2">
          {["All", ...SERVICE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                category === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel mt-10 rounded-xl p-8 text-center">
            <p className="font-display text-lg font-semibold">No exact match found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us what you need and we will scope it for you.
            </p>
            <Button asChild className="mt-5">
              <Link to="/request">Request a Service</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-8 sm:space-y-10">
            {grouped.map(([cat, items]) => (
              <div key={cat} id={categoryAnchor(cat)} className="scroll-mt-20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold sm:text-2xl">{cat}</h2>
                  <Badge variant="outline">{items.length} services</Badge>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((s) => (
                    <article
                      key={s.id}
                      className="flex flex-col rounded-xl border border-border bg-surface/40 p-6 transition-colors hover:border-primary/50"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {s.category}
                      </p>
                      <h3 className="mt-2 font-display text-base font-semibold">{s.name}</h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {s.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button asChild size="sm">
                          <Link to="/request" search={{ service: s.slug, category: "" }}>
                            {searching ? "Request This Service" : s.cta}
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/services/$slug" params={{ slug: s.slug }}>
                            Details <ArrowRight />
                          </Link>
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 rounded-lg border border-border/60 bg-surface/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {COMPLIANCE_NOTE}
        </p>
      </section>
    </>
  );
}