export const FRIX = {
  name: "FRIX AI",
  title: "FRAN-X AI Assistant",
  intro:
    "I'm FRIX AI, the AI assistant for FRAN-X Technologies. Tell me what you need — websites, mobile apps, AI, automation, data or general business — and I'll guide you.",
} as const;

export const FRIX_AGENT_LABELS: Record<string, string> = {
  business: "FRIX Business AI",
  tech: "FRIX Tech AI",
  property: "FRIX Property AI",
  auto: "FRIX Auto AI",
  energy: "FRIX Energy AI",
  bizdev: "FRIX Business Development AI",
};

export const KB_CATEGORIES = [
  "Website Development",
  "Mobile App Development",
  "AI",
  "AI & Automation",
  "Data & Business Intelligence",
  "Custom Software",
  "API Development",
  "Business Consulting",
  "Marketing",
  "FRIX AI",
  "FAQs",
  "Policies",
  "General Company Information",
] as const;

export type FrixChatMessage = { role: "user" | "assistant"; content: string; agent?: string | null };

export type FrixReply = {
  conversationId: string;
  agent: string;
  agentLabel: string;
  reply: string;
  escalated: boolean;
  leadScore: number | null;
  classification: string | null;
  showScore: boolean;
  reference: string | null;
};

export function openFrix(prefill?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("frix:open", { detail: { prefill } }));
}
