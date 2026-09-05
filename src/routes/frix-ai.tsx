import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  MessageSquare,
  Search,
  Briefcase,
  Lightbulb,
  Send,
  CalendarClock,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { openFrix } from "@/lib/frix";
import { PHOTOS } from "@/lib/photos";

const TITLE = "FRIX AI | AI Assistant by FRAN-X Technologies";
const DESCRIPTION =
  "FRIX AI is the FRAN-X intelligent AI workspace — chat, research assistance, business qualification, AI-powered recommendations and inquiry capture.";

export const Route = createFileRoute("/frix-ai")({
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
  component: FrixAiPage,
});

const CAPABILITIES = [
  {
    icon: MessageSquare,
    title: "AI Conversations",
    body: "Chat with FRIX AI about your business, projects and technology needs in plain language.",
  },
  {
    icon: Search,
    title: "Research Assistance",
    body: "Get answers grounded in FRAN-X's verified knowledge base — no hallucinated facts.",
  },
  {
    icon: Briefcase,
    title: "Business Assistance",
    body: "FRIX captures your requirement, budget, timeline and contact details as you chat.",
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Recommendations",
    body: "Receive draft proposals and recommended next steps for your technology project.",
  },
  {
    icon: Send,
    title: "Inquiry Capture",
    body: "Qualified inquiries are forwarded to the FRAN-X team with a unique reference ID.",
  },
  {
    icon: CalendarClock,
    title: "Callback Scheduling",
    body: "Book a callback with the FRAN-X team at a time that suits you, right from the chat.",
  },
];

const PLANS = [
  {
    name: "Explorer",
    price: "Free",
    period: "7-day trial",
    blurb: "Try FRIX AI and core FRAN-X services at no cost.",
    features: ["FRIX AI chat", "7-day free trial", "No card required"],
    cta: "Start free trial",
    to: "/auth" as const,
  },
  {
    name: "Professional",
    price: "From /mo",
    period: "subscription",
    blurb: "Unlock premium FRIX AI capabilities and higher usage.",
    features: ["Full FRIX AI access", "Higher usage limits", "Priority responses", "Inquiry tracking"],
    cta: "View Plans",
    to: "/pricing" as const,
    featured: true,
  },
  {
    name: "Business",
    price: "Custom",
    period: "for teams",
    blurb: "For organisations that need FRIX AI at scale.",
    features: ["Team access", "Custom usage", "Dedicated support", "Automation retainers"],
    cta: "Talk to FRAN-X",
    to: "/request" as const,
  },
];

function FrixAiPage() {
  return (
    <>
      <PageHero
        eyebrow="Flagship Product"
        title="Meet FRIX AI"
        subtitle="Your intelligent AI workspace for research, business assistance and technology inquiries — grounded in verified FRAN-X knowledge."
        photo={PHOTOS.technology}
      >
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/frix-ai/workspace">
              <Sparkles /> Open FRIX Workspace
            </Link>
          </Button>
          <Button size="lg" variant="outline" onClick={() => openFrix()}>
            Quick chat (no sign-in)
          </Button>
        </div>
      </PageHero>

      <section className="container-x py-8 sm:py-10">
        <SectionHeading
          eyebrow="Capabilities"
          title="What FRIX AI can do"
          subtitle="FRIX AI is a real, working AI assistant — not a mockup. It chats, qualifies, recommends and routes your inquiry to the FRAN-X team."
        />
        <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="glass-panel rounded-xl p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 text-primary">
                <c.icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <h3 className="mt-4 font-display text-[0.95rem] font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-surface/40">
        <div className="container-x py-8 sm:py-10">
          <SectionHeading
            eyebrow="How it works"
            title="From question to qualified inquiry"
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Start chatting", body: "Open FRIX AI and describe what you need." },
              { step: "02", title: "FRIX qualifies", body: "It captures your requirement, budget and timeline." },
              { step: "03", title: "Get a recommendation", body: "FRIX drafts a proposal and next steps." },
              { step: "04", title: "Team follows up", body: "Qualified inquiries reach FRAN-X with a reference ID." },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-border bg-background/60 p-4">
                <p className="font-display text-xl font-semibold text-primary/70">{s.step}</p>
                <p className="mt-2 text-sm font-medium">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
          <Button className="mt-6" size="lg" onClick={() => openFrix()}>
            <Sparkles /> Try FRIX AI now
          </Button>
        </div>
      </section>

      <section className="container-x py-8 sm:py-10">
        <SectionHeading eyebrow="Plans" title="Start free. Upgrade anytime." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`glass-panel flex flex-col rounded-xl p-6 ${p.featured ? "ring-2 ring-primary" : ""}`}
            >
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
              <p className="mt-4 font-display text-3xl font-semibold">
                {p.price}
                <span className="ml-1 text-sm font-normal text-muted-foreground">{p.period}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-5 w-full" variant={p.featured ? "default" : "outline"}>
                <Link to={p.to}>{p.cta} <ArrowRight /></Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-14">
        <div className="glass-panel flex flex-col gap-5 rounded-2xl p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold sm:text-2xl">Have a project in mind?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chat with FRIX AI to scope it, or start a project request directly.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => openFrix()}>
              <Sparkles /> Try FRIX AI
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/request">Start a Project</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
