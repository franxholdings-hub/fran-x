import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/cookies")({
  head: () =>
    legalHead(
      "Cookie Policy | FRAN-X Technologies",
      "How FRAN-X Technologies uses cookies and local storage to keep you signed in and to understand platform usage.",
    ),
  component: () => (
    <LegalPage
      title="Cookie Policy"
      updated="Last updated: 2026"
      sections={[
        {
          heading: "Essential storage",
          body: "We use secure browser storage to keep you signed in to your client portal. Without it, authentication cannot work.",
        },
        {
          heading: "Usage measurement",
          body: "We record anonymous page visits so we can understand which parts of the platform are useful. This does not identify you personally unless you are signed in.",
        },
        {
          heading: "Managing cookies",
          body: "You can clear or block browser storage at any time through your browser settings. Some platform features, including sign-in, will stop working if you do.",
        },
      ]}
    />
  ),
});