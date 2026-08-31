import { createFileRoute } from "@tanstack/react-router";
import { ServiceCard } from "@/components/store/ServiceCard";
import { StoreSectionHeading } from "@/components/store/ProductCard";
import { PageHero } from "@/components/site/PageHero";
import { getServiceGroups } from "@/lib/digital-store/catalog";
import { COMPLIANCE_NOTE } from "@/lib/site";

const TITLE = "Digital Services | Websites, Marketing, Branding & Automation | FRAN-X";
const DESCRIPTION =
  "Professional digital services from FRAN-X — website development, digital marketing, branding and business automation. Starting prices shown; complex projects quoted individually.";

export const Route = createFileRoute("/store/services/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const groups = getServiceGroups();

  return (
    <>
      <PageHero
        eyebrow="FRAN-X Digital Services"
        title="Professional services to build and grow your business"
        subtitle="Websites, digital marketing, branding and automation. Prices shown are starting prices — complex projects are quoted individually."
      />

      <section className="container-x py-10 sm:py-14">
        <div className="space-y-14">
          {groups.map(({ group, label, services }) => (
            <div key={group} id={group} className="scroll-mt-24">
              <StoreSectionHeading eyebrow="Service group" title={label} />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-14 rounded-lg border border-border/60 bg-surface/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {COMPLIANCE_NOTE}
        </p>
      </section>
    </>
  );
}
