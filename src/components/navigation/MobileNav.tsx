import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, type LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogoMark } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV, MORE_NAV, CTA_ITEMS, type NavItem } from "./navConfig";

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleAction = (item: NavItem) => {
    setMoreOpen(false);
    if (item.action === "frix") {
      window.dispatchEvent(new CustomEvent("frix:open"));
    } else if (item.action === "signout") {
      void signOut();
      void navigate({ to: "/", replace: true });
    }
  };

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
    return pathname.startsWith(item.to);
  };

  const bottomItems = filterItems(MOBILE_BOTTOM_NAV);
  const moreItems = filterItems(MORE_NAV);

  return (
    <>
      {/* Fixed bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary mobile navigation"
      >
        <div className="flex items-stretch justify-around">
          {bottomItems.map((item) => {
            const active = isItemActive(item);
            return (
              <BottomNavItem
                key={item.label}
                item={item}
                active={active}
                onClick={() => handleAction(item)}
              />
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 font-medium transition-colors",
              moreOpen ? "text-primary" : "text-muted-foreground",
            )}
            aria-label="More menu"
          >
            <span className="relative grid h-10 w-10 place-items-center rounded-full">
              <span className="pulse-ring absolute inset-0 rounded-full bg-primary/25" />
              <Menu className="relative h-5 w-5" />
            </span>
            <span className="text-xs">More</span>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-background p-0">
          <SheetTitle className="sr-only">More menu</SheetTitle>
          {/* Drag handle */}
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-border" />
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 pt-3">
            {/* User info */}
            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background">
                  <LogoMark className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {(user.user_metadata as { full_name?: string } | undefined)?.full_name ||
                      user.email?.split("@")[0] ||
                      "FRAN-X User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav items */}
            <div className="space-y-1">
              {moreItems.map((item) => {
                const Icon = item.icon as LucideIcon;
                if (item.action) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleAction(item)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    to={item.to!}
                    hash={item.hash}
                    onClick={() => setMoreOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="mt-4 space-y-2">
              {CTA_ITEMS.map((cta) => (
                <Button
                  key={cta.to}
                  asChild
                  size="sm"
                  variant={cta === CTA_ITEMS[0] ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setMoreOpen(false)}
                >
                  <Link to={cta.to}>{cta.label}</Link>
                </Button>
              ))}
            </div>

            {/* Theme toggle */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm text-muted-foreground">Appearance</span>
              <ThemeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function BottomNavItem({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon as LucideIcon;
  const className = "flex flex-1 flex-col items-center gap-1 py-2.5 font-medium transition-colors";
  const inner = (
    <>
      <span
        className={cn(
          "relative grid h-10 w-10 place-items-center rounded-full transition-all duration-200",
          active ? "bg-primary text-primary-foreground scale-105" : "text-muted-foreground",
        )}
      >
        <span className="pulse-ring absolute inset-0 rounded-full bg-primary/25" />
        <Icon className="relative h-5 w-5" />
        {active && (
          <span className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
        )}
      </span>
      <span className={cn("text-xs", active ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
    </>
  );

  if (item.to) {
    return (
      <Link
        to={item.to}
        hash={item.hash}
        className={className}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={item.label}
    >
      {inner}
    </button>
  );
}
