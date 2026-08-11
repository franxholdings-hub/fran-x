import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { QuickInquiryForm } from "@/components/site/QuickInquiryForm";
import { SITE, MAILTO_URL, TEL_URL, WHATSAPP_URL } from "@/lib/site";
import { PHOTOS } from "@/lib/photos";

const TITLE = "Contact FRAN-X Holdings | Email, Phone & WhatsApp";
const DESCRIPTION =
  "Contact FRAN-X Holdings by email, phone or WhatsApp, or send a message directly from the platform. Based in Festac Town, Lagos, Nigeria.";

export const Route = createFileRoute("/contact")({
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
  component: Contact,
});

const CHANNELS = [
  { icon: Mail, label: "Email", value: SITE.email, href: MAILTO_URL },
  { icon: Phone, label: "Phone", value: SITE.phoneDisplay, href: TEL_URL },
  { icon: MessageCircle, label: "WhatsApp", value: SITE.whatsappDisplay, href: WHATSAPP_URL },
];

function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to FRAN-X Holdings."
        subtitle="Reach the team directly, or send a message and we will respond with next steps."
        photo={PHOTOS.consulting}
      />
      <section className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.label === "WhatsApp" ? "_blank" : undefined}
              rel={c.label === "WhatsApp" ? "noopener noreferrer" : undefined}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 p-5 transition-colors hover:border-primary/50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-primary/30 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {c.label}
                </span>
                <span className="block truncate text-sm">{c.value}</span>
              </span>
            </a>
          ))}
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-primary/30 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Head office
              </span>
              <span className="block text-sm">{SITE.address}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Founded by {SITE.founder}, Founder &amp; CEO.</p>
        </div>
        <QuickInquiryForm
          kind="contact"
          category="General"
          gateAction="send a message to FRAN-X"
          submitLabel="Send message"
        />
      </section>
    </>
  );
}