import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Globe,
  Smartphone,
  Bot,
  LineChart,
  Code2,
  Cpu,
  Check,
  Zap,
  Layers,
  LifeBuoy,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/site/HeroBackground";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SITE } from "@/lib/site";
import { PHOTOS } from "@/lib/photos";

const TITLE = "FRAN-X | AI, Software & Digital Technology";
const DESCRIPTION =
  "FRAN-X builds AI solutions, websites, mobile apps, business automation systems, data platforms and custom software for modern businesses.";

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
          name: "FRAN-X Technologies",
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

const SERVICES = [
  {
    icon: Globe,
    title: "Web Development",
    body: "Business websites, corporate sites, e-commerce, landing pages, booking platforms, marketplaces, dashboards and custom web applications.",
    cta: "Build My Website",
    to: "/build/website" as const,
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    body: "Android, iOS and cross-platform applications — business apps, e-commerce, booking, SaaS and custom mobile products.",
    cta: "Build My App",
    to: "/build/app" as const,
  },
  {
    icon: Bot,
    title: "AI & Business Automation",
    body: "AI customer support, WhatsApp automation, lead management, sales follow-up, chatbots, workflow and document automation.",
    cta: "Automate My Business",
    to: "/request" as const,
  },
  {
    icon: LineChart,
    title: "Data & Business Intelligence",
    body: "Revenue and sales dashboards, customer analytics, data visualization, reporting, AI insights and forecasting.",
    cta: "Analyze My Business",
    to: "/request" as const,
  },
  {
    icon: Code2,
    title: "Custom Software & APIs",
    body: "Custom software, backend systems, APIs, database systems, payment and third-party integrations, internal business systems and portals.",
    cta: "Build My System",
    to: "/request" as const,
  },
];

const SOLUTIONS = [
  { need: "Need an online presence?", to: "/build/website" as const, label: "Web Development" },
  { need: "Need a mobile product?", to: "/build/app" as const, label: "App Development" },
  { need: "Need repetitive work automated?", to: "/request" as const, label: "AI & Automation" },
  { need: "Need to understand your business data?", to: "/request" as const, label: "Business Intelligence" },
  { need: "Need custom infrastructure?", to: "/request" as const, label: "Software & API Development" },
];

const STEPS = [
  { step: "01", title: "Tell Us What You Need", body: "You explain your business or technology problem." },
  { step: "02", title: "We Design the Solution", body: "FRAN-X determines the right technology and scope." },
  { step: "03", title: "We Build", body: "The product or system is developed and tested." },
  { step: "04", title: "Launch & Support", body: "You receive the completed solution with ongoing support." },
];

const WHY = [
  { icon: Cpu, title: "AI-first development", body: "We design systems with intelligence built in from the start." },
  { icon: Zap, title: "Modern technology", body: "Current frameworks, cloud infrastructure and best practices." },
  { icon: Target, title: "Business-focused solutions", body: "Technology that serves real business outcomes, not novelty." },
  { icon: Layers, title: "Scalable architecture", body: "Systems built to grow with your business and user base." },
  { icon: Code2, title: "Custom-built systems", body: "Tailored to your requirements — never one-size-fits-all." },
  { icon: LifeBuoy, title: "Continuous support", body: "Maintenance, improvements and support after launch." },
];

function Index() {
  return (
    <>
      {/* HERO */}
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
          <p className="eyebrow animate-rise">Technology Company · Lagos, Nigeria</p>
          <h1 className="animate-rise mt-3 max-w-3xl text-2xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            Build. Automate. <span className="text-metal">Scale.</span>
          </h1>
          <p className="animate-rise mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            FRAN-X builds intelligent software, AI solutions and digital systems for businesses ready
            to grow.
          </p>
          <div className="animate-rise mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <Link to="/request">
                Start a Project <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/frix-ai">
                <Sparkles /> Explore FRIX AI
              </Link>
            </Button>
          </div>
          <p className="animate-rise mt-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI · Software · Automation · Data
          </p>
        </div>
      </section>

      {/* SECTION 2 — WHAT FRAN-X DOES */}
      <section className="container-x py-10 sm:py-12">
        <SectionHeading
          eyebrow="What we do"
          title="Technology that solves real business problems."
          subtitle="Five core services covering the full spectrum of modern business technology — from websites and mobile apps to AI, automation and custom software."
        />
        <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="glass-panel group flex flex-col rounded-xl p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 text-primary">
                <s.icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <h3 className="mt-4 font-display text-[0.95rem] font-semibold">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to={s.to}>{s.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — FRIX AI */}
      <section className="border-y border-border/60 bg-surface/40">
        <div className="container-x py-10 sm:py-12">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
            <div>
              <p className="eyebrow">Flagship Product</p>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                Meet <span className="text-metal">FRIX AI</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Your intelligent AI workspace for research, content, documents, analysis and business
                productivity.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <Button asChild>
                  <Link to="/frix-ai">
                    <Sparkles /> Explore FRIX AI
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "AI conversations",
                "Research assistance",
                "Business assistance",
                "AI-powered recommendations",
                "Inquiry capture",
                "Callback scheduling",
              ].map((cap) => (
                <div
                  key={cap}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm"
                >
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — BUSINESS SOLUTIONS */}
      <section className="container-x py-10 sm:py-12">
        <SectionHeading
          eyebrow="Business solutions"
          title="We don't just make websites. We solve technology problems."
          subtitle="Whatever your business needs, there's a FRAN-X service built for it."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((sol) => (
            <Link
              key={sol.need}
              to={sol.to}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/40 p-4 transition-colors hover:border-primary/50"
            >
              <div>
                <p className="text-sm font-medium">{sol.need}</p>
                <p className="mt-1 text-xs text-primary">{sol.label}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="border-y border-border/60 bg-surface/40">
        <div className="container-x py-10 sm:py-12">
          <SectionHeading eyebrow="How it works" title="From idea to launch in four steps." />
          <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step} className="rounded-xl border border-border bg-background/60 p-4">
                <p className="font-display text-xl font-semibold text-primary/70">{s.step}</p>
                <p className="mt-2 text-sm font-medium">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
          <Button asChild className="mt-6" size="lg">
            <Link to="/request">
              Start Your Project <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* SECTION 6 — WHY FRAN-X */}
      <section className="container-x py-10 sm:py-12">
        <SectionHeading eyebrow="Why FRAN-X" title="A serious technology partner." />
        <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="rounded-xl border border-border bg-surface/40 p-5">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-primary/30 text-primary">
                <w.icon className="h-[1.05rem] w-[1.05rem]" />
              </span>
              <h3 className="mt-3 font-display text-sm font-semibold">{w.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — FINAL CTA */}
      <section className="container-x pb-14">
        <div className="glass-panel flex flex-col gap-5 rounded-2xl p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold sm:text-2xl">
              Have a technology idea? Let's build it.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From websites and mobile apps to AI systems and business automation, FRAN-X turns
              technology ideas into working products.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/request">Start a Project</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/frix-ai">
                <Sparkles /> Try FRIX AI
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
