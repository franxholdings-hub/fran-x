// Server-only helpers shared by the authenticated FRIX AI workspace API
// routes. Nothing here is imported by the browser bundle.

import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminClient = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

// ---------------------------------------------------------------------------
// Modes & tools — each one genuinely changes the request the model receives.
// ---------------------------------------------------------------------------

export type FrixMode = "normal" | "pidgin" | "exam" | "lowdata";
export type FrixTool = "none" | "writing" | "business" | "data" | "productivity" | "summarize";

export const FRIX_MODE_INSTRUCTIONS: Record<FrixMode, string> = {
  normal: "",
  pidgin:
    "PIDGIN MODE IS ON: reply naturally in Nigerian Pidgin English for the whole conversation. Stay professional, warm and clear.",
  exam:
    "EXAM MODE IS ON: provide focused educational assistance. Explain step by step so the user actually learns. For homework or exam questions, guide the reasoning and show the method — don't just hand over final answers with no explanation.",
  lowdata:
    "LOW DATA MODE IS ON: keep every reply short (under 60 words) and plain. Avoid tables, long lists and heavy formatting.",
};

export const FRIX_TOOL_INSTRUCTIONS: Record<FrixTool, string> = {
  none: "",
  writing:
    "TOOL — WRITING: help with drafting, rewriting, editing, tone and structure. Deliver polished, ready-to-use text.",
  business:
    "TOOL — BUSINESS: provide business analysis, marketing assistance, ideas and strategy. Ground anything FRAN-X-specific in the verified knowledge base.",
  data:
    "TOOL — DATA: help interpret data, charts and numbers. Show calculations step by step and use a compact table when it genuinely helps.",
  productivity:
    "TOOL — PRODUCTIVITY: help with planning, research direction and brainstorming. Reply with clear, actionable structure.",
  summarize:
    "TOOL — SUMMARIZE: summarize the provided text or the conversation so far. Lead with the key points, concise and complete.",
};

// ---------------------------------------------------------------------------
// AI gateway — plain-text response (aggregated from the streaming API).
// ---------------------------------------------------------------------------

export async function callGatewayText(
  apiKey: string,
  model: string,
  instructions: string,
  input: unknown,
): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
      stream: true,
      reasoning: { effort: "low", summary: "auto" },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    const err = new Error(detail || `AI gateway error ${res.status}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as { type?: string; delta?: string };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") out += evt.delta;
      } catch {
        /* ignore keepalives */
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Verified knowledge retrieval — same grounding rules as the public chat.
// ---------------------------------------------------------------------------

type KbRow = {
  id: string;
  category: string;
  title: string;
  content: string;
  reference_code: string | null;
  tags: string[];
  valid_until: string | null;
};

function score(text: string, words: string[]) {
  const t = text.toLowerCase();
  return words.reduce((n, w) => (w && t.includes(w.toLowerCase()) ? n + 1 : n), 0);
}

export async function retrieveKnowledge(supabaseAdmin: AdminClient, queryText: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: kbAll } = await supabaseAdmin
    .from("knowledge_base")
    .select("id, category, title, content, reference_code, tags, valid_until")
    .eq("is_active", true)
    .eq("is_verified", true)
    .eq("is_confidential", false)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .limit(400);

  const ranked = ((kbAll ?? []) as KbRow[])
    .map((row) => ({
      row,
      rank:
        score(queryText, row.tags ?? []) * 3 +
        score(queryText, row.category.split(/[\s&/]+/)) * 2 +
        score(queryText, row.title.split(/\s+/).filter((w) => w.length > 3)),
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 14)
    .map(({ row }) =>
      [
        `[${row.category}]${row.reference_code ? ` (${row.reference_code})` : ""} ${row.title}`,
        row.content,
        row.valid_until ? `Valid until: ${row.valid_until}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );

  return ranked.length ? ranked.join("\n---\n") : "NO VERIFIED KNOWLEDGE ENTRIES MATCH THIS REQUEST.";
}

// ---------------------------------------------------------------------------
// Account / plan / usage resolution — all numbers come from the database.
// ---------------------------------------------------------------------------

export type FrixAccount = {
  status: "none" | "trial" | "active" | "past_due" | "expired";
  planName: string;
  planCode: string;
  monthlyPrice: number;
  /** Conversation limit for the current month (from the plan row). */
  limit: number;
  conversationsUsed: number;
  messagesUsed: number;
  canStart: boolean;
  /** True when the user is on the free (Explorer) limit without a paid sub. */
  isFree: boolean;
  trialDaysLeft: number;
};

