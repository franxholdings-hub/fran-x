import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Compass,
  Send,
  Network,
  Cpu,
  Building2,
  Car,
  Fuel,
  ShoppingCart,
  LineChart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/site/HeroBackground";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SITE, COMPLIANCE_NOTE } from "@/lib/site";
import { PHOTOS } from "@/lib/photos";

const TITLE = "FRAN-X Holdings | Technology, Business & Investment Group";
const DESCRIPTION =
  "FRAN-X Holdings builds websites, mobile apps and AI solutions, and delivers business consulting, e-commerce, real estate, automotive and energy services across Nigeria and beyond.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "FRAN-X Holdings",
          slogan: SITE.tagline,
          description: DESCRIPTION,
          email: SITE.email,
          telephone: SITE.phoneTel,
          founder: { "@type": "Person", name: SITE.founder },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Festac Town, Lagos",
            addressCountry: "NG",
          },
        }),
      },
    ],
  }),
  component: Index,
});

const CORE_ACTIONS = [
  {
    icon: Compass,
    label: "Discover",
    body: "Explore FRAN-X companies, industries, and services.",
    cta: "Explore FRAN-X",
    to: "/group" as const,
  },
  {
    icon: Send,
    label: "Request",
    body: "Tell FRAN-X what you need and request a service.",
    cta: "Request a Service",
    to: "/request" as const,
  },
  {
    icon: Network,
    label: "Connect",
    body: "Submit a business, investment, partnership, property, automotive, technology, or energy opportunity.",
    cta: "Submit an Opportunity",
    to: "/opportunities" as const,
  },
];

const CAPABILITIES = [
  {
    icon: Cpu,
    title: "Technology & AI",
    body: "Websites, mobile apps, platforms, automation and AI systems.",
    photo: PHOTOS.technology,
  },
  {
    icon: LineChart,
    title: "Business & Data",
    body: "Consulting, strategy, research and commercial development.",
    photo: PHOTOS.data,
  },
  {
    icon: ShoppingCart,
    title: "E-commerce",
    body: "Store builds, catalogue operations and online growth.",
    photo: PHOTOS.ecommerce,
  },
  {
    icon: Building2,
    title: "Real Estate",
    body: "Sourcing, advisory, marketing and deal facilitation.",
    photo: PHOTOS.realEstate,
  },
  {
    icon: Car,
    title: "Automotive",
    body: "Vehicle sourcing, brokerage and transaction coordination.",
    photo: PHOTOS.automotive,
  },
  {
    icon: Fuel,
    title: "Oil & Gas / Energy",
    body: "Commercial advisory, matching and deal coordination.",
    photo: PHOTOS.energy,
  },
];

const JOURNEY = [
  { step: "01", title: "Discover", body: "Understand what FRAN-X does and which capability fits you." },
  { step: "02", title: "Search", body: "Find the exact service or opportunity you need." },
  { step: "03", title: "Request", body: "Submit a structured request and receive a reference ID." },
  { step: "04", title: "Connect", body: "Talk to us in-platform, by email, phone or WhatsApp." },
  { step: "05", title: "Convert", body: "Review, proposal, agreement and delivery." },
];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <img
          src={PHOTOS.hero.src}
          alt={PHOTOS.hero.alt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/55"
        />
        <HeroBackground />
        <div className="container-x relative py-12 sm:py-16 lg:py-20">
          <p className="eyebrow animate-rise">Diversified Business Group · Lagos, Nigeria</p>
          <h1 className="animate-rise mt-3 max-w-3xl text-2xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            Building Businesses. <span className="text-metal">Connecting Opportunities.</span>{" "}
            Creating the Future.
          </h1>
          <p className="animate-rise mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            FRAN-X provides technology, business, investment, consulting, and commercial solutions
            for individuals, startups, companies, investors, and organizations.
          </p>
          <div className="animate-rise mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <Link to="/request">
                Request a Service <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/services">Explore Our Services</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/build">Build With FRAN-X</Link>
            </Button>
          </div>
          <p className="animate-rise mt-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Founded by {SITE.founder} — Founder &amp; CEO
          </p>
        </div>
      </section>

      <section className="container-x py-10 sm:py-12">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {CORE_ACTIONS.map((action) => (
            <div
              key={action.label}
              className="glass-panel group flex flex-col rounded-xl p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 text-primary">
                <action.icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <p className="eyebrow mt-4">{action.label}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{action.body}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to={action.to}>{action.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-surface/40">
        <div className="container-x py-10 sm:py-12">
          <SectionHeading
            eyebrow="Capabilities"
            title="One group. Multiple industries."
            subtitle="FRAN-X operates across technology, artificial intelligence, business consulting, digital services, e-commerce, real estate, automotive, oil & gas, investment, agriculture, hospitality, aviation and other future industries."
          />
          <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <Link
                key={c.title}
                to="/services"
                className="group overflow-hidden rounded-xl border border-border bg-background/60 transition-colors hover:border-primary/50"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={c.photo.src}
                    alt={c.photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
                  />
                </div>
                <div className="p-4">
                  <c.icon className="h-[1.15rem] w-[1.15rem] text-primary" />
                  <h3 className="mt-2 font-display text-[0.95rem] font-semibold">{c.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-10 sm:py-12">
        <SectionHeading eyebrow="How it works" title="The FRAN-X journey" />
        <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {JOURNEY.map((j) => (
            <div key={j.step} className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="font-display text-xl font-semibold text-primary/70">{j.step}</p>
              <p className="mt-2 text-sm font-medium">{j.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{j.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-14">
        <div className="glass-panel flex flex-col gap-5 rounded-2xl p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold sm:text-2xl">
              Need a website, an app, or a business partner?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{SITE.statement}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/build/website">Build My Website</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/build/app">Build My App</Link>
            </Button>
          </div>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{COMPLIANCE_NOTE}</p>
      </section>
    </>
  );
}
