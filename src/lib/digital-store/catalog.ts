// FRAN-X DIGITAL STORE — catalog source of truth.
//
// This module defines every digital product, service and subscription plan
// for the FRAN-X Digital Store. It mirrors the marketplace catalog pattern:
// the UI consumes the helper functions below, never the raw arrays, so the
// data source can later be swapped for Supabase tables without touching the UI.
//
// Prices are the initial recommended values from the FRAN-X specification and
// are fully editable from the admin dashboard once the migration is applied
// (see supabase/migrations/20260831000000_franx_digital_store.sql). Until then
// these values render the storefront immediately.

import {
  FileText,
  BookOpen,
  Wallet,
  Bot,
  Briefcase,
  Zap,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { PHOTOS, type PhotoKey } from "@/lib/photos";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoreCategoryId =
  | "templates"
  | "ebooks"
  | "finance"
  | "frix-ai"
  | "services"
  | "automation"
  | "resources";

export type StoreCategory = {
  id: StoreCategoryId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  blurb: string;
  accent: string;
};

export type DigitalProduct = {
  id: string;
  slug: string;
  name: string;
  category: StoreCategoryId;
  price: number;
  currency: string;
  description: string;
  whatsIncluded: string[];
  fileFormat: string;
  cover: PhotoKey;
  featured?: boolean;
  bundle?: boolean;
  bundleSlugs?: string[];
  /** A real downloadable file must be uploaded before this is true. */
  hasFile: boolean;
  published: boolean;
  relatedSlugs?: string[];
  /** Educational disclaimer for financial guides. */
  disclaimer?: string;
};

export type ServiceBillingType = "one_time" | "monthly" | "annual" | "custom";

export type ServiceGroup =
  | "website"
  | "marketing"
  | "branding"
  | "automation"
  | "retainer";

export type DigitalService = {
  id: string;
  slug: string;
  name: string;
  group: ServiceGroup;
  groupLabel: string;
  priceFrom: number;
  billingType: ServiceBillingType;
  billingLabel: string;
  description: string;
  whatsIncluded: string[];
  deliveryEstimate: string;
  cover: PhotoKey;
  featured?: boolean;
  /** Complex services allow a custom-quote request instead of fixed checkout. */
  customQuoteOnly?: boolean;
};

export type StoreSubscription = {
  id: string;
  code: string;
  name: string;
  type: "resource_pass" | "frix_ai";
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  benefits: string[];
  featured?: boolean;
  /** FRIX AI usage limits — only advertised where the system supports them. */
  usageLimit?: number;
  badge?: string;
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    id: "templates",
    label: "Business Templates",
    shortLabel: "Templates",
    icon: FileText,
    blurb: "Ready-to-use business documents, plans and frameworks.",
    accent: "from-emerald-500/15 to-emerald-500/0",
  },
  {
    id: "ebooks",
    label: "Business E-Books",
    shortLabel: "E-Books",
    icon: BookOpen,
    blurb: "Practical guides for Nigerian entrepreneurs and SMEs.",
    accent: "from-amber-500/15 to-amber-500/0",
  },
  {
    id: "finance",
    label: "Financial Management Guides",
    shortLabel: "Finance",
    icon: Wallet,
    blurb: "Educational resources for personal and business finance.",
    accent: "from-sky-500/15 to-sky-500/0",
  },
  {
    id: "frix-ai",
    label: "FRIX AI",
    shortLabel: "FRIX AI",
    icon: Bot,
    blurb: "AI subscriptions with clearly defined usage limits.",
    accent: "from-violet-500/15 to-violet-500/0",
  },
  {
    id: "services",
    label: "Digital Services",
    shortLabel: "Services",
    icon: Briefcase,
    blurb: "Websites, marketing, branding and professional services.",
    accent: "from-rose-500/15 to-rose-500/0",
  },
  {
    id: "automation",
    label: "Business Automation",
    shortLabel: "Automation",
    icon: Zap,
    blurb: "WhatsApp, CRM, lead capture and workflow automation.",
    accent: "from-cyan-500/15 to-cyan-500/0",
  },
  {
    id: "resources",
    label: "Premium Resources",
    shortLabel: "Resources",
    icon: Crown,
    blurb: "The FRAN-X Resource Pass — recurring premium access.",
    accent: "from-yellow-500/15 to-yellow-500/0",
  },
];

export const STORE_CATEGORY_MAP: Record<StoreCategoryId, StoreCategory> =
  Object.fromEntries(STORE_CATEGORIES.map((c) => [c.id, c])) as Record<
    StoreCategoryId,
    StoreCategory
  >;

const FINANCE_DISCLAIMER =
  "These are educational resources only and do not constitute personalized financial advice. Consult a licensed professional for advice tailored to your circumstances.";

// ---------------------------------------------------------------------------
// Digital products
// ---------------------------------------------------------------------------

