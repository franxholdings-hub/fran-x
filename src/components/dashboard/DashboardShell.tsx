import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UserRound,
  Compass,
  ClipboardList,
  ClipboardCheck,
  Bot,
  Bell,
  CreditCard,
  Settings as SettingsIcon,
  Store,
  Briefcase,
} from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { useAuth } from "@/hooks/useAuth";
import { HomeSection } from "@/components/dashboard/HomeSection";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { OpportunitiesSection } from "@/components/dashboard/OpportunitiesSection";
import { InquiriesSection } from "@/components/dashboard/InquiriesSection";
import { AssessmentSection } from "@/components/dashboard/AssessmentSection";
import { FrixSection } from "@/components/dashboard/FrixSection";
import { NotificationsSection } from "@/components/dashboard/NotificationsSection";
import { SubscriptionSection } from "@/components/dashboard/SubscriptionSection";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { MarketplaceSection } from "@/components/dashboard/MarketplaceSection";
import { VendorSection } from "@/components/dashboard/VendorSection";

const NAV = [
  { key: "home", label: "Dashboard", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", icon: UserRound },
  { key: "opportunities", label: "My Opportunities", icon: Compass },
  { key: "marketplace", label: "Marketplace", icon: Store },
  { key: "vendor", label: "Vendor Hub", icon: Briefcase },
  { key: "inquiries", label: "My Inquiries", icon: ClipboardList },
  { key: "assessment", label: "Business Assessment", icon: ClipboardCheck },
  { key: "frix", label: "FRIX AI", icon: Bot },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "subscription", label: "Subscription", icon: CreditCard },
  { key: "settings", label: "Settings", icon: SettingsIcon },
] as const;

export type SectionKey = (typeof NAV)[number]["key"];

export function DashboardShell() {
  const { user } = useAuth();
  const [active, setActive] = useState<SectionKey>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1) as SectionKey;
      if (NAV.some((n) => n.key === hash)) return hash;
    }
    return "home";
  });
  const name =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  // Sync active section with URL hash changes (from sidebar links)
  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.slice(1) as SectionKey;
      if (NAV.some((n) => n.key === hash)) {
        setActive(hash);
      }
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return (
    <>
      <PageHero
        eyebrow="FRAN-X User Dashboard"
        title={`Welcome back, ${name}`}
        subtitle="Your FRAN-X workspace — requests, opportunities, AI, subscription and account, in one place."
      />
      <section className="container-x py-6 sm:py-10">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="grid grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border border-border bg-surface/40 p-1.5 sm:p-2 max-h-[55vh] lg:max-h-none lg:flex lg:flex-col lg:gap-1 lg:overflow-visible">
              {NAV.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium sm:px-3 sm:py-2.5 sm:text-sm transition-colors lg:w-auto ${
                    active === item.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
          <div className="min-w-0">
            {active === "home" && <HomeSection onNavigate={setActive} />}
            {active === "profile" && <ProfileSection />}
            {active === "opportunities" && <OpportunitiesSection />}
            {active === "marketplace" && <MarketplaceSection />}
            {active === "vendor" && <VendorSection />}
            {active === "inquiries" && <InquiriesSection />}
            {active === "assessment" && <AssessmentSection />}
            {active === "frix" && <FrixSection />}
            {active === "notifications" && <NotificationsSection />}
            {active === "subscription" && <SubscriptionSection />}
            {active === "settings" && <SettingsSection />}
          </div>
        </div>
      </section>
    </>
  );
}
