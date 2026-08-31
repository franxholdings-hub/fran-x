import { type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileNav } from "./MobileNav";
import { GlobalSearch } from "./GlobalSearch";
import { ContextualFAB } from "./ContextualFAB";
import { Footer } from "@/components/site/Footer";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAppArea = pathname.startsWith("/portal") || pathname.startsWith("/admin");

  return (
    <TooltipProvider delayDuration={300}>
      <GlobalSearch />
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <MobileHeader />
          <main className="flex-1 pb-16 lg:pb-0">
            <div key={pathname} className="animate-page-enter">
              {children}
            </div>
          </main>
          {!isAppArea && <Footer />}
        </div>
      </div>
      <MobileNav />
      <ContextualFAB />
    </TooltipProvider>
  );
}