export const DIGITAL_PRODUCTS: DigitalProduct[] = [
  // --- Business Templates ---
  {
    id: "tpl-001",
    slug: "business-plan-template",
    name: "Business Plan Template",
    category: "templates",
    price: 5000,
    currency: "NGN",
    description:
      "A complete, investor-ready business plan template structured for Nigerian enterprises. Covers executive summary, market analysis, operations, financials and strategy.",
    whatsIncluded: [
      "Executive summary framework",
      "Market & competitor analysis sections",
      "Operations & management plan",
      "3-year financial projection tables",
      "Editable format with guidance notes",
    ],
    fileFormat: "DOCX + PDF",
    cover: "data",
    featured: true,
    hasFile: false,
    published: true,
    relatedSlugs: ["company-profile-template", "financial-projection-template", "complete-startup-business-bundle"],
  },
  {
    id: "tpl-002",
    slug: "professional-invoice-pack",
    name: "Professional Invoice Pack",
    category: "templates",
    price: 2500,
    currency: "NGN",
    description:
      "A pack of clean, professional invoice templates for service and product businesses. Ready to customise and send.",
    whatsIncluded: [
      "5 invoice template designs",
      "Receipt & quotation templates",
      "Naira & multi-currency formats",
      "Automated total calculation (spreadsheet)",
    ],
    fileFormat: "XLSX + DOCX",
    cover: "technology",
    hasFile: false,
    published: true,
    relatedSlugs: ["business-plan-template", "company-profile-template"],
  },
  {
    id: "tpl-003",
    slug: "company-profile-template",
    name: "Company Profile Template",
    category: "templates",
    price: 5000,
    currency: "NGN",
    description:
      "Present your business professionally with a structured company profile template. Ideal for proposals, partnerships and tenders.",
    whatsIncluded: [
      "Company overview & history sections",
      "Services & capabilities layout",
      "Team & leadership pages",
      "Portfolio & case-study framework",
      "Editable branded design",
    ],
    fileFormat: "DOCX + PDF",
    cover: "consulting",
    featured: true,
    hasFile: false,
    published: true,
    relatedSlugs: ["business-plan-template", "pitch-deck-template", "professional-company-profile-svc"],
  },
  {
    id: "tpl-004",
    slug: "marketing-plan-template",
    name: "Marketing Plan Template",
    category: "templates",
    price: 5000,
    currency: "NGN",
    description:
      "A structured marketing plan template to define audience, channels, budget and KPIs for your business.",
    whatsIncluded: [
      "Target audience & positioning framework",
      "Channel strategy worksheets",
      "Budget allocation tables",
      "KPI & tracking dashboard template",
    ],
    fileFormat: "DOCX + XLSX",
    cover: "marketing",
    hasFile: false,
    published: true,
    relatedSlugs: ["business-plan-template", "complete-startup-business-bundle"],
  },
  {
    id: "tpl-005",
    slug: "financial-projection-template",
    name: "Financial Projection Template",
    category: "templates",
    price: 7500,
    currency: "NGN",
    description:
      "Build credible 3-year financial projections with linked income statement, cash flow and balance sheet models.",
    whatsIncluded: [
      "Linked 3-year P&L model",
      "Cash flow projection",
      "Balance sheet framework",
      "Scenario & sensitivity tables",
      "Pre-built formulas and charts",
    ],
    fileFormat: "XLSX",
    cover: "capital",
    featured: true,
    hasFile: false,
    published: true,
    relatedSlugs: ["business-plan-template", "complete-startup-business-bundle", "small-business-financial-management"],
  },
  {
    id: "tpl-006",
    slug: "pitch-deck-template",
    name: "Pitch Deck Template",
    category: "templates",
    price: 7500,
    currency: "NGN",
    description:
      "An investor-grade pitch deck template with proven slide structure to present your business and raise capital.",
    whatsIncluded: [
      "12-slide investor structure",
      "Problem, solution & market slides",
      "Traction & financials layouts",
      "Editable design master",
    ],
    fileFormat: "PPTX",
    cover: "opportunities",
    hasFile: false,
    published: true,
    relatedSlugs: ["business-plan-template", "company-profile-template", "pitch-deck-creation-svc"],
  },
  {
    id: "tpl-007",
    slug: "complete-startup-business-bundle",
    name: "Complete Startup Business Bundle",
    category: "templates",
    price: 20000,
    currency: "NGN",
    description:
      "Everything an entrepreneur needs to launch — the full collection of FRAN-X business templates in one discounted bundle.",
    whatsIncluded: [
      "Business Plan Template",
      "Marketing Plan Template",
      "Financial Projection Template",
      "Company Profile Template",
      "Pitch Deck Template",
      "Professional Invoice Pack",
    ],
    fileFormat: "DOCX + XLSX + PPTX + PDF",
    cover: "consulting",
    featured: true,
    bundle: true,
    bundleSlugs: [
      "business-plan-template",
      "marketing-plan-template",
      "financial-projection-template",
      "company-profile-template",
      "pitch-deck-template",
      "professional-invoice-pack",
    ],
    hasFile: false,
    published: true,
    relatedSlugs: ["business-plan-template", "financial-projection-template", "company-profile-template"],
  },

  // --- Business E-Books ---
  {
    id: "bk-001",
    slug: "how-to-start-a-business-in-nigeria",
    name: "How to Start a Business in Nigeria",
    category: "ebooks",
    price: 5000,
    currency: "NGN",
    description:
      "A practical step-by-step guide to registering, funding and launching a business in Nigeria — from idea to operations.",
    whatsIncluded: [
      "Business registration (CAC) walkthrough",
      "Funding & capital options",
      "Tax & compliance basics",
      "Launch checklist",
    ],
    fileFormat: "PDF",
    cover: "consulting",
    hasFile: false,
    published: true,
    relatedSlugs: ["the-nigerian-entrepreneurs-guide", "sme-growth-playbook", "franx-business-library-bundle"],
  },
  {
    id: "bk-002",
    slug: "the-nigerian-entrepreneurs-guide",
    name: "The Nigerian Entrepreneur's Guide",
    category: "ebooks",
    price: 5000,
    currency: "NGN",
    description:
      "A comprehensive guide to building and scaling a business in the Nigerian environment, with real-world case studies.",
    whatsIncluded: [
      "Mindset & strategy foundations",
      "Building a team in Nigeria",
      "Scaling operations",
      "Case studies from Nigerian founders",
    ],
    fileFormat: "PDF",
    cover: "opportunities",
    hasFile: false,
    published: true,
    relatedSlugs: ["how-to-start-a-business-in-nigeria", "business-management-fundamentals"],
  },
  {
    id: "bk-003",
    slug: "sme-growth-playbook",
    name: "SME Growth Playbook",
    category: "ebooks",
    price: 7500,
    currency: "NGN",
    description:
      "Actionable playbooks for growing a small or medium enterprise — sales, systems, hiring and expansion.",
    whatsIncluded: [
      "Growth frameworks",
      "Sales & retention systems",
      "Hiring & delegation",
      "Expansion planning",
    ],
    fileFormat: "PDF",
    cover: "data",
    featured: true,
    hasFile: false,
    published: true,
    relatedSlugs: ["how-to-build-a-profitable-online-business", "business-management-fundamentals"],
  },
  {
    id: "bk-004",
    slug: "digital-marketing-for-small-businesses",
    name: "Digital Marketing for Small Businesses",
    category: "ebooks",
    price: 5000,
    currency: "NGN",
    description:
      "Master digital marketing on a small budget — social media, SEO, email and paid ads that actually convert.",
    whatsIncluded: [
      "Social media strategy",
      "SEO fundamentals",
      "Email marketing playbook",
      "Paid ads on a budget",
    ],
    fileFormat: "PDF",
    cover: "marketing",
    hasFile: false,
    published: true,
    relatedSlugs: ["e-commerce-business-guide", "customer-acquisition-guide"],
  },
  {
    id: "bk-005",
    slug: "e-commerce-business-guide",
    name: "E-Commerce Business Guide",
    category: "ebooks",
    price: 5000,
    currency: "NGN",
    description:
      "Build and run a profitable online store — platform selection, logistics, payments and customer experience.",
    whatsIncluded: [
      "Platform selection guide",
      "Payments & logistics in Nigeria",
      "Product listing best practices",
      "Customer experience systems",
    ],
    fileFormat: "PDF",
    cover: "ecommerce",
    hasFile: false,
    published: true,
    relatedSlugs: ["digital-marketing-for-small-businesses", "how-to-build-a-profitable-online-business"],
  },
  {
    id: "bk-006",
    slug: "business-branding-guide",
    name: "Business Branding Guide",
    category: "ebooks",
    price: 5000,
    currency: "NGN",
    description:
      "Build a strong, recognisable brand from scratch — identity, voice, visuals and consistency.",
    whatsIncluded: [
      "Brand identity framework",
      "Brand voice & messaging",
      "Visual identity basics",
      "Brand consistency checklist",
    ],
    fileFormat: "PDF",
    cover: "retail",
    hasFile: false,
    published: true,
    relatedSlugs: ["professional-brand-identity-svc", "digital-marketing-for-small-businesses"],
  },
  {
    id: "bk-007",
    slug: "customer-acquisition-guide",
    name: "Customer Acquisition Guide",
    category: "ebooks",
    price: 5000,
    currency: "NGN",
    description:
      "Proven frameworks to attract and convert your first customers — channels, funnels and retention.",
    whatsIncluded: [
      "Acquisition channel matrix",
      "Conversion funnel design",
      "Retention & loyalty",
      "Metrics that matter",
    ],
    fileFormat: "PDF",
    cover: "marketing",
    hasFile: false,
    published: true,
    relatedSlugs: ["digital-marketing-for-small-businesses", "sme-growth-playbook"],
  },
  {
    id: "bk-008",
    slug: "business-management-fundamentals",
    name: "Business Management Fundamentals",
    category: "ebooks",
    price: 5000,
    currency: "NGN",
    description:
      "The essentials of running a business day-to-day — operations, finance, people and performance.",
    whatsIncluded: [
      "Operations management",
      "Financial basics for managers",
      "People & performance",
      "Decision-making frameworks",
    ],
    fileFormat: "PDF",
    cover: "consulting",
    hasFile: false,
    published: true,
    relatedSlugs: ["the-nigerian-entrepreneurs-guide", "sme-growth-playbook"],
  },
  {
    id: "bk-009",
    slug: "ai-for-business",
    name: "AI for Business",
    category: "ebooks",
    price: 7500,
    currency: "NGN",
    description:
      "A practical guide to applying AI tools in your business — automation, content, customer service and analytics.",
    whatsIncluded: [
      "AI tools landscape",
      "Automation use cases",
      "AI for content & marketing",
      "Implementation roadmap",
    ],
    fileFormat: "PDF",
    cover: "ai",
    featured: true,
    hasFile: false,
    published: true,
    relatedSlugs: ["how-to-build-a-profitable-online-business", "digital-marketing-for-small-businesses"],
  },
  {
    id: "bk-010",
    slug: "how-to-build-a-profitable-online-business",
    name: "How to Build a Profitable Online Business",
    category: "ebooks",
    price: 7500,
    currency: "NGN",
    description:
      "A complete blueprint for building an online business that is genuinely profitable — model, margins and scale.",
    whatsIncluded: [
      "Profitable business models",
      "Unit economics & margins",
      "Scaling without burning cash",
      "Realistic revenue planning",
    ],
    fileFormat: "PDF",
    cover: "ecommerce",
    featured: true,
    hasFile: false,
    published: true,
    relatedSlugs: ["e-commerce-business-guide", "sme-growth-playbook", "franx-business-library-bundle"],
  },
  {
    id: "bk-011",
    slug: "franx-business-library-bundle",
    name: "FRAN-X Business Library Bundle",
    category: "ebooks",
    price: 25000,
    currency: "NGN",
    description:
      "A curated collection of selected FRAN-X business e-books at a discounted combined price. Build your entrepreneurial library in one purchase.",
    whatsIncluded: [
      "How to Start a Business in Nigeria",
      "The Nigerian Entrepreneur's Guide",
      "SME Growth Playbook",
      "Digital Marketing for Small Businesses",
      "AI for Business",
      "How to Build a Profitable Online Business",
    ],
    fileFormat: "PDF",
    cover: "consulting",
    bundle: true,
    bundleSlugs: [
      "how-to-start-a-business-in-nigeria",
      "the-nigerian-entrepreneurs-guide",
      "sme-growth-playbook",
      "digital-marketing-for-small-businesses",
      "ai-for-business",
      "how-to-build-a-profitable-online-business",
    ],
    hasFile: false,
    published: true,
    relatedSlugs: ["sme-growth-playbook", "ai-for-business"],
  },

  // --- Financial Management Guides ---
  {
    id: "fin-001",
    slug: "personal-finance-management-guide",
    name: "Personal Finance Management Guide",
    category: "finance",
    price: 3500,
    currency: "NGN",
    description:
      "Learn to manage your personal money effectively — budgeting, saving, investing and protecting your income.",
    whatsIncluded: ["Budgeting system", "Saving strategies", "Investment basics", "Emergency fund planning"],
    fileFormat: "PDF",
    cover: "capital",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["budgeting-expense-management", "saving-capital-management", "franx-finance-starter-bundle"],
  },
  {
    id: "fin-002",
    slug: "small-business-financial-management",
    name: "Small Business Financial Management",
    category: "finance",
    price: 5000,
    currency: "NGN",
    description:
      "A practical guide to managing your business finances — cash flow, records, reporting and profitability.",
    whatsIncluded: ["Bookkeeping basics", "Cash flow management", "Financial reporting", "Profitability analysis"],
    fileFormat: "PDF",
    cover: "data",
    featured: true,
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["cash-flow-management-tutorial", "profit-loss-management", "franx-finance-starter-bundle"],
  },
  {
    id: "fin-003",
    slug: "cash-flow-management-tutorial",
    name: "Cash-Flow Management Tutorial",
    category: "finance",
    price: 5000,
    currency: "NGN",
    description:
      "Master cash flow — the lifeblood of any business. Learn to forecast, monitor and protect your cash position.",
    whatsIncluded: ["Cash flow forecasting", "Working capital management", "Cash flow statements", "Common pitfalls"],
    fileFormat: "PDF",
    cover: "capital",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["small-business-financial-management", "profit-loss-management"],
  },
  {
    id: "fin-004",
    slug: "budgeting-expense-management",
    name: "Budgeting & Expense Management",
    category: "finance",
    price: 3500,
    currency: "NGN",
    description:
      "Build budgets that work and control expenses — for personal finances and small businesses.",
    whatsIncluded: ["Budgeting methods", "Expense tracking", "Cost control", "Variance analysis"],
    fileFormat: "PDF",
    cover: "data",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["personal-finance-management-guide", "pricing-cost-management"],
  },
  {
    id: "fin-005",
    slug: "profit-loss-management",
    name: "Profit & Loss Management",
    category: "finance",
    price: 3500,
    currency: "NGN",
    description:
      "Understand and improve your profit and loss position — revenue, costs, margins and bottom-line growth.",
    whatsIncluded: ["P&L fundamentals", "Margin improvement", "Cost structure analysis", "Profit planning"],
    fileFormat: "PDF",
    cover: "capital",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["small-business-financial-management", "pricing-cost-management"],
  },
  {
    id: "fin-006",
    slug: "pricing-cost-management",
    name: "Pricing & Cost Management",
    category: "finance",
    price: 3500,
    currency: "NGN",
    description:
      "Price your products and services profitably — cost structures, pricing models and margin protection.",
    whatsIncluded: ["Cost structure analysis", "Pricing models", "Margin protection", "Pricing psychology"],
    fileFormat: "PDF",
    cover: "data",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["profit-loss-management", "small-business-financial-management"],
  },
  {
    id: "fin-007",
    slug: "saving-capital-management",
    name: "Saving & Capital Management",
    category: "finance",
    price: 3500,
    currency: "NGN",
    description:
      "Build savings and manage capital for growth — personal saving discipline and business capital allocation.",
    whatsIncluded: ["Saving frameworks", "Capital allocation", "Growth funding", "Risk management"],
    fileFormat: "PDF",
    cover: "capital",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["personal-finance-management-guide", "financial-planning-tutorial"],
  },
  {
    id: "fin-008",
    slug: "debt-management-guide",
    name: "Debt Management Guide",
    category: "finance",
    price: 3500,
    currency: "NGN",
    description:
      "Manage and reduce debt effectively — personal and business debt strategies and repayment planning.",
    whatsIncluded: ["Debt assessment", "Repayment strategies", "Negotiating with creditors", "Staying debt-free"],
    fileFormat: "PDF",
    cover: "data",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["personal-finance-management-guide", "saving-capital-management"],
  },
  {
    id: "fin-009",
    slug: "financial-planning-tutorial",
    name: "Financial Planning Tutorial",
    category: "finance",
    price: 5000,
    currency: "NGN",
    description:
      "A structured tutorial on financial planning — setting goals, building plans and tracking progress over time.",
    whatsIncluded: ["Goal setting", "Financial planning frameworks", "Tracking & review", "Long-term planning"],
    fileFormat: "PDF",
    cover: "capital",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["saving-capital-management", "small-business-financial-management"],
  },
  {
    id: "fin-010",
    slug: "beginners-guide-to-business-accounting",
    name: "Beginner's Guide to Business Accounting",
    category: "finance",
    price: 5000,
    currency: "NGN",
    description:
      "Learn business accounting from scratch — records, statements and the accounting cycle, explained simply.",
    whatsIncluded: ["Accounting cycle", "Recording transactions", "Financial statements", "Accounting software basics"],
    fileFormat: "PDF",
    cover: "data",
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["small-business-financial-management", "financial-planning-tutorial"],
  },
  {
    id: "fin-011",
    slug: "franx-finance-starter-bundle",
    name: "FRAN-X Finance Starter Bundle",
    category: "finance",
    price: 15000,
    currency: "NGN",
    description:
      "A discounted bundle of selected financial management guides — everything you need to build strong financial foundations.",
    whatsIncluded: [
      "Personal Finance Management Guide",
      "Small Business Financial Management",
      "Cash-Flow Management Tutorial",
      "Budgeting & Expense Management",
      "Beginner's Guide to Business Accounting",
    ],
    fileFormat: "PDF",
    cover: "capital",
    bundle: true,
    bundleSlugs: [
      "personal-finance-management-guide",
      "small-business-financial-management",
      "cash-flow-management-tutorial",
      "budgeting-expense-management",
      "beginners-guide-to-business-accounting",
    ],
    hasFile: false,
    published: true,
    disclaimer: FINANCE_DISCLAIMER,
    relatedSlugs: ["small-business-financial-management", "financial-planning-tutorial"],
  },
];

