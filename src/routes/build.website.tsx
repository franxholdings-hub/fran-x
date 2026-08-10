import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { QuickInquiryForm } from "@/components/site/QuickInquiryForm";

const TITLE = "Build My Website | Web Development by FRAN-X Holdings";
const DESCRIPTION =
  "Request a business, corporate, e-commerce, portfolio or custom website build from FRAN-X Holdings.";

export const Route = createFileRoute("/build/website")({
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
  component: BuildWebsite,
});

function BuildWebsite() {
  return (
    <>
      <PageHero
        eyebrow="Website development"
        title="Build my website"
        subtitle="Tell us the type of website, the features you need and your timeline."
      />
      <section className="container-x max-w-3xl py-14">
        <QuickInquiryForm
          kind="website"
          category="Website"
          gateAction="request a website build"
          submitLabel="Submit website request"
          extraFields={[
            {
              name: "website_type",
              label: "Website type",
              type: "select",
              options: [
                "Business / Corporate",
                "E-commerce store",
                "Portfolio",
                "Booking / Service",
                "Landing page",
                "Custom platform",
              ],
            },
            { name: "pages", label: "Approx. number of pages" },
            { name: "features", label: "Required features", type: "textarea" },
            { name: "references", label: "Reference websites (optional)", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}