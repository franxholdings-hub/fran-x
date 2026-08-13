import { createFileRoute } from "@tanstack/react-router";

type Body = {
  conversationId?: string | null;
  visitorId?: string | null;
  message?: string;
  action?: "chat" | "escalate" | "callback";
  callback?: Record<string, string>;
};

type KbRow = {
  id: string;
  category: string;
  title: string;
  content: string;
  reference_code: string | null;
  tags: string[];
  valid_until: string | null;
  metadata: Record<string, unknown>;
};

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "reply",
    "category",
    "client_summary",
    "requirement",
    "budget",
    "timeline",
    "important_details",
    "missing_information",
    "collected",
    "lead_score",
    "classification",
    "recommended_action",
    "qualified",
    "escalate",
    "escalation_reason",
    "risk_flags",
    "unknown_question",
    "proposal_draft",
    "contact_name",
    "contact_email",
    "contact_phone",
    "contact_company",
    "contact_country",
  ],
  properties: {
    reply: { type: "string" },
    category: { type: "string" },
    client_summary: { type: "string" },
    requirement: { type: "string" },
    budget: { type: ["string", "null"] },
    timeline: { type: ["string", "null"] },
    important_details: { type: "array", items: { type: "string" } },
    missing_information: { type: "array", items: { type: "string" } },
    collected: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "value"],
        properties: { key: { type: "string" }, value: { type: "string" } },
      },
    },
    lead_score: { type: "integer" },
    classification: { type: "string", enum: ["Hot", "Warm", "Cold", "Unqualified"] },
    recommended_action: { type: "string" },
    qualified: { type: "boolean" },
    escalate: { type: "boolean" },
    escalation_reason: { type: ["string", "null"] },
    risk_flags: { type: "array", items: { type: "string" } },
    unknown_question: { type: ["string", "null"] },
    proposal_draft: { type: ["string", "null"] },
    contact_name: { type: ["string", "null"] },
    contact_email: { type: ["string", "null"] },
    contact_phone: { type: ["string", "null"] },
    contact_company: { type: ["string", "null"] },
    contact_country: { type: ["string", "null"] },
  },
} as const;

function score(text: string, words: string[]) {
  const t = text.toLowerCase();
  return words.reduce((n, w) => (w && t.includes(w.toLowerCase()) ? n + 1 : n), 0);
}