// ---------------------------------------------------------------------------
// Digital services
// ---------------------------------------------------------------------------

export const DIGITAL_SERVICES: DigitalService[] = [
  // --- Website services ---
  {
    id: "svc-web-001",
    slug: "starter-website",
    name: "Starter Website",
    group: "website",
    groupLabel: "Website Services",
    priceFrom: 50000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "A clean, professional business website to establish your online presence. Responsive design with your core pages.",
    whatsIncluded: [
      "Basic business website",
      "Responsive design",
      "Core pages (Home, About, Services, Contact)",
      "Contact functionality",
      "Basic deployment",
    ],
    deliveryEstimate: "5–10 business days",
    cover: "realEstate",
    featured: true,
  },
  {
    id: "svc-web-002",
    slug: "professional-website",
    name: "Professional Website",
    group: "website",
    groupLabel: "Website Services",
    priceFrom: 100000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "A more advanced business website with multiple pages, forms and business sections, plus basic SEO setup.",
    whatsIncluded: [
      "Advanced multi-page design",
      "Multiple pages & business sections",
      "Lead / enquiry forms",
      "Basic SEO setup",
      "Deployment",
    ],
    deliveryEstimate: "10–20 business days",
    cover: "technology",
  },
  {
    id: "svc-web-003",
    slug: "business-ecommerce-website",
    name: "Business / E-Commerce Website",
    group: "website",
    groupLabel: "Website Services",
    priceFrom: 200000,
    billingType: "custom",
    billingLabel: "From",
    description:
      "An advanced business website with e-commerce functionality, product catalogue, customer and admin features.",
    whatsIncluded: [
      "Advanced business website",
      "E-commerce functionality",
      "Product / catalogue system",
      "Customer functionality",
      "Admin functionality",
      "Deployment",
    ],
    deliveryEstimate: "3–6 weeks",
    cover: "ecommerce",
    featured: true,
  },

  // --- Digital marketing services ---
  {
    id: "svc-mkt-001",
    slug: "seo-starter-setup",
    name: "SEO Starter Setup",
    group: "marketing",
    groupLabel: "Digital Marketing",
    priceFrom: 30000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "Get found on Google. A foundational SEO setup covering on-page optimisation, technical basics and keyword targeting.",
    whatsIncluded: [
      "On-page SEO optimisation",
      "Technical SEO basics",
      "Keyword research & targeting",
      "Google Search Console setup",
    ],
    deliveryEstimate: "5–10 business days",
    cover: "marketing",
  },
  {
    id: "svc-mkt-002",
    slug: "social-media-management",
    name: "Social Media Management",
    group: "marketing",
    groupLabel: "Digital Marketing",
    priceFrom: 50000,
    billingType: "monthly",
    billingLabel: "From / month",
    description:
      "Ongoing social media management to grow your audience, engagement and brand presence across platforms.",
    whatsIncluded: [
      "Content planning & scheduling",
      "Community management",
      "Monthly performance report",
      "Platform strategy",
    ],
    deliveryEstimate: "Ongoing (monthly)",
    cover: "marketing",
    featured: true,
  },
  {
    id: "svc-mkt-003",
    slug: "digital-marketing-management",
    name: "Digital Marketing Management",
    group: "marketing",
    groupLabel: "Digital Marketing",
    priceFrom: 75000,
    billingType: "monthly",
    billingLabel: "From / month",
    description:
      "Full digital marketing management — strategy, campaigns, analytics and optimisation across channels.",
    whatsIncluded: [
      "Marketing strategy & campaigns",
      "Paid ads management",
      "Analytics & reporting",
      "Continuous optimisation",
    ],
    deliveryEstimate: "Ongoing (monthly)",
    cover: "data",
  },
  {
    id: "svc-mkt-004",
    slug: "social-media-content-package",
    name: "Social Media Content Package",
    group: "marketing",
    groupLabel: "Digital Marketing",
    priceFrom: 25000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "A ready-to-post content package for your social channels — graphics, captions and a content calendar.",
    whatsIncluded: [
      "Designed graphics",
      "Caption copywriting",
      "Content calendar",
      "Hashtag strategy",
    ],
    deliveryEstimate: "5–10 business days",
    cover: "retail",
  },

  // --- Branding services ---
  {
    id: "svc-brd-001",
    slug: "business-branding-starter",
    name: "Business Branding Starter",
    group: "branding",
    groupLabel: "Branding Services",
    priceFrom: 30000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "Establish your brand identity with the essentials — logo, colours and basic brand guidelines.",
    whatsIncluded: [
      "Logo design",
      "Colour palette & typography",
      "Basic brand guidelines",
      "Source files",
    ],
    deliveryEstimate: "5–10 business days",
    cover: "retail",
  },
  {
    id: "svc-brd-002",
    slug: "professional-brand-identity-svc",
    name: "Professional Brand Identity",
    group: "branding",
    groupLabel: "Branding Services",
    priceFrom: 75000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "A complete, professional brand identity system — logo suite, visual language, brand guidelines and assets.",
    whatsIncluded: [
      "Full logo suite",
      "Visual identity system",
      "Brand guidelines document",
      "Social & stationery assets",
    ],
    deliveryEstimate: "2–3 weeks",
    cover: "retail",
    featured: true,
  },
  {
    id: "svc-brd-003",
    slug: "pitch-deck-creation",
    name: "Pitch Deck Creation",
    group: "branding",
    groupLabel: "Branding Services",
    priceFrom: 30000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "A professionally designed pitch deck to present your business and raise capital with confidence.",
    whatsIncluded: [
      "Story & structure",
      "Professional slide design",
      "Data visualisation",
      "Editable source files",
    ],
    deliveryEstimate: "1–2 weeks",
    cover: "opportunities",
  },
  {
    id: "svc-brd-004",
    slug: "professional-company-profile-svc",
    name: "Professional Company Profile",
    group: "branding",
    groupLabel: "Branding Services",
    priceFrom: 25000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "A polished company profile document to present your business for partnerships, proposals and tenders.",
    whatsIncluded: [
      "Profile structure & copy",
      "Professional layout design",
      "Branded styling",
      "Print-ready PDF",
    ],
    deliveryEstimate: "5–10 business days",
    cover: "consulting",
  },

  // --- Business automation services ---
  {
    id: "svc-aut-001",
    slug: "whatsapp-business-automation",
    name: "WhatsApp Business Automation",
    group: "automation",
    groupLabel: "Business Automation",
    priceFrom: 50000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "Automate customer communication on WhatsApp — auto-replies, broadcasts, catalogues and business setup.",
    whatsIncluded: [
      "WhatsApp Business setup",
      "Auto-reply & menu automation",
      "Broadcast & catalogue configuration",
      "Integration guidance",
    ],
    deliveryEstimate: "1–2 weeks",
    cover: "mobile",
    featured: true,
  },
  {
    id: "svc-aut-002",
    slug: "crm-setup",
    name: "CRM Setup",
    group: "automation",
    groupLabel: "Business Automation",
    priceFrom: 50000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "Set up a customer relationship management system tailored to your sales process and team.",
    whatsIncluded: [
      "CRM platform configuration",
      "Sales pipeline setup",
      "Contact & deal workflows",
      "Team training guide",
    ],
    deliveryEstimate: "1–2 weeks",
    cover: "technology",
  },
  {
    id: "svc-aut-003",
    slug: "lead-capture-system",
    name: "Lead Capture System",
    group: "automation",
    groupLabel: "Business Automation",
    priceFrom: 30000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "Capture leads from your website and channels automatically, routed to the right place for follow-up.",
    whatsIncluded: [
      "Lead capture forms",
      "Routing & notifications",
      "CRM integration",
      "Analytics setup",
    ],
    deliveryEstimate: "5–10 business days",
    cover: "mobile",
  },
  {
    id: "svc-aut-004",
    slug: "booking-system",
    name: "Booking System",
    group: "automation",
    groupLabel: "Business Automation",
    priceFrom: 40000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "Let customers book appointments or services online with an automated booking and reminder system.",
    whatsIncluded: [
      "Online booking calendar",
      "Automated reminders",
      "Availability management",
      "Integration setup",
    ],
    deliveryEstimate: "1–2 weeks",
    cover: "mobile",
  },
  {
    id: "svc-aut-005",
    slug: "customer-follow-up-automation",
    name: "Customer Follow-Up Automation",
    group: "automation",
    groupLabel: "Business Automation",
    priceFrom: 40000,
    billingType: "one_time",
    billingLabel: "From",
    description:
      "Automate your customer follow-up sequences to improve retention, reviews and repeat business.",
    whatsIncluded: [
      "Follow-up sequence design",
      "Email / message automation",
      "Segmentation rules",
      "Performance tracking",
    ],
    deliveryEstimate: "1–2 weeks",
    cover: "marketing",
  },
  {
    id: "svc-aut-006",
    slug: "business-workflow-automation",
    name: "Business Workflow Automation",
    group: "automation",
    groupLabel: "Business Automation",
    priceFrom: 75000,
    billingType: "custom",
    billingLabel: "From",
    description:
      "Automate end-to-end business workflows across your tools and teams. Complex projects are quoted individually.",
    whatsIncluded: [
      "Workflow audit & mapping",
      "Automation build & integration",
      "Process documentation",
      "Team handover",
    ],
    deliveryEstimate: "3–6 weeks",
    cover: "technology",
    customQuoteOnly: true,
  },

  // --- Service retainers ---
  {
    id: "svc-rtt-001",
    slug: "website-maintenance",
    name: "Website Maintenance",
    group: "retainer",
    groupLabel: "Service Retainers",
    priceFrom: 15000,
    billingType: "monthly",
    billingLabel: "From / month",
    description:
      "Keep your website secure, updated and running smoothly with ongoing maintenance and support.",
    whatsIncluded: [
      "Security & updates monitoring",
      "Content updates",
      "Performance checks",
      "Priority support",
    ],
    deliveryEstimate: "Ongoing (monthly)",
    cover: "technology",
  },
  {
    id: "svc-rtt-002",
    slug: "seo-maintenance",
    name: "SEO Maintenance",
    group: "retainer",
    groupLabel: "Service Retainers",
    priceFrom: 30000,
    billingType: "monthly",
    billingLabel: "From / month",
    description:
      "Ongoing SEO maintenance to protect and grow your search rankings over time.",
    whatsIncluded: [
      "Ranking monitoring",
      "Content & technical updates",
      "Monthly SEO report",
      "Keyword refinement",
    ],
    deliveryEstimate: "Ongoing (monthly)",
    cover: "data",
  },
];

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export const STORE_SUBSCRIPTIONS: StoreSubscription[] = [
  {
    id: "sub-rp-monthly",
    code: "resource_pass_monthly",
    name: "FRAN-X Resource Pass — Monthly",
    type: "resource_pass",
    monthlyPrice: 7500,
    annualPrice: 0,
    currency: "NGN",
    benefits: [
      "Access to a rotating library of premium business templates",
      "Access to selected business e-books",
      "Access to selected financial guides",
      "15% discount on individual digital products",
      "10% discount on FRAN-X digital services",
      "Access to new premium resources released during the subscription",
      "Premium business resource collection",
    ],
    badge: "Monthly",
  },
  {
    id: "sub-rp-annual",
    code: "resource_pass_annual",
    name: "FRAN-X Resource Pass — Annual",
    type: "resource_pass",
    monthlyPrice: 0,
    annualPrice: 75000,
    currency: "NGN",
    benefits: [
      "All Monthly Resource Pass benefits",
      "Approximately two months equivalent savings vs monthly billing",
    ],
    featured: true,
    badge: "Best value",
  },
  // --- FRIX AI subscriptions ---
  {
    id: "sub-frix-basic",
    code: "frix_ai_basic",
    name: "FRIX AI Basic",
    type: "frix_ai",
    monthlyPrice: 5000,
    annualPrice: 0,
    currency: "NGN",
    benefits: [
      "Up to 500 FRIX AI conversations per month",
      "Business information & recommendations",
      "Basic business assessments",
      "Standard response speed",
    ],
    usageLimit: 500,
    badge: "Basic",
  },
  {
    id: "sub-frix-pro",
    code: "frix_ai_pro",
    name: "FRIX AI Pro",
    type: "frix_ai",
    monthlyPrice: 10000,
    annualPrice: 0,
    currency: "NGN",
    benefits: [
      "Up to 2,000 FRIX AI conversations per month",
      "Everything in Basic",
      "Priority response speed",
      "Advanced business assessments",
      "Lead capture & escalation",
    ],
    usageLimit: 2000,
    featured: true,
    badge: "Pro",
  },
  {
    id: "sub-frix-business",
    code: "frix_ai_business",
    name: "FRIX AI Business",
    type: "frix_ai",
    monthlyPrice: 20000,
    annualPrice: 0,
    currency: "NGN",
    benefits: [
      "Up to 5,000 FRIX AI conversations per month",
      "Everything in Pro",
      "Dedicated AI configuration",
      "Custom knowledge base support",
      "Priority human handoff",
    ],
    usageLimit: 5000,
    badge: "Business",
  },
];

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export function getPublishedProducts(category?: StoreCategoryId): DigitalProduct[] {
  return DIGITAL_PRODUCTS.filter(
    (p) => p.published && (!category || p.category === category),
  );
}

