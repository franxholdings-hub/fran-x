// Shared constants & helpers for the AI Integration + Revenue system.

export const AI_CLIENT_STATUSES = ["pending", "active", "suspended"] as const;
export const AI_PROVIDERS = ["lovable", "openai", "gemini", "claude", "groq"] as const;
export const AI_KNOWLEDGE_TYPES = [
  "faq",
  "product",
  "service",
  "pricing",
  "document",
  "general",
] as const;

export const AI_PACKAGE_CODES = ["starter", "professional", "enterprise"] as const;

export const SUBSCRIPTION_STATUSES = [
  "trial",
  "active",
  "past_due",
  "cancelled",
  "expired",
  "suspended",
] as const;

export const BILLING_INTERVALS = ["monthly", "yearly", "one_time", "free"] as const;

export const PLAN_PRODUCT_TYPES = ["platform", "ai_integration"] as const;

export const PAYMENT_VERIFICATION_STATUSES = ["unverified", "verified"] as const;

export const PAYMENT_STATUSES_FULL = [
  "pending",
  "successful",
  "failed",
  "abandoned",
  "refunded",
] as const;

// Centralized revenue categories for the FRAN-X Technologies business model
// — digital product sales appear separately from technology-service revenue.
// Free text in the DB so future products can be added without a migration,
// but this is the canonical list for filters and manual entry.
export const REVENUE_CATEGORIES = [
  "FRIX AI Subscriptions",
  "Web Development",
  "Mobile App Development",
  "AI & Automation",
  "Data & Business Intelligence",
  "Custom Software & APIs",
  "Digital Product Sales",
  "Maintenance/Support",
  "Enterprise Projects",
  "Other",
] as const;

export const PAYMENT_METHODS = [
  "paystack",
  "bank_transfer",
  "cash",
  "card",
  "other",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "completed",
  "failed",
  "refunded",
] as const;

export const EXPENSE_CATEGORIES = [
  "AI/API",
  "Hosting",
  "Software",
  "Marketing",
  "Operations",
  "Logistics",
  "Other",
] as const;

export function formatMoney(amount: number | null | undefined, currency = "NGN") {
  if (amount == null) return "—";
  const symbol = currency === "NGN" ? "₦" : "";
  return `${symbol}${Number(amount).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

// Suggested questions stored as a JSON array in branding.suggested_questions.
export const DEFAULT_SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "How can I get a quote?",
  "What are your prices?",
];

export function widgetInstallScript(clientCode: string, widgetDomain: string) {
  return `<script\n  src="${widgetDomain}/widget.js"\n  data-client-id="${clientCode}"\n  async\n></script>`;
}

export const WIDGET_DOMAIN_PLACEHOLDER = "https://YOUR-FRANX-WIDGET-DOMAIN";