function makeReference() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `FXAI-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

async function callGateway(apiKey: string, model: string, instructions: string, input: unknown) {
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
      text: {
        format: {
          type: "json_schema",
          name: "frix_turn",
          strict: true,
          schema: OUTPUT_SCHEMA,
        },
      },
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

export const Route = createFileRoute("/api/public/frix")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Body;
        const userMessage = (body.message ?? "").toString().trim().slice(0, 4000);
        const action = body.action ?? "chat";
        if (action === "chat" && !userMessage) {
          return Response.json({ error: "Message is required." }, { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const [{ data: settings }, { data: agents }] = await Promise.all([
          supabaseAdmin.from("ai_settings").select("*").maybeSingle(),
          supabaseAdmin.from("ai_agents").select("*").eq("is_enabled", true).order("sort_order"),
        ]);

        if (settings && settings.ai_enabled === false) {
          return Response.json(
            { reply: "FRIX AI is currently offline. Please send your enquiry through the request form and the FRAN-X team will respond.", offline: true },
            { status: 200 },
          );
        }

        // ---- conversation ----
        let conversationId = body.conversationId ?? null;
        let conversation: Record<string, unknown> | null = null;
        if (conversationId) {
          const { data } = await supabaseAdmin.from("ai_conversations").select("*").eq("id", conversationId).maybeSingle();
          conversation = data;
          if (!data) conversationId = null;
        }
        if (!conversationId) {
          const { data, error } = await supabaseAdmin
            .from("ai_conversations")
            .insert({ visitor_id: body.visitorId ?? null })
            .select("*")
            .single();
          if (error) return Response.json({ error: "Could not start the conversation." }, { status: 500 });
          conversation = data;
          conversationId = data.id;
        }

        const { data: history } = await supabaseAdmin
          .from("ai_messages")
          .select("role, content")
          .eq("conversation_id", conversationId!)
          .order("created_at")
          .limit(40);

        // ---- human escalation button ----
        if (action === "escalate") {
          await supabaseAdmin
            .from("ai_conversations")
            .update({ escalated: true, escalation_reason: "Client requested human assistance", status: "human_review" })
            .eq("id", conversationId!);
          const reference = await ensureInquiry(supabaseAdmin, conversation, conversationId!, {
            summaryText: "Client requested human assistance from the chat.",
            nextAction: "Contact the client — human review required.",
          });
          const reply =
            "I've collected the necessary information. A member of the FRAN-X team will review your inquiry and contact you shortly.";
          await supabaseAdmin.from("ai_messages").insert({ conversation_id: conversationId!, role: "assistant", content: reply });
          return Response.json({ conversationId, reply, escalated: true, reference });
        }

        // ---- callback request ----
        if (action === "callback") {
          const cb = body.callback ?? {};
          await supabaseAdmin.from("callback_requests").insert({
            conversation_id: conversationId!,
            full_name: cb["full_name"] ?? (conversation?.["contact_name"] as string) ?? null,
            contact_method: cb["contact_method"] ?? null,
            contact_value: cb["contact_value"] ?? null,
            preferred_date: cb["preferred_date"] ?? null,
            preferred_time: cb["preferred_time"] ?? null,
            timezone: cb["timezone"] ?? null,
            reason: cb["reason"] ?? null,
          });
          const reply = "Your callback request has been logged. A FRAN-X representative will confirm the appointment.";
          await supabaseAdmin.from("ai_messages").insert({ conversation_id: conversationId!, role: "assistant", content: reply });
          return Response.json({ conversationId, reply, callback: true });
        }

        // ---- AI router ----
        const routingText = [...(history ?? []).slice(-6).map((m) => m.content), userMessage].join(" ");
        const agentList = agents ?? [];
        let agent = agentList.find((a) => a.slug === "business") ?? agentList[0];
        let best = 0;
        for (const candidate of agentList) {
          const s = score(routingText, candidate.domains ?? []);
          if (s > best) {
            best = s;
            agent = candidate;
          }
        }
        const agentSlug = agent?.slug ?? "business";

        // ---- knowledge retrieval (active + verified + not expired + not confidential) ----
        const today = new Date().toISOString().slice(0, 10);
        const { data: kbAll } = await supabaseAdmin
          .from("knowledge_base")
          .select("id, category, title, content, reference_code, tags, valid_until, metadata")
          .eq("is_active", true)
          .eq("is_verified", true)
          .eq("is_confidential", false)
          .or(`valid_until.is.null,valid_until.gte.${today}`)
          .limit(400);

        const ranked = ((kbAll ?? []) as KbRow[])
          .map((row) => ({
            row,
            rank:
              score(routingText, row.tags ?? []) * 3 +
              score(routingText, row.category.split(/[\s&/]+/)) * 2 +
              score(routingText, row.title.split(/\s+/).filter((w) => w.length > 3)),
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

        const knowledge = ranked.length ? ranked.join("\n---\n") : "NO VERIFIED KNOWLEDGE ENTRIES MATCH THIS ENQUIRY.";

        const instructions = [
          `You are FRIX AI, the AI Business Concierge for FRAN-X Holdings (founded by Francis Ejimkeonye, Lagos, Nigeria).`,
          `You are currently operating as ${agent?.name ?? "FRIX Business AI"}. ${agent?.system_prompt ?? ""}`,
          `Tone: ${settings?.tone ?? "Professional, intelligent, concise, corporate"}. Business hours: ${settings?.business_hours ?? "Mon-Fri 9:00-18:00 WAT"}.`,
          settings?.base_instructions ?? "",
          `IDENTITY: always identify as "FRIX AI, the AI Business Concierge for FRAN-X Holdings". Never claim to be human.`,
          `ABSOLUTE NO-HALLUCINATION RULE: never invent or imply property, vehicle or product availability, oil & gas buyers or sellers, prices, investment opportunities, partnerships, licences, contracts, guarantees, delivery dates, project deadlines, employees or client information. If the fact is not in the VERIFIED KNOWLEDGE below, reply: "I don't currently have verified information about that in the FRAN-X system. I can collect your requirements and forward the inquiry to the FRAN-X team for review." and set unknown_question to the user's question.`,
          `QUALIFICATION: ask only the relevant follow-up questions for the enquiry type, 1-3 at a time, never overwhelming. Capture requirement, budget, timeline, location/country and contact details (name, email, phone).`,
          `SCORING (internal only, never reveal unless asked and permitted): score 0-100 using clear requirement, budget, timeline, legitimacy, urgency, contact info, service fit, commercial potential. Classify Hot >= ${settings?.hot_threshold ?? 75}, Warm >= ${settings?.warm_threshold ?? 50}, Cold >= ${settings?.cold_threshold ?? 25}, otherwise Unqualified.`,
          `ESCALATION RULES: ${settings?.escalation_rules ?? ""} When escalating set escalate=true and reply that a member of the FRAN-X team will review the inquiry.`,
          `RISK: flag suspicious claims, contradictions, unusual payment arrangements, missing documentation. Never accuse anyone — the reply may only say "Additional verification recommended."`,
          `PROPOSALS: for suitable technology or service work you may draft a proposal outline in proposal_draft. It is always DRAFT — HUMAN REVIEW REQUIRED and must never promise price, deadline or guarantee.`,
          `Never give unauthorised legal or financial advice. Reply in the user's language, keep replies under 140 words.`,
          `VERIFIED FRAN-X KNOWLEDGE BASE:\n${knowledge}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        const input = [
          ...(history ?? []).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: [{ type: m.role === "assistant" ? "output_text" : "input_text", text: m.content }],
          })),
          { role: "user", content: [{ type: "input_text", text: userMessage }] },
        ];

        let parsed: Record<string, never> | null = null;
        try {
          const raw = await callGateway(apiKey, agent?.model ?? "openai/gpt-5.6-sol", instructions, input);
          parsed = raw ? JSON.parse(raw) : null;
        } catch (error) {
          const status = (error as { status?: number }).status;
          if (status === 429) return Response.json({ error: "FRIX AI is busy right now. Please try again in a moment." }, { status: 429 });
          if (status === 402) return Response.json({ error: "The FRAN-X AI service is temporarily unavailable." }, { status: 402 });
          console.error("FRIX gateway failure", error);
          return Response.json({ error: "FRIX AI could not respond. Please try again." }, { status: 500 });
        }

        const r = (parsed ?? {}) as unknown as {
          reply?: string;
          category?: string;
          client_summary?: string;
          requirement?: string;
          budget?: string | null;
          timeline?: string | null;
          important_details?: string[];
          missing_information?: string[];
          collected?: { key: string; value: string }[];
          lead_score?: number;
          classification?: string;
          recommended_action?: string;
          qualified?: boolean;
          escalate?: boolean;
          escalation_reason?: string | null;
          risk_flags?: string[];
          unknown_question?: string | null;
          proposal_draft?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_company?: string | null;
          contact_country?: string | null;
        };

        const reply =
          r.reply?.trim() ||
          "I don't currently have verified information about that in the FRAN-X system. I can collect your requirements and forward the inquiry to the FRAN-X team for review.";

        const collected = Object.fromEntries((r.collected ?? []).map((c) => [c.key, c.value]));
        const summary = {
          client_summary: r.client_summary ?? "",
          requirement: r.requirement ?? "",
          budget: r.budget ?? null,
          timeline: r.timeline ?? null,
          important_details: r.important_details ?? [],
          missing_information: r.missing_information ?? [],
          recommended_action: r.recommended_action ?? "",
          proposal_draft: r.proposal_draft ?? null,
        };

        await supabaseAdmin.from("ai_messages").insert([
          { conversation_id: conversationId!, role: "user", content: userMessage },
          { conversation_id: conversationId!, role: "assistant", content: reply, agent_slug: agentSlug },
        ]);

        const prevCollected = (conversation?.["collected"] as Record<string, string>) ?? {};
        const merged = { ...prevCollected, ...collected };

        const { data: updated } = await supabaseAdmin
          .from("ai_conversations")
          .update({
            agent_slug: agentSlug,
            category: r.category ?? (conversation?.["category"] as string) ?? null,
            lead_score: typeof r.lead_score === "number" ? r.lead_score : null,
            classification: r.classification ?? null,
            summary,
            collected: merged,
            risk_flags: r.risk_flags ?? [],
            escalated: Boolean(r.escalate) || Boolean(conversation?.["escalated"]),
            escalation_reason: r.escalation_reason ?? (conversation?.["escalation_reason"] as string) ?? null,
            status: r.escalate ? "human_review" : "active",
            message_count: ((conversation?.["message_count"] as number) ?? 0) + 2,
            contact_name: r.contact_name ?? (conversation?.["contact_name"] as string) ?? null,
            contact_email: r.contact_email ?? (conversation?.["contact_email"] as string) ?? null,
            contact_phone: r.contact_phone ?? (conversation?.["contact_phone"] as string) ?? null,
          })
          .eq("id", conversationId!)
          .select("*")
          .maybeSingle();

        if (r.unknown_question) {
          await supabaseAdmin.from("ai_unknown_questions").insert({
            question: r.unknown_question,
            category: r.category ?? null,
            conversation_id: conversationId!,
          });
        }

        let reference: string | null = null;
        const shouldCreateLead = Boolean(r.qualified) || Boolean(r.escalate) || Boolean(r.contact_email);
        if (shouldCreateLead) {
          reference = await ensureInquiry(supabaseAdmin, updated ?? conversation, conversationId!, {
            summaryText: renderSummary(summary, r.lead_score ?? null, r.classification ?? null, agent?.name ?? ""),
            nextAction: r.recommended_action ?? null,
            company: r.contact_company ?? null,
            country: r.contact_country ?? null,
          });
        }

        return Response.json({
          conversationId,
          agent: agentSlug,
          reply,
          escalated: Boolean(r.escalate),
          leadScore: settings?.show_score_to_user ? (r.lead_score ?? null) : null,
          classification: settings?.show_score_to_user ? (r.classification ?? null) : null,
          reference,
        });
      },
    },
  },
});

function renderSummary(
  summary: {
    client_summary: string;
    requirement: string;
    budget: string | null;
    timeline: string | null;
    important_details: string[];
    missing_information: string[];
    recommended_action: string;
    proposal_draft: string | null;
  },
  leadScore: number | null,
  classification: string | null,
  agentName: string,
) {
  return [
    `CLIENT SUMMARY\n${summary.client_summary || "—"}`,
    `REQUIREMENT\n${summary.requirement || "—"}`,
    `BUDGET\n${summary.budget || "Not provided"}`,
    `TIMELINE\n${summary.timeline || "Not provided"}`,
    `IMPORTANT DETAILS\n${summary.important_details.length ? summary.important_details.map((d) => `• ${d}`).join("\n") : "—"}`,
    `MISSING INFORMATION\n${summary.missing_information.length ? summary.missing_information.map((d) => `• ${d}`).join("\n") : "—"}`,
    `RECOMMENDED ACTION\n${summary.recommended_action || "—"}`,
    summary.proposal_draft ? `DRAFT PROPOSAL — HUMAN REVIEW REQUIRED\n${summary.proposal_draft}` : "",
    `LEAD SCORE\n${leadScore ?? "—"}/100 (${classification ?? "—"}) · Handled by ${agentName}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

