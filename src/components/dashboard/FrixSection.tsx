import { Link } from "@tanstack/react-router";
import { Bot, Sparkles, MessageSquare, Zap, FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelSection, Empty } from "@/components/admin/kit";
import { useSubscription } from "@/hooks/useSubscription";

// Mock recent conversations — the FRIX AI workspace backend is not wired here.
const RECENT = [
  { title: "Website pricing for a retail store", time: "2 hours ago", agent: "Sales" },
  { title: "How do I submit an opportunity?", time: "Yesterday", agent: "General" },
];

const TOOLS = [
  { icon: MessageSquare, name: "Business Concierge", desc: "Ask FRIX anything about FRAN-X services." },
  { icon: FileText, name: "Lead qualifier", desc: "Capture and qualify inbound enquiries." },
  { icon: Search, name: "Opportunity scout", desc: "Surface matching opportunities." },
  { icon: Zap, name: "Automation", desc: "Trigger follow-ups and reminders." },
];

export function FrixSection() {
  const sub = useSubscription();
  const canUsePremium = sub.data?.canUsePremium ?? false;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PanelSection
        title="FRIX AI Workspace"
        description="Your AI business concierge — conversations, tools and insights."
        action={
          <Button asChild size="sm">
            <Link to="/request"><Bot className="h-4 w-4" /> Open FRIX</Link>
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-surface/40 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 text-primary">
                <t.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-medium">{t.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Recent conversations" description="Your latest FRIX AI chats.">
        {RECENT.length ? (
          <ul className="space-y-3">
            {RECENT.map((c) => (
              <li key={c.title} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2.5 sm:px-4 sm:py-3">
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.agent} · {c.time}</p>
                </div>
                <Badge variant="outline">Chat</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No conversations yet.</Empty>
        )}
      </PanelSection>

      {!canUsePremium && (
        <PanelSection title="Unlock premium AI" description="Your plan limits FRIX AI conversations.">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm">
                Explorer includes up to 20 FRIX conversations. Upgrade for unlimited AI tools and deeper insights.
              </p>
            </div>
            <Button asChild>
              <Link to="/pricing">Upgrade</Link>
            </Button>
          </div>
        </PanelSection>
      )}
    </div>
  );
}
