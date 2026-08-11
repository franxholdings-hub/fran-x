import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";
import { PHOTOS } from "@/lib/photos";

const TITLE = "About FRAN-X Holdings | Diversified Business Group";
const DESCRIPTION =
  "FRAN-X Holdings is a diversified business group focused on technology, commerce, investment, infrastructure and emerging industries, founded by Francis Ejimkeonye.";

export const Route = createFileRoute("/about")({
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
  component: About,
});

const VALUES = [
  { title: "Premium", body: "Standards and delivery built for serious organisations." },
  { title: "Innovative", body: "Technology and AI at the centre of every venture." },
  { title: "Trustworthy", body: "Transparent status, honest positioning, verified process." },
  { title: "Global", body: "Built in Nigeria, structured to expand into new markets." },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About FRAN-X"
        title="A diversified business group built for the next economy."
        subtitle={SITE.statement}
        photo={PHOTOS.consulting}
      />

      <section id="who-we-are" className="container-x scroll-mt-24 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Technology, commerce, investment and infrastructure under one group.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              FRAN-X is a diversified business group focused on technology, commerce, investment,
              infrastructure, and emerging industries. We build digital products, advise businesses,
              coordinate commercial transactions and develop ventures across multiple sectors.
            </p>
            <figure className="mt-8 overflow-hidden rounded-xl border border-border">
              <img
                src={PHOTOS.opportunities.src}
                alt={PHOTOS.opportunities.alt}
                loading="lazy"
                decoding="async"
                className="h-64 w-full object-cover"
              />
            </figure>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-surface/40 p-5">
                <p className="font-display text-sm font-semibold text-primary">{v.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-surface/40">
        <div className="container-x grid gap-6 py-16 md:grid-cols-2">
          <div id="mission" className="glass-panel scroll-mt-24 rounded-xl p-8">
            <p className="eyebrow">Our mission</p>
            <p className="mt-4 text-lg leading-relaxed">
              To build and connect businesses, technologies, capital, and opportunities that create
              long-term economic value.
            </p>
          </div>
          <div id="vision" className="glass-panel scroll-mt-24 rounded-xl p-8">
            <p className="eyebrow">Our vision</p>
            <p className="mt-4 text-lg leading-relaxed">
              To become a globally recognized business group operating across multiple high-growth
              industries.
            </p>
          </div>
        </div>
      </section>

      <section id="founder" className="container-x scroll-mt-24 py-16">
        <div className="glass-panel relative grid gap-8 overflow-hidden rounded-2xl p-8 sm:p-12 lg:grid-cols-[auto_1fr] lg:items-center">
          <img
            src={PHOTOS.capital.src}
            alt={PHOTOS.capital.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-15"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60"
          />
          <div className="relative grid h-28 w-28 place-items-center rounded-2xl border border-primary/40 bg-background font-display text-3xl font-semibold text-metal">
            FE
          </div>
          <div className="relative min-w-0">
            <p className="eyebrow">Founder</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{SITE.founder}</h2>
            <p className="mt-1 text-sm text-primary">Founder &amp; CEO, FRAN-X Holdings</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Francis Ejimkeonye founded FRAN-X Holdings to build a business group capable of
              operating across technology, commerce, investment and infrastructure — connecting
              clients, capital and opportunity through a single, disciplined platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/group">Explore the FRAN-X Group</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact the team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}