type PlanRow = {
  code: string;
  name: string;
  monthly_price: number;
  usage_limit: number;
  billing_interval: string;
  trial_days: number;
};

type SubRow = {
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  plan: PlanRow | null;
};

function monthStartISO() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

async function effectiveStatus(sub: SubRow | null): Promise<{
  status: FrixAccount["status"];
  plan: PlanRow | null;
  trialDaysLeft: number;
}> {
  if (!sub) return { status: "none", plan: null, trialDaysLeft: 0 };
  const now = new Date();
  if (sub.status === "trial" && sub.trial_ends_at) {
    const ends = new Date(sub.trial_ends_at);
    if (ends < now) return { status: "expired", plan: sub.plan, trialDaysLeft: 0 };
    return {
      status: "trial",
      plan: sub.plan,
      trialDaysLeft: Math.max(0, Math.ceil((ends.getTime() - now.getTime()) / 86400000)),
    };
  }
  if (sub.status === "active" && sub.current_period_end && new Date(sub.current_period_end) < now) {
    return { status: "past_due", plan: sub.plan, trialDaysLeft: 0 };
  }
  if (sub.status === "active") return { status: "active", plan: sub.plan, trialDaysLeft: 0 };
  return { status: "expired", plan: sub.plan, trialDaysLeft: 0 };
}

/** The Explorer (free) package's usage_limit is the default for members
 *  without an active subscription — admin-editable, never hardcoded. */
const FREE_LIMIT_FALLBACK = 10;

export async function resolveFrixAccount(
  supabaseAdmin: AdminClient,
  userId: string,
): Promise<FrixAccount> {
  const [{ data: sub }, { data: explorer }] = await Promise.all([
    supabaseAdmin
      .from("subscriptions")
      .select("*, plan:ai_packages(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin.from("ai_packages").select("*").eq("code", "explorer").maybeSingle(),
  ]);

  const { status, plan, trialDaysLeft } = await effectiveStatus(sub as SubRow | null);
  const premium = status === "active" || status === "trial";
  const explorerPlan = explorer as PlanRow | null;

  const limit = premium
    ? plan?.usage_limit ?? explorerPlan?.usage_limit ?? FREE_LIMIT_FALLBACK
    : explorerPlan?.usage_limit ?? FREE_LIMIT_FALLBACK;
  const planName = premium ? plan?.name ?? explorerPlan?.name ?? "Explorer" : explorerPlan?.name ?? "Explorer (Free)";
  const planCode = premium ? plan?.code ?? "explorer" : "explorer";
  const monthlyPrice = premium ? plan?.monthly_price ?? 0 : 0;

  // Usage this month — real counts from the existing conversation tables.
  const start = monthStartISO();
  const { count: conversationsUsed } = await supabaseAdmin
    .from("ai_conversations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start);

  const { data: convIds } = await supabaseAdmin
    .from("ai_conversations")
    .select("id")
    .eq("user_id", userId)
    .limit(2000);

  let messagesUsed = 0;
  if (convIds && convIds.length > 0) {
    const { count } = await supabaseAdmin
      .from("ai_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds.map((c) => c.id))
      .gte("created_at", start);
    messagesUsed = count ?? 0;
  }

  const used = conversationsUsed ?? 0;
  return {
    status,
    planName,
    planCode,
    monthlyPrice,
    limit,
    conversationsUsed: used,
    messagesUsed,
    canStart: used < limit,
    isFree: !premium,
    trialDaysLeft,
  };
}

/** Ownership-safe conversation loader for the workspace API. */
export async function loadOwnedConversation(
  supabaseAdmin: SupabaseClient,
  conversationId: string,
  userId: string,
) {
  const { data } = await supabaseAdmin
    .from("ai_conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();
  if (!data || data["user_id"] !== userId) return null;
  return data;
}

export function gatewayErrorMessage(error: unknown): { message: string; status: number } {
  const status = (error as { status?: number }).status;
  if (status === 429) return { message: "FRIX AI is busy right now. Please try again in a moment.", status: 429 };
  if (status === 402) return { message: "The FRAN-X AI service is temporarily unavailable.", status: 502 };
  console.error("FRIX workspace gateway failure", error);
  return { message: "FRIX AI couldn't process that request. Please try again.", status: 500 };
}
