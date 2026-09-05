import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/frix/account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { resolveFrixAccount } = await import("@/lib/frix-server");
        const account = await resolveFrixAccount(supabaseAdmin, user.id);

        return Response.json({
          user: {
            name:
              (user.user_metadata as { full_name?: string } | undefined)?.full_name ||
              user.email?.split("@")[0] ||
              "FRAN-X Member",
            email: user.email,
          },
          account,
        });
      },
    },
  },
});
