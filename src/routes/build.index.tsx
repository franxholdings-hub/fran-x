import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Smartphone, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { PHOTOS } from "@/lib/photos";

const TITLE = "Build With FRAN-X | Websites, Apps & AI Systems";
const DESCRIPTION =
  "Start a website, mobile app or AI project with FRAN-X Holdings. Structured scoping, clear proposals and professional delivery.";

export const Route = createFileRoute("/build/")({
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
  component: BuildIndex,
});

const OPTIONS = [
  {
    icon: Globe,
    title: "Build My Website",
    body: "Business, corporate, e-commerce, portfolio, booking or custom web platforms.",
    to: "/build/website" as const,
  },
  {
    icon: Smartphone,
    title: "Build My App",
    body: "Android, iOS or cross-platform apps with backend, payments and dashboards.",
    to: "/build/app" as const,
  },
  {
    icon: Bot,
    title: "Build My AI Solution",
    body: "Chatbots, automation, AI content systems and internal AI tools.",
    to: "/request" as const,
  },
];

function BuildIndex() {
  return (
    <>
      <PageHero
        eyebrow="Build with FRAN-X"
        title="Start your website, app or AI project."
        subtitle="Choose a track and we will scope, price and deliver it."
        photo={PHOTOS.technology}
      />
      <section className="container-x grid gap-5 py-14 md:grid-cols-3">
        {OPTIONS.map((o) => (
          <div key={o.title} className="glass-panel flex flex-col rounded-xl p-7">
            <o.icon className="h-6 w-6 text-primary" />
            <h2 className="mt-5 font-display text-lg font-semibold">{o.title}</h2>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{o.body}</p>
            <Button asChild className="mt-6">
              <Link to={o.to}>Get started</Link>
            </Button>
          </div>
        ))}
      </section>
    </>
  );
}