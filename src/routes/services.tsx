import { Outlet, createFileRoute } from "@tanstack/react-router";

// Layout route for the /services segment. The directory page lives in
// services.index.tsx and the detail page in services.$slug.tsx; both render
// through this <Outlet />. Without it, client-side navigation to
// /services/$slug would only render this parent and drop the child.
export const Route = createFileRoute("/services")({
  component: ServicesLayout,
});

function ServicesLayout() {
  return <Outlet />;
}
