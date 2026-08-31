import { Link } from "@tanstack/react-router";
import { Building2, Car, Compass, Fuel, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection, Empty } from "@/components/admin/kit";

const SAVED = [
  { title: "Lekki Phase 1 — 4 Bedroom Duplex", sector: "Real Estate", value: "₦185,000,000", icon: Building2, saved: "2 days ago" },
  { title: "Tokunbo Toyota Camry 2019", sector: "Automotive", value: "₦9,500,000", icon: Car, saved: "5 days ago" },
  { title: "Diesel supply — 10,000 litres", sector: "Oil & Gas", value: "Quote", icon: Fuel, saved: "1 week ago" },
];

const RECENTLY_VIEWED = [
  { title: "E-commerce storefront setup", sector: "E-commerce", icon: ShoppingCart },
  { title: "Logistics partnership — Lagos axis", sector: "Business", icon: Compass },
];

const RECOMMENDED = [
  { title: "Investment: Agri-tech startup (seed)", sector: "Investment", value: "Open", icon: Compass },
  { title: "Yaba — 3 Bedroom Flat (off-plan)", sector: "Real Estate", value: "₦62,000,000", icon: Building2 },
  { title: "Honda Civic 2020 (foreign used)", sector: "Automotive", value: "₦11,200,000", icon: Car },
];

type OppItem = { title: string; sector: string; value: string; icon: typeof Building2; saved?: string };

function OppRow({ o, meta }: { o: OppItem; meta?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/40 p-3 sm:p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/30 text-primary">
        <o.icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{o.title}</p>
        <p className="text-xs text-muted-foreground">{o.sector}{meta ? ` · ${meta}` : ""}</p>
      </div>
      <Badge variant="outline">{o.value}</Badge>
    </div>
  );
}

export function OpportunitiesSection() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PanelSection
        title="My Opportunities"
        description="Saved, recently viewed and recommended FRAN-X opportunities."
        action={
          <Button asChild size="sm">
            <Link to="/opportunities">Submit new</Link>
          </Button>
        }
      >
        <div className="space-y-3">
          {SAVED.map((o) => (
            <OppRow key={o.title} o={o} meta={`saved ${o.saved}`} />
          ))}
        </div>
      </PanelSection>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <PanelSection title="Recently viewed">
          <div className="space-y-3">
            {RECENTLY_VIEWED.map((o) => (
              <OppRow key={o.title} o={{ ...o, value: "Viewed" }} />
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Recommended for you">
          <div className="space-y-3">
            {RECOMMENDED.map((o) => (
              <OppRow key={o.title} o={o} />
            ))}
          </div>
        </PanelSection>
      </div>

      <PanelSection title="Looking for more?" description="Browse the full FRAN-X opportunity network.">
        <Button asChild variant="outline">
          <Link to="/opportunities">Explore opportunities</Link>
        </Button>
      </PanelSection>
    </div>
  );
}
