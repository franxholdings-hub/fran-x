export const FRIX = {
  name: "FRIX AI",
  title: "FRAN-X Business Concierge",
  intro:
    "I'm FRIX AI, the AI Business Concierge for FRAN-X Holdings. Tell me what you need — technology, property, vehicles, energy, investment or general business — and I'll guide you.",
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
  "E-commerce",
  "Business Consulting",
  "Marketing",
  "Real Estate",
  "Automotive",
  "Oil & Gas",
  "Investment",
  "Agriculture",
  "Hospitality",
  "Aviation",
  "FRAN-X Companies",
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
