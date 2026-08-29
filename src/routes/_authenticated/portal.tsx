import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Dashboard | FRAN-X Holdings" },
      {
        name: "description",
        content: "Your FRAN-X user dashboard — profile, opportunities, inquiries, FRIX AI, subscription and settings.",
      },
      { property: "og:title", content: "Dashboard | FRAN-X Holdings" },
      { property: "og:description", content: "Your FRAN-X user dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Portal,
});

function Portal() {
  return <DashboardShell />;
}
