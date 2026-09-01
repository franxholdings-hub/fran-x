import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeft, Search, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogoMark, LogoLockup } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  PRIMARY_NAV,
  AUTH_NAV,
  SECONDARY_NAV,
  FOOTER_NAV,
  CTA_ITEMS,
  type NavItem,
} from "./navConfig";

const COLLAPSE_KEY = "franx.sidebar.collapsed";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(COLLAPSE_KEY, String(next));
  };

  const handleAction = (action: string) => {
    if (action === "frix") {
      window.dispatchEvent(new CustomEvent("frix:open"));
    } else if (action === "signout") {
      void signOut();
      void navigate({ to: "/", replace: true });
    }
  };

  const openSearch = () => window.dispatchEvent(new CustomEvent("franx:search:open"));

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => {
      if (item.authOnly && !user) return false;
      if (item.guestOnly && user) return false;
      if (item.adminOnly && !isAdmin) return false;
      return true;
    });

  const isItemActive = (item: NavItem) => {
    if (!item.to) return false;
    if (item.exact) return pathname === item.to;
    // For /portal, only highlight Dashboard (no hash), not sub-items
    if (item.to === "/portal" && !item.hash) return pathname === "/portal";
    if (item.to === "/portal" && item.hash) return pathname === "/portal";
    return pathname.startsWith(item.to);
  };

  const renderItem = (item: NavItem, key: string) => {
    const active = isItemActive(item);
    const inner = (
      <>
        <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
        {!collapsed && (
          <span className="truncate text-[0.875rem] font-medium">{item.label}</span>
        )}
        {!collapsed && active && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground" />
        )}
      </>
    );

    const className = cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
      collapsed && "justify-center px-0",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-surface hover:text-foreground",
    );

    let element: React.ReactNode;
    if (item.action) {
      element = (
        <button
          key={key}
          type="button"
          onClick={() => handleAction(item.action!)}
          className={className}
          aria-label={item.label}
        >
          {inner}
        </button>
      );
    } else {
      element = (
        <Link
          key={key}
          to={item.to!}
          hash={item.hash}
          className={className}
          aria-label={item.label}
        >
          {inner}
        </Link>
      );
    }

    if (collapsed) {
      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>{element}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return element;
  };

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <Link to="/" aria-label="FRAN-X home">
          {collapsed ? <LogoMark className="h-8 w-8" /> : <LogoLockup />}
        </Link>
      </div>

      {/* Search trigger */}
      <div className="shrink-0 px-3 pt-3">
        <button
          type="button"
          onClick={openSearch}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
          aria-label="Search"
        >
          <Search className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground xl:inline">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">{filterItems(PRIMARY_NAV).map((item) => renderItem(item, `p-${item.label}`))}</div>

        {user && (
          <>
            <div className="my-3 border-t border-sidebar-border/60" />
            <div className="space-y-1">{filterItems(AUTH_NAV).map((item) => renderItem(item, `a-${item.label}`))}</div>
          </>
        )}

        <div className="my-3 border-t border-sidebar-border/60" />
        <div className="space-y-1">{filterItems(SECONDARY_NAV).map((item) => renderItem(item, `s-${item.label}`))}</div>

        {/* CTA buttons */}
        {!collapsed && (
          <div className="mt-4 space-y-2">
            {CTA_ITEMS.map((cta) => (
              <Button key={cta.to} asChild size="sm" variant={cta === CTA_ITEMS[0] ? "default" : "outline"} className="w-full">
                <Link to={cta.to}>{cta.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
        <div className="space-y-1">
          {filterItems(FOOTER_NAV).map((item) => renderItem(item, `f-${item.label}`))}
        </div>
        <div className={cn("mt-2 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleCollapsed}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