export function getProductBySlug(slug: string): DigitalProduct | undefined {
  return DIGITAL_PRODUCTS.find((p) => p.slug === slug && p.published);
}

export function getFeaturedProducts(n = 6): DigitalProduct[] {
  return DIGITAL_PRODUCTS.filter((p) => p.published && p.featured).slice(0, n);
}

export function getRelatedProducts(product: DigitalProduct, n = 4): DigitalProduct[] {
  const explicit = (product.relatedSlugs ?? [])
    .map((s) => getProductBySlug(s))
    .filter((p): p is DigitalProduct => Boolean(p) && p.slug !== product.slug);
  if (explicit.length >= n) return explicit.slice(0, n);
  const sameCat = DIGITAL_PRODUCTS.filter(
    (p) =>
      p.published &&
      p.slug !== product.slug &&
      p.category === product.category &&
      !explicit.some((e) => e.slug === p.slug),
  );
  const other = DIGITAL_PRODUCTS.filter(
    (p) =>
      p.published &&
      p.slug !== product.slug &&
      p.category !== product.category &&
      !explicit.some((e) => e.slug === p.slug),
  );
  return [...explicit, ...sameCat, ...other].slice(0, n);
}

export function getServiceBySlug(slug: string): DigitalService | undefined {
  return DIGITAL_SERVICES.find((s) => s.slug === slug);
}

