export const SITE = {
  name: "FRAN-X Technologies",
  tagline: "Technology for the businesses of tomorrow.",
  statement:
    "FRAN-X builds intelligent digital products and technology systems that help businesses operate, grow and compete.",
  founder: "Francis Ejimkeonye",
  email: "franxholdings@gmail.com",
  phoneDisplay: "07063414752",
  phoneTel: "+2347063414752",
  whatsappDisplay: "+234 705 581 9584",
  whatsappNumber: "2347055819584",
  address: "Festac Town, Lagos, Nigeria",
} as const;

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  "Hello FRAN-X, I would like to start a project.",
)}`;

export const MAILTO_URL = `mailto:${SITE.email}`;
export const TEL_URL = `tel:${SITE.phoneTel}`;

/** WhatsApp deep-link prefilled with an inquiry about a specific listing. */
export function listingWhatsAppUrl(title: string) {
  const text = `Hello FRAN-X, I'm interested in "${title}" listed on the FRAN-X Marketplace and would like more details.`;
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/** Email deep-link prefilled with an inquiry about a specific listing. */
export function listingEmailUrl(title: string) {
  const subject = `Inquiry: ${title}`;
  const body = `Hello FRAN-X,\n\nI'm interested in "${title}" listed on the FRAN-X Marketplace and would like more details.\n\nThank you.`;
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const COMPLIANCE_NOTE =
  "Certain services, transactions, and activities may be subject to applicable Nigerian and international laws, licensing requirements, regulatory approvals, due diligence, and/or execution through appropriately licensed partners.";

export const SERVICE_CATEGORIES = [
  "Technology & Digital",
  "AI & Automation",
  "Business & Data",
  "Marketing & Copywriting",
] as const;

/** Legacy conglomerate service categories — kept in the database but hidden
 *  from the public services directory (data preserved, not deleted). */
export const CONGLOMERATE_CATEGORIES = [
  "Real Estate",
  "Automotive",
  "Oil & Gas / Energy",
  "E-commerce",
  "Agriculture",
  "Aviation",
  "Hospitality",
  "Investment & Capital",
  "Creative & Media",
] as const;

export const REQUEST_CATEGORIES = [
  "Website Development",
  "Mobile App Development",
  "AI & Automation",
  "Data & Business Intelligence",
  "Custom Software",
  "API Development",
  "Other",
] as const;

export const OPPORTUNITY_TYPES = [
  "Investment Opportunity",
  "Partnership Opportunity",
  "Acquisition Opportunity",
  "Real Estate Opportunity",
  "Automotive Opportunity",
  "Oil & Gas Opportunity",
  "Technology Opportunity",
  "Supplier Opportunity",
  "Buyer Opportunity",
  "Agriculture Opportunity",
  "Hospitality Opportunity",
  "Aviation Opportunity",
  "Other Commercial Opportunity",
] as const;

export const INQUIRY_STATUSES = [
  "New",
  "Contacted",
  "Consultation",
  "Proposal Sent",
  "In Development",
  "Completed",
  "Cancelled",
] as const;

export function makeReference(prefix = "FX") {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}