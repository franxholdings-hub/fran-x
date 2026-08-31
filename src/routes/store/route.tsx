import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StoreNav } from "@/components/store/StoreNav";

// Layout route for /store/* — renders the sticky store sub-navigation and the
// active child route. The CartProvider + CartDrawer live in the global AppShell.
export const Route = createFileRoute("/store")({
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <>
      <StoreNav />
      <Outlet />
    </>
  );
}
