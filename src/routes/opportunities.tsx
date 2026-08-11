import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { QuickInquiryForm } from "@/components/site/QuickInquiryForm";
import { OPPORTUNITY_TYPES, COMPLIANCE_NOTE } from "@/lib/site";
import { PHOTOS } from "@/lib/photos";

const TITLE = "Submit a Business Opportunity | FRAN-X Holdings";
const DESCRIPTION =
  "Submit investment, partnership, acquisition, real estate, automotive, oil & gas, technology or supplier opportunities to FRAN-X Holdings for review.";

export const Route = createFileRoute("/opportunities")({
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
  component: Opportunities,
});

function Opportunities() {
  return (
    <>
      <PageHero
        eyebrow="Opportunities"
        title="Submit a business opportunity."
        subtitle="FRAN-X reviews commercial, investment and partnership opportunities across all group industries."
        photo={PHOTOS.opportunities}
      />
      <section className="container-x max-w-3xl py-14">
        <QuickInquiryForm
          kind="opportunity"
          gateAction="submit an opportunity"
          submitLabel="Submit opportunity"
          extraFields={[
            {
              name: "opportunity_type",
              label: "Opportunity type",
              type: "select",
              options: OPPORTUNITY_TYPES,
            },
            { name: "sector", label: "Sector / industry" },
            { name: "value", label: "Indicative value (optional)" },
            { name: "location", label: "Location" },
            { name: "parties", label: "Parties involved", type: "textarea" },
            { name: "documentation", label: "Available documentation", type: "textarea" },
          ]}
        />
        <p className="mt-8 rounded-lg border border-border/60 bg-surface/40 p-4 text-xs leading-relaxed text-muted-foreground">
          Submissions are reviewed for suitability. {COMPLIANCE_NOTE}
        </p>
      </section>
    </>
  );
}