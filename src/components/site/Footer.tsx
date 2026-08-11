import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { SITE, WHATSAPP_URL, MAILTO_URL, TEL_URL, COMPLIANCE_NOTE } from "@/lib/site";
import { PHOTO_CREDITS } from "@/lib/photos";

const COLUMNS: { title: string; links: { to: string; label: string; hash: string }[] }[] = [
  {
    title: "FRAN-X",
    links: [
      { to: "/about", label: "About", hash: "who-we-are" },
      { to: "/about", label: "Founder", hash: "founder" },
      { to: "/about", label: "Our Vision", hash: "vision" },
      { to: "/about", label: "Our Mission", hash: "mission" },
      { to: "/group", label: "FRAN-X Group", hash: "top" },
    ],
  },
  {
    title: "Services",
    links: [
      { to: "/services", label: "Technology", hash: "technology-digital" },
      { to: "/services", label: "AI & Automation", hash: "ai-automation" },
      { to: "/services", label: "Business Consulting", hash: "business-data" },
      { to: "/services", label: "Marketing", hash: "marketing-copywriting" },
      { to: "/services", label: "E-commerce", hash: "e-commerce" },
      { to: "/services", label: "Real Estate", hash: "real-estate" },
      { to: "/services", label: "Automotive", hash: "automotive" },
      { to: "/services", label: "Oil & Gas", hash: "oil-gas-energy" },
    ],
  },
  {
    title: "Build With Us",
    links: [
      { to: "/build/website", label: "Build a Website", hash: "top" },
      { to: "/build/app", label: "Build a Mobile App", hash: "top" },
      { to: "/request", label: "Build an AI Solution", hash: "top" },
      { to: "/request", label: "Build an E-commerce Store", hash: "top" },
      { to: "/request", label: "Request a Service", hash: "top" },
    ],
  },
  {
    title: "Business",
    links: [
      { to: "/opportunities", label: "Partnerships", hash: "submit" },
      { to: "/opportunities", label: "Investment Opportunities", hash: "submit" },
      { to: "/opportunities", label: "Submit an Opportunity", hash: "submit" },
      { to: "/contact", label: "Contact FRAN-X", hash: "top" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-surface/50">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
          <div>
            <p className="font-display text-lg font-semibold">
              FRAN-X <span className="text-metal">HOLDINGS</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{SITE.tagline}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary/80">
              Founded by {SITE.founder}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={MAILTO_URL}
                aria-label={`Email ${SITE.email}`}
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href={TEL_URL}
                aria-label={`Call ${SITE.phoneDisplay}`}
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link, i) => (
                  <li key={`${link.label}-${i}`}>
                    <Link
                      to={link.to}
                      hash={link.hash}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-border/70 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow">Phone</p>
            <a href={TEL_URL} className="mt-2 block text-sm hover:text-primary">
              {SITE.phoneDisplay}
            </a>
          </div>
          <div>
            <p className="eyebrow">Email</p>
            <a href={MAILTO_URL} className="mt-2 block break-all text-sm hover:text-primary">
              {SITE.email}
            </a>
          </div>
          <div>
            <p className="eyebrow">Address</p>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {SITE.address}
            </p>
          </div>
          <div>
            <p className="eyebrow">WhatsApp</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm hover:text-primary"
            >
              {SITE.whatsappDisplay}
            </a>
          </div>
        </div>

        <p className="mt-10 rounded-lg border border-border/60 bg-background/50 p-4 text-xs leading-relaxed text-muted-foreground">
          {COMPLIANCE_NOTE}
        </p>

        <details className="mt-4 rounded-lg border border-border/60 bg-background/50 p-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-primary">Photography credits</summary>
          <ul className="mt-3 space-y-1.5">
            {PHOTO_CREDITS.map((c) => (
              <li key={c.source}>
                <a
                  href={c.source}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:text-primary"
                >
                  {c.credit}
                </a>
              </li>
            ))}
          </ul>
        </details>

        <div className="mt-8 flex flex-col gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 FRAN-X Holdings. All Rights Reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/legal/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-primary">Terms of Service</Link>
            <Link to="/legal/disclaimer" className="hover:text-primary">Disclaimer</Link>
            <Link to="/legal/cookies" className="hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}