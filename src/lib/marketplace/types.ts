// FRAN-X Marketplace — domain types.
//
// The Marketplace is a focused high-value asset & business opportunity
// platform. Only the four approved FRAN-X categories are permitted — there
// is intentionally NO generic product/retail taxonomy here.

import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type CategoryId = "automobiles" | "real-estate" | "businesses" | "oil-gas";

export type ListingSource = "franx" | "vendor";

/** Vendor listing lifecycle. The backend approval system is connected later. */
export type ListingStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "published"
  | "closed";

export type SortMode = "newest" | "featured" | "price-low" | "price-high";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  shortLabel: string;
  icon: ComponentType<LucideProps>;
  blurb: string;
  /** Approved sub-types vendors may choose from — no free-form retail categories. */
  subtypes: string[];
}

/** Category-specific specification block. Only the relevant fields are set. */
export interface ListingSpecs {
  // Automobiles
  make?: string;
  model?: string;
  year?: number;
  mileage?: string;
  condition?: string;
  // Real estate
  propertyType?: string;
  size?: string;
  intendedUse?: string;
  // Businesses
  industry?: string;
  businessType?: string;
  // Oil & gas / energy
  opportunityType?: string;
}

export interface MarketplaceListing {
  id: string;
  slug: string;
  title: string;
  category: CategoryId;
  subtype: string;
  location: string;
  /** Display string e.g. "₦185,000,000" or "Price on request" / "Open". */
  price: string;
  /** Numeric value for sorting/filtering, in Naira. 0 means "on request". */
  priceValue: number;
  description: string;
  vendorName: string;
  source: ListingSource;
  verified: boolean;
  featured: boolean;
  dateListed: string; // ISO
  images: string[];
  specs: ListingSpecs;
  /** Only set for vendor-created listings tracked in the local store. */
  status?: ListingStatus;
}

export type ContactMethod = "Email" | "Phone" | "WhatsApp";

export type InquiryStatus = "Pending" | "Under Review" | "Responded" | "Closed";

export interface MarketplaceInquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  contactMethod: ContactMethod;
  status: InquiryStatus;
  createdAt: string; // ISO
}

export interface MarketplaceFilters {
  keyword: string;
  category: CategoryId | "all";
  location: string;
  listingType: ListingSource | "all";
  sort: SortMode;
  priceMin: string;
  priceMax: string;
}