export function getServicesByGroup(group: ServiceGroup): DigitalService[] {
  return DIGITAL_SERVICES.filter((s) => s.group === group);
}

export function getServiceGroups(): { group: ServiceGroup; label: string; services: DigitalService[] }[] {
  const order: ServiceGroup[] = ["website", "marketing", "branding", "automation", "retainer"];
  return order
    .map((g) => {
      const services = getServicesByGroup(g);
      return { group: g, label: services[0]?.groupLabel ?? g, services };
    })
    .filter((g) => g.services.length > 0);
}

export function getSubscriptionsByType(type: StoreSubscription["type"]): StoreSubscription[] {
  return STORE_SUBSCRIPTIONS.filter((s) => s.type === type);
}

export function getSubscriptionByCode(code: string): StoreSubscription | undefined {
  return STORE_SUBSCRIPTIONS.find((s) => s.code === code);
}

/** Total price of a bundle's constituent products (for savings display). */
export function getBundleOriginalTotal(product: DigitalProduct): number {
  if (!product.bundleSlugs) return product.price;
  return product.bundleSlugs
    .map((s) => getProductBySlug(s))
    .reduce((sum, p) => sum + (p?.price ?? 0), 0);
}

export function formatNaira(amount: number): string {
  return `₦${Number(amount).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export { PHOTOS };
