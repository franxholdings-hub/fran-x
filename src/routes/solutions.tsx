import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Globe,
  Smartphone,
  Bot,
  LineChart,
  Code2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PHOTOS } from "@/lib/photos";

const TITLE = "Business Solutions | FRAN-X Technologies";
const DESCRIPTION =
  "FRAN-X maps your business problem to the right technology — web, mobile, AI automation, data intelligence or custom software.";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SolutionsPage,
});

const SOLUTIONS = [
  {
    icon: Globe,
    need: "I need an online presence",
    label: "Web Development",
    body: "Business websites, corporate sites, e-commerce, landing pages and custom web applications.",
    to: "/build/website" as const,
    cta: "Build My Website",
  },
  {
    icon: Smartphone,
    need: "I need a mobile product",
    label: "App Development",
    body: "Android, iOS and cross-platform apps for business, e-commerce, booking and SaaS.",
    to: "/build/app" as const,
    cta: "Build My App",
  },
  {
    icon: Bot,
    need: "I need to automate repetitive work",
    label: "AI & Automation",
    body: "AI customer support, WhatsApp automation, lead management, chatbots and workflow automation.",
    to: "/request" as const,
    cta: "Automate My Business",
  },
  {
    icon: LineChart,
    need: "I need to understand my business data",
    label: "Business Intelligence",
    body: "Revenue dashboards, sales and customer analytics, reporting, AI insights and forecasting.",
    to: "/request" as const,
    cta: "Analyze My Business",
  },
  {
    icon: Code2,
    need: "I need custom infrastructure",
    label: "Software & API Development",
    body: "Custom software, backend systems, APIs, database systems and internal business portals.",
    to: "/request" as const,
    cta: "Build My System",
  },
];

function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Business Solutions"
        title="Tell us the problem. We bring the technology."
        subtitle="FRAN-X doesn't just build websites — we solve technology problems. Find the solution that fits your business."
        photo={PHOTOS.technology}
      >
        <Button asChild size="lg">
          <Link to="/request">
            Start a Project <ArrowRight />
          </Link>
        </Button>
      </PageHero>

      <section className="container-x py-8 sm:py-10">
        <SectionHeading
          eyebrow="Solution finder"
          title="What do you need?"
          subtitle="Pick the problem that sounds like yours — we'll connect you to the right FRAN-X service."
        />
        <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <div
              key={s.need}
              className="glass-panel group flex flex-col rounded-xl p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 text-primary">
                <s.icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </p>
              <h3 className="mt-1.5 font-display text-[0.95rem] font-semibold">{s.need}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to={s.to}>{s.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-14">
        <div className="glass-panel flex flex-col gap-5 rounded-2xl p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold sm:text-2xl">Not sure which fits?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us what you're trying to achieve and we'll recommend the right approach.
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