type AdminClient = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

async function ensureInquiry(
  supabaseAdmin: AdminClient,
  conversation: Record<string, unknown> | null,
  conversationId: string,
  extra: { summaryText: string; nextAction?: string | null; company?: string | null; country?: string | null },
) {
  const existingId = conversation?.["inquiry_id"] as string | undefined;
  const collected = (conversation?.["collected"] as Record<string, string>) ?? {};
  const description =
    (conversation?.["summary"] as { requirement?: string } | undefined)?.requirement ||
    Object.entries(collected)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ") ||
    "Enquiry captured by FRIX AI.";

  const payload = {
    kind: "contact",
    category: (conversation?.["category"] as string) ?? null,
    full_name: (conversation?.["contact_name"] as string) ?? "FRIX AI lead",
    email: (conversation?.["contact_email"] as string) ?? "unknown@franx.local",
    phone: (conversation?.["contact_phone"] as string) ?? null,
    company: extra.company ?? null,
    country: extra.country ?? null,
    description,
    budget: (conversation?.["summary"] as { budget?: string } | undefined)?.budget ?? null,
    timeline: (conversation?.["summary"] as { timeline?: string } | undefined)?.timeline ?? null,
    details: { conversation_id: conversationId, collected } as never,
    source: "FRIX AI",
    ai_summary: extra.summaryText,
    next_action: extra.nextAction ?? null,
    lead_quality: (conversation?.["classification"] as string) ?? null,
    priority: conversation?.["escalated"] ? "High" : "Normal",
    status: conversation?.["escalated"] ? "Reviewing" : "New",
    user_id: (conversation?.["user_id"] as string) ?? null,
  };

  if (existingId) {
    await supabaseAdmin.from("inquiries").update(payload).eq("id", existingId);
    const { data } = await supabaseAdmin.from("inquiries").select("reference").eq("id", existingId).maybeSingle();
    return data?.reference ?? null;
  }

  const reference = makeReference();
  const { data, error } = await supabaseAdmin
    .from("inquiries")
    .insert({ ...payload, reference })
    .select("id, reference")
    .single();
  if (error || !data) return null;
  await supabaseAdmin.from("ai_conversations").update({ inquiry_id: data.id }).eq("id", conversationId);
  return data.reference;
}
