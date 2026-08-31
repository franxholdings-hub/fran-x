import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, UserRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogoMark } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const openSearch = () => window.dispatchEvent(new CustomEvent("franx:search:open"));

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl lg:hidden">
      <Link to="/" className="flex items-center gap-2" aria-label="FRAN-X home">
        <LogoMark className="h-7 w-7" />
        <span className="font-display text-sm font-semibold tracking-tight">
          FRAN-X <span className="text-metal">HOLDINGS</span>
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={openSearch}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {user ? (
          <>
            <button
              type="button"
              onClick={() => void navigate({ to: "/portal", hash: "notifications" })}
              className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </button>
            <Link
              to="/portal"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-primary/40"
              aria-label="Profile"
            >
              <UserRound className="h-5 w-5" />
            </Link>
          </>
        ) : (
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
