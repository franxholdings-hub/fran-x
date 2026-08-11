import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { QuickInquiryForm } from "@/components/site/QuickInquiryForm";
import { PHOTOS } from "@/lib/photos";

const TITLE = "Build My App | Mobile App Development by FRAN-X Holdings";
const DESCRIPTION =
  "Request an Android, iOS or cross-platform mobile app build from FRAN-X Holdings, including backend, payments and dashboards.";

export const Route = createFileRoute("/build/app")({
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
  component: BuildApp,
});

function BuildApp() {
  return (
    <>
      <PageHero
        eyebrow="App development"
        title="Build my app"
        subtitle="Tell us the platform, core features and how your users will use the app."
        photo={PHOTOS.mobile}
      />
      <section className="container-x max-w-3xl py-14">
        <QuickInquiryForm
          kind="app"
          category="Mobile App"
          gateAction="request an app build"
          submitLabel="Submit app request"
          extraFields={[
            {
              name: "platform",
              label: "Platform",
              type: "select",
              options: ["Android", "iOS", "Android + iOS", "Web app", "Not sure"],
            },
            { name: "core_features", label: "Core features", type: "textarea" },
            { name: "users", label: "Who will use the app?" },
            { name: "integrations", label: "Integrations (payments, maps, etc.)", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}