import { Bell, Compass, ClipboardList, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PanelSection, Empty, toneForStatus } from "@/components/admin/kit";

const ACCOUNT = [
  { title: "Welcome to FRAN-X!", time: "Just now", tone: "new" },
  { title: "Your profile is 80% complete", time: "1 day ago", tone: "pending" },
];

const OPPORTUNITY_ALERTS = [
  { title: "New real estate listing in Lekki", time: "3 hours ago", tone: "new" },
  { title: "A saved opportunity dropped in price", time: "Yesterday", tone: "completed" },
];

const INQUIRY_UPDATES = [
  { title: "Inquiry FX-2041 moved to In Review", time: "2 hours ago", tone: "pending" },
  { title: "FRAN-X responded to your website request", time: "1 day ago", tone: "completed" },
];

const ANNOUNCEMENTS = [
  { title: "FRAN-X AI Integration is launching soon", time: "This week", tone: "new" },
];

function Group({ icon: Icon, title, items }: { icon: typeof Bell; title: string; items: { title: string; time: string; tone: string }[] }) {
  return (
    <PanelSection title={title}>
      {items.length ? (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.title} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/40 px-4 py-3 text-sm">
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-primary" />
                {n.title}
              </span>
              <Badge variant="outline" className={toneForStatus(n.tone)}>{n.time}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Nothing here yet.</Empty>
      )}
    </PanelSection>
  );
}

export function NotificationsSection() {
  return (
    <div className="space-y-6">
      <Group icon={Bell} title="Account notifications" items={ACCOUNT} />
      <Group icon={Compass} title="Opportunity alerts" items={OPPORTUNITY_ALERTS} />
      <Group icon={ClipboardList} title="Inquiry updates" items={INQUIRY_UPDATES} />
      <Group icon={Megaphone} title="System announcements" items={ANNOUNCEMENTS} />
    </div>
  );
}
