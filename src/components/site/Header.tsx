import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, ShieldCheck, LayoutGrid, LogOut, UserRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { LogoLockup, LogoMark } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/store/frix-ai", label: "FRIX AI" },
  { to: "/services", label: "Services" },
  { to: "/solutions", label: "Solutions" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    void navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-x grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5 lg:flex lg:justify-between">
        <Link to="/" className="min-w-0">
          <LogoLockup />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/portal">
                  <LayoutGrid /> Dashboard
                </Link>
              </Button>
              {isAdmin ? (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <ShieldCheck /> Admin
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut /> Sign out
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">
                <UserRound /> Sign in
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link to="/store/frix-ai">
              <Sparkles /> Try FRIX AI
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/request">Start a Project</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto bg-surface">
            <SheetTitle className="flex items-center gap-2 font-display text-base">
              <LogoMark className="h-8 w-8" /> FRAN-X Technologies
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="rounded-md border border-border/60 px-4 py-3 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild onClick={() => setOpen(false)}>
                <Link to="/request">Start a Project</Link>
              </Button>
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link to="/store/frix-ai">
                  <Sparkles /> Try FRIX AI
                </Link>
              </Button>
              <div className="flex items-center justify-between rounded-md border border-border/60 px-4 py-2 text-sm">
                <span className="text-muted-foreground">Appearance</span>
                <ThemeToggle />
              </div>
              {user ? (
                <>
                  <Button asChild variant="ghost" onClick={() => setOpen(false)}>
                    <Link to="/portal">Dashboard</Link>
                  </Button>
                  {isAdmin ? (
                    <Button asChild variant="ghost" onClick={() => setOpen(false)}>
                      <Link to="/admin">Admin Dashboard</Link>
                    </Button>
                  ) : null}
                  <Button variant="ghost" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Button asChild variant="ghost" onClick={() => setOpen(false)}>
                  <Link to="/auth">Sign in / Register</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
