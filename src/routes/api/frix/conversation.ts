import { createFileRoute } from "@tanstack/react-router";

type PatchBody = { title?: string };

export const Route = createFileRoute("/api/frix/conversation")({
  server: {
    handlers: {
      // GET /api/frix/conversation?id=<uuid> — messages for one conversation
      GET: async ({ request }) => {
        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const id = new URL(request.url).searchParams.get("id");
        if (!id) return Response.json({ error: "Conversation id is required." }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { loadOwnedConversation } = await import("@/lib/frix-server");
        const conversation = await loadOwnedConversation(supabaseAdmin, id, user.id);
        if (!conversation) return Response.json({ error: "Conversation not found." }, { status: 404 });

        const { data: messages, error } = await supabaseAdmin
          .from("ai_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", id)
          .order("created_at")
          .limit(200);

        if (error) return Response.json({ error: "Could not load messages." }, { status: 500 });
        return Response.json({ conversation, messages: messages ?? [] });
      },

      // PATCH /api/frix/conversation — rename
      PATCH: async ({ request }) => {
        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const body = (await request.json().catch(() => ({}))) as PatchBody & { id?: string };
        if (!body.id || !body.title?.trim())
          return Response.json({ error: "Conversation id and title are required." }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { loadOwnedConversation } = await import("@/lib/frix-server");
        const conversation = await loadOwnedConversation(supabaseAdmin, body.id, user.id);
        if (!conversation) return Response.json({ error: "Conversation not found." }, { status: 404 });

        const title = body.title.trim().slice(0, 120);
        const { error } = await supabaseAdmin.from("ai_conversations").update({ title }).eq("id", body.id);
        if (error) return Response.json({ error: "Could not rename the conversation." }, { status: 500 });
        return Response.json({ ok: true, title });
      },

      // DELETE /api/frix/conversation?id=<uuid>
      DELETE: async ({ request }) => {
        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const id = new URL(request.url).searchParams.get("id");
        if (!id) return Response.json({ error: "Conversation id is required." }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { loadOwnedConversation } = await import("@/lib/frix-server");
        const conversation = await loadOwnedConversation(supabaseAdmin, id, user.id);
        if (!conversation) return Response.json({ error: "Conversation not found." }, { status: 404 });

        const { error } = await supabaseAdmin.from("ai_conversations").delete().eq("id", id);
        if (error) return Response.json({ error: "Could not delete the conversation." }, { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});
