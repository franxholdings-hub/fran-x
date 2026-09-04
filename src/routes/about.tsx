import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";
import { PHOTOS } from "@/lib/photos";

const TITLE = "About FRAN-X Technologies | AI, Software & Digital Technology";
const DESCRIPTION =
  "FRAN-X Technologies builds AI solutions, websites, mobile apps, business automation systems, data platforms and custom software for modern businesses. Founded by Francis Ejimkeonye.";

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
        title="A technology company built for the businesses of tomorrow."
        subtitle={SITE.statement}
        photo={PHOTOS.consulting}
      />

      <section id="who-we-are" className="container-x scroll-mt-20 py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
              AI, software and automation under one technology company.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              FRAN-X Technologies builds intelligent digital products and technology systems —
              websites, mobile apps, AI, automation, data platforms and custom software — that help
              businesses operate, grow and compete.
            </p>
            <figure className="mt-6 overflow-hidden rounded-xl border border-border">
              <img
                src={PHOTOS.technology.src}
                alt={PHOTOS.technology.alt}
                loading="lazy"
                decoding="async"
                className="h-48 w-full object-cover"
              />
            </figure>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-surface/40 p-4">
                <p className="font-display text-sm font-semibold text-primary">{v.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-surface/40">
        <div className="container-x grid gap-4 py-10 sm:py-12 md:grid-cols-2">
          <div id="mission" className="glass-panel scroll-mt-20 rounded-xl p-6">
            <p className="eyebrow">Our mission</p>
            <p className="mt-3 text-base leading-relaxed">
              To build technology that helps businesses operate, grow and compete — from AI and
              software to automation and data.
            </p>
          </div>
          <div id="vision" className="glass-panel scroll-mt-20 rounded-xl p-6">
            <p className="eyebrow">Our vision</p>
            <p className="mt-3 text-base leading-relaxed">
              To become a globally recognized technology company building the digital infrastructure
              for the businesses of tomorrow.
            </p>
          </div>
        </div>
      </section>

      <section id="founder" className="container-x scroll-mt-20 py-10 sm:py-12">
        <div className="glass-panel relative grid gap-6 overflow-hidden rounded-2xl p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
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
          <div className="relative grid h-24 w-24 place-items-center rounded-2xl border border-primary/40 bg-background font-display text-2xl font-semibold text-metal">
            FE
          </div>
          <div className="relative min-w-0">
            <p className="eyebrow">Founder</p>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{SITE.founder}</h2>
            <p className="mt-1 text-sm text-primary">Founder &amp; CEO, FRAN-X Technologies</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Francis Ejimkeonye founded FRAN-X Technologies to build a technology company that
              delivers AI, software and automation systems helping businesses operate, grow and
              compete — through a single, disciplined platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/services">Explore our services</Link>
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