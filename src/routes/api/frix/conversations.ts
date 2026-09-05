import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/frix/conversations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("ai_conversations")
          .select("id, title, mode, status, message_count, created_at, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(100);

        if (error) return Response.json({ error: "Could not load conversations." }, { status: 500 });
        return Response.json({ conversations: data ?? [] });
      },
    },
  },
});
