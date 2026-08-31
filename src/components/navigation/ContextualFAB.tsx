import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FABConfig = {
  label: string;
  to: string;
  icon: LucideIcon;
};

const FAB_MAP: Record<string, FABConfig> = {
  "/marketplace": { label: "List an Item", to: "/portal", icon: Plus },
  "/portal": { label: "Add Listing", to: "/portal", icon: Plus },
  "/opportunities": { label: "Submit Opportunity", to: "/opportunities", icon: Plus },
};

export function ContextualFAB() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Find matching FAB config (check exact match, then prefix)
  const config = FAB_MAP[pathname] ?? Object.entries(FAB_MAP).find(([key]) => pathname.startsWith(key) && key !== "/")?.[1];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <Link
      to={config.to}
      className={cn(
        "fixed left-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl",
        "bottom-20 lg:bottom-6",
      )}
      aria-label={config.label}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden sm:inline">{config.label}</span>
    </Link>
  );
}
