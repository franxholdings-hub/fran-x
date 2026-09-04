import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/terms")({
  head: () =>
    legalHead(
      "Terms of Service | FRAN-X Technologies",
      "The terms governing use of the FRAN-X Technologies platform, inquiries, and engagements.",
    ),
  component: () => (
    <LegalPage
      title="Terms of Service"
      updated="Last updated: 2026"
      sections={[
        {
          heading: "Use of the platform",
          body: "By registering and using this platform you agree to provide accurate information and to use the platform only for lawful business purposes.",
        },
        {
          heading: "Inquiries and engagements",
          body: "Submitting an inquiry does not create a binding contract. A formal engagement begins only when a written proposal or agreement is accepted by both parties.",
        },
        {
          heading: "Business inquiry terms",
          body: "Opportunities, mandates and introductions submitted to FRAN-X are subject to review, verification and due diligence. FRAN-X may decline any inquiry at its discretion.",
        },
        {
          heading: "Regulated activities",
          body: "Certain services, transactions, and activities may be subject to applicable Nigerian and international laws, licensing requirements, regulatory approvals, due diligence, and/or execution through appropriately licensed partners.",
        },
        {
          heading: "Intellectual property",
          body: "Deliverables transfer to the client on full payment unless otherwise agreed in writing. Platform content and branding remain the property of FRAN-X Technologies.",
        },
      ]}
    />
  ),
});