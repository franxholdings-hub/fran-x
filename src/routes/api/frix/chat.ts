import { createFileRoute } from "@tanstack/react-router";
import {
  callGatewayText,
  retrieveKnowledge,
  resolveFrixAccount,
  loadOwnedConversation,
  gatewayErrorMessage,
  FRIX_MODE_INSTRUCTIONS,
  FRIX_TOOL_INSTRUCTIONS,
  type AdminClient,
  type FrixMode,
  type FrixTool,
} from "@/lib/frix-server";

type Body = {
  conversationId?: string | null;
  message?: string;
  mode?: FrixMode;
  tool?: FrixTool;
  regenerate?: boolean;
};

const MODEL = "openai/gpt-5.6-sol";

/** Create a conversation row; tolerates the title/mode columns not being
 *  applied yet (falls back to a minimal insert so chat keeps working). */
async function createConversation(
  supabaseAdmin: AdminClient,
  userId: string,
  title: string,
  mode: FrixMode,
) {
  const insert = async (payload: Record<string, unknown>) =>
    supabaseAdmin.from("ai_conversations").insert(payload).select("*").single();

  const { data, error } = await insert({
    user_id: userId,
    title,
    mode: mode !== "normal" ? mode : null,
  });
  if (error) {
    const retry = await insert({ user_id: userId });
    if (retry.error || !retry.data) return null;
    return retry.data;
  }
  return data;
}

function deriveTitle(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 60 ? `${t.slice(0, 60)}…` : t || "New chat";
}

export const Route = createFileRoute("/api/frix/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Please sign in to use FRIX AI." }, { status: 401 });

        const body = (await request.json().catch(() => ({}))) as Body;
        const mode: FrixMode = FRIX_MODE_INSTRUCTIONS[body.mode ?? "normal"] ? body.mode! : "normal";
        const tool: FrixTool = FRIX_TOOL_INSTRUCTIONS[body.tool ?? "none"] ? body.tool! : "none";
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "FRIX AI is not configured." }, { status: 500 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: settings } = await supabaseAdmin.from("ai_settings").select("*").maybeSingle();
        if (settings && settings.ai_enabled === false) {
          return Response.json(
            { error: "FRIX AI is currently offline. Please try again later." },
            { status: 503 },
          );
        }

        const account = await resolveFrixAccount(supabaseAdmin, user.id);

        // ---- conversation (ownership enforced) ----
        let conversationId = body.conversationId ?? null;
        if (conversationId) {
          const owned = await loadOwnedConversation(supabaseAdmin, conversationId, user.id);
          if (!owned) return Response.json({ error: "Conversation not found." }, { status: 404 });
        }

        const regenerate = Boolean(body.regenerate);

        if (!conversationId) {
          // Usage limit: only enforced on NEW conversations.
          if (!account.canStart) {
            return Response.json(
              {
                error: `You've reached your FRIX AI conversation limit for this month (${account.limit}). Upgrade for higher limits and more advanced capabilities.`,
                limitReached: true,
                account,
              },
              { status: 402 },
            );
          }
          const message = (body.message ?? "").toString().trim().slice(0, 4000);
          if (!message) return Response.json({ error: "Message is required." }, { status: 400 });
          const created = await createConversation(
            supabaseAdmin,
            user.id,
            deriveTitle(message),
            mode,
          );
          if (!created) return Response.json({ error: "Could not start the conversation." }, { status: 500 });
          conversationId = created.id;
        }

        // ---- history ----
        const { data: history } = await supabaseAdmin
          .from("ai_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at")
          .limit(40);

        let inputText: string;
        let userMessageRow: { id: string; role: string; content: string; created_at: string } | null = null;

        if (regenerate) {
          // Drop the trailing assistant reply and re-run the last user message.
          const msgs = (history ?? []) as { id: string; role: string; content: string; created_at: string }[];
          const last = msgs[msgs.length - 1];
          if (last && last.role === "assistant") {
            await supabaseAdmin.from("ai_messages").delete().eq("id", last.id);
            msgs.pop();
          }
          const lastUser = [...msgs].reverse().find((m) => m.role === "user");
          if (!lastUser) return Response.json({ error: "Nothing to regenerate." }, { status: 400 });
          inputText = lastUser.content;
        } else {
          const message = (body.message ?? "").toString().trim().slice(0, 4000);
          if (!message) return Response.json({ error: "Message is required." }, { status: 400 });
          inputText = message;
          const { data: inserted, error: insertError } = await supabaseAdmin
            .from("ai_messages")
            .insert({ conversation_id: conversationId, role: "user", content: message })
            .select("id, role, content, created_at")
            .single();
          if (insertError || !inserted) {
            return Response.json({ error: "Could not save your message." }, { status: 500 });
          }
          userMessageRow = inserted;
        }

        // ---- knowledge grounding ----
        const routingText = [
          ...((history ?? []) as { content: string }[]).slice(-6).map((m) => m.content),
          inputText,
        ].join(" ");
        const knowledge = await retrieveKnowledge(supabaseAdmin, routingText);

        const userName =
          (user.user_metadata as { full_name?: string } | undefined)?.full_name ||
          user.email?.split("@")[0] ||
          "there";

        const instructions = [
          `You are FRIX AI, the intelligent AI workspace of FRAN-X Technologies (founded by Francis Ejimkeonye, Lagos, Nigeria).`,
          `You are chatting with ${userName} (${user.email ?? ""}), an authenticated FRAN-X member on the ${account.planName} plan.`,
          `IDENTITY: always identify as "FRIX AI". Never claim to be human.`,
          `Tone: ${settings?.tone ?? "Professional, intelligent, concise, corporate"}.`,
          settings?.base_instructions ?? "",
          `NO-HALLUCINATION RULE: for anything FRAN-X-specific (services, prices, availability, projects, staff, deals) use ONLY the verified knowledge below. If the fact is not there, say you don't have verified information about that yet and offer to forward the inquiry to the FRAN-X team.`,
          `For general knowledge, programming, business and educational questions: answer accurately and helpfully.`,
          `Reply in the user's language. Use markdown (headings, lists, tables, code blocks) when it genuinely helps. Keep replies under 300 words unless the user asks for more.`,
          FRIX_MODE_INSTRUCTIONS[mode],
          FRIX_TOOL_INSTRUCTIONS[tool],
          `VERIFIED FRAN-X KNOWLEDGE BASE:\n${knowledge}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        const input = [
          ...(regenerate ? [] : []),
          ...((history ?? []) as { role: string; content: string }[])
            .slice(regenerate ? -40 : 0)
            .map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: [{ type: m.role === "assistant" ? "output_text" : "input_text", text: m.content }],
            })),
          { role: "user", content: [{ type: "input_text", text: inputText }] },
        ];

        let reply: string;
        try {
          const raw = await callGatewayText(apiKey, MODEL, instructions, input);
          reply = raw.trim();
        } catch (error) {
          const { message, status } = gatewayErrorMessage(error);
          // Include the conversationId so the client can attach its retry to it.
          return Response.json({ error: message, conversationId }, { status });
        }

        if (!reply) reply = "FRIX AI couldn't process that request. Please try again.";

        const { data: assistantRow, error: assistantError } = await supabaseAdmin
          .from("ai_messages")
          .insert({ conversation_id: conversationId, role: "assistant", content: reply, agent_slug: "workspace" })
          .select("id, role, content, created_at")
          .single();
        if (assistantError || !assistantRow) {
          return Response.json({ error: "Could not save the response." }, { status: 500 });
        }

        await supabaseAdmin
          .from("ai_conversations")
          .update({
            mode: mode !== "normal" ? mode : null,
            message_count: (((history ?? []) as unknown[]).length + (userMessageRow ? 1 : 0) + 1),
          })
          .eq("id", conversationId);

        const usage = {
          conversationsUsed: regenerate ? account.conversationsUsed : Math.min(account.conversationsUsed + (body.conversationId ? 0 : 1), account.limit),
          limit: account.limit,
        };

        return Response.json({
          conversationId,
          reply,
          userMessage: userMessageRow,
          assistantMessage: assistantRow,
          usage,
        });
      },
    },
  },
});
