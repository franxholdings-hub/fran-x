import { createFileRoute } from "@tanstack/react-router";

// Starts the FRAN-X Explorer 7-day free trial for the authenticated user.
// Server-side only: users cannot self-grant an "active" subscription.
export const Route = createFileRoute("/api/subscription/start-trial")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Don't create a second subscription if one already exists.
        const { data: existing } = await supabaseAdmin
          .from("subscriptions")
          .select("id, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing) {
          return Response.json({ error: "You already have a subscription." }, { status: 409 });
        }

        const { data: explorer } = await supabaseAdmin
          .from("ai_packages")
          .select("id")
          .eq("code", "explorer")
          .maybeSingle();
        if (!explorer) return Response.json({ error: "Explorer plan not found." }, { status: 500 });

        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);

        const { data: sub, error } = await supabaseAdmin
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan_id: explorer.id,
            status: "trial",
            started_at: new Date().toISOString(),
            trial_ends_at: trialEnd.toISOString(),
          } as never)
          .select("id")
          .single();

        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ ok: true, subscription_id: sub.id });
      },
    },
  },
});
