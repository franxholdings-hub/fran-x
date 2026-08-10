import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/disclaimer")({
  head: () =>
    legalHead(
      "Disclaimer | FRAN-X Holdings",
      "Important disclosures regarding FRAN-X Holdings services, regulated industries, licensing and business information.",
    ),
  component: () => (
    <LegalPage
      title="Disclaimer"
      updated="Last updated: 2026"
      sections={[
        {
          heading: "No regulatory representation",
          body: "FRAN-X Holdings does not represent itself as a licensed petroleum operator, dealer, broker, financial institution, or investment adviser where a specific licence or regulatory approval is required.",
        },
        {
          heading: "Regulated industries",
          body: "Certain services, transactions, and activities may be subject to applicable Nigerian and international laws, licensing requirements, regulatory approvals, due diligence, and/or execution through appropriately licensed partners.",
        },
        {
          heading: "Venture status",
          body: "Companies within the FRAN-X Group are shown with an accurate status: Operating, In Development, Planned or Future Venture. Planned and future ventures are not represented as currently operating.",
        },
        {
          heading: "No guarantees",
          body: "Information on this platform is provided for general business purposes. It does not constitute legal, financial, tax or investment advice, and no commercial outcome is guaranteed.",
        },
      ]}
    />
  ),
});