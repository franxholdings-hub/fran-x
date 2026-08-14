export const SITE = {
  name: "FRAN-X Holdings",
  tagline: "Building Businesses. Connecting Opportunities. Creating the Future.",
  statement:
    "FRAN-X provides technology, business, consulting, investment, and commercial solutions designed to help individuals and organizations build, operate, connect, and scale.",
  founder: "Francis Ejimkeonye",
  email: "franxholdings@gmail.com",
  phoneDisplay: "08025441050",
  phoneTel: "+2348025441050",
  whatsappDisplay: "+234 705 581 9584",
  whatsappNumber: "2347055819584",
  address: "Festac Town, Lagos, Nigeria",
} as const;

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  "Hello FRAN-X Holdings, I would like to make an inquiry.",
)}`;

export const MAILTO_URL = `mailto:${SITE.email}`;
export const TEL_URL = `tel:${SITE.phoneTel}`;

export const COMPLIANCE_NOTE =
  "Certain services, transactions, and activities may be subject to applicable Nigerian and international laws, licensing requirements, regulatory approvals, due diligence, and/or execution through appropriately licensed partners.";

export const SERVICE_CATEGORIES = [
  "Technology & Digital",
  "AI & Automation",
  "Business & Data",
  "Marketing & Copywriting",
  "Creative & Media",
  "E-commerce",
  "Real Estate",
  "Automotive",
  "Oil & Gas / Energy",
] as const;

export const REQUEST_CATEGORIES = [
  "Website",
  "Mobile App",
  "AI Solution",
  "E-commerce",
  "Business Consulting",
  "Data Analysis",
  "Marketing",
  "Creative Services",
  "Real Estate",
  "Automotive",
  "Oil & Gas",
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
  "Reviewing",
  "Contacted",
  "Proposal Sent",
  "Negotiation",
  "Approved",
  "In Progress",
  "Completed",
  "Declined",
  "Archived",
] as const;

export function makeReference(prefix = "FX") {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}