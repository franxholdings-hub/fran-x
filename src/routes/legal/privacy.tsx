import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/privacy")({
  head: () =>
    legalHead(
      "Privacy Policy | FRAN-X Technologies",
      "How FRAN-X Technologies collects, uses, stores and protects personal and business information submitted through our platform.",
    ),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      updated="Last updated: 2026"
      sections={[
        {
          heading: "Information we collect",
          body: "We collect the information you provide when you register, request a service, submit an opportunity, or contact us. This may include your name, email address, phone number, company, country, project details and any files you choose to upload.",
        },
        {
          heading: "How we use your information",
          body: "Your information is used to respond to your inquiry, prepare proposals, deliver requested services, maintain your client portal, and improve our platform. We do not sell your personal data.",
        },
        {
          heading: "Storage and security",
          body: "Data is stored on secured cloud infrastructure with access controls and row-level security. Only authorised FRAN-X personnel can access inquiry and client records.",
        },
        {
          heading: "Sharing",
          body: "Where a transaction requires it, information may be shared with appropriately licensed partners, professional advisers or counterparties, with your knowledge and only to the extent necessary.",
        },
        {
          heading: "Your rights",
          body: "You may request access to, correction of, or deletion of your personal information at any time by contacting franxholdings@gmail.com.",
        },
      ]}
    />
  ),
});