// FRAN-X Marketplace — approved categories, mock catalog and query helpers.
//
// This module is the single source of truth for the Marketplace catalog.
// It is intentionally structured so the mock data can later be swapped for a
// Supabase table without touching the UI: components consume the helper
// functions below, never the raw array.

import { Car, Home, Building2, Fuel } from "lucide-react";
import { PHOTOS } from "@/lib/photos";
import type {
  CategoryDef,
  CategoryId,
  MarketplaceFilters,
  MarketplaceListing,
  SortMode,
} from "./types";

export const CATEGORIES: CategoryDef[] = [
  {
    id: "automobiles",
    label: "Automobiles",
    shortLabel: "Automobiles",
    icon: Car,
    blurb: "Cars, SUVs, trucks, commercial and fleet vehicles.",
    subtypes: [
      "Cars",
      "SUVs",
      "Trucks",
      "Commercial vehicles",
      "Fleet vehicles",
      "Other approved automotive assets",
    ],
  },
  {
    id: "real-estate",
    label: "Land & Real Estate",
    shortLabel: "Real Estate",
    icon: Home,
    blurb: "Plots of land, houses, apartments and commercial properties.",
    subtypes: [
      "Plots of land",
      "Houses",
      "Apartments",
      "Commercial properties",
      "Commercial buildings",
      "Property developments",
      "Other approved real-estate assets",
    ],
  },
  {
    id: "businesses",
    label: "Businesses & Commercial Opportunities",
    shortLabel: "Businesses",
    icon: Building2,
    blurb: "Businesses for sale, partnerships and commercial opportunities.",
    subtypes: [
      "Businesses for sale",
      "Business partnerships",
      "Commercial opportunities",
      "Approved business projects",
      "Companies seeking strategic partners",
    ],
  },
  {
    id: "oil-gas",
    label: "Oil & Gas / Energy",
    shortLabel: "Oil & Gas",
    icon: Fuel,
    blurb: "Approved oil & gas opportunities, energy projects and assets.",
    subtypes: [
      "Approved oil & gas opportunities",
      "Energy projects",
      "Oil & gas assets",
      "Energy-related commercial opportunities",
      "Strategic partnerships",
    ],
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryDef>;

export const ALL_SUBTYPES: { category: CategoryId; subtype: string }[] = CATEGORIES.flatMap((c) =>
  c.subtypes.map((s) => ({ category: c.id, subtype: s })),
);

const img = {
  auto: PHOTOS.automotive.src,
  real: PHOTOS.realEstate.src,
  biz: PHOTOS.opportunities.src,
  capital: PHOTOS.capital.src,
  energy: PHOTOS.energy.src,
  hospitality: PHOTOS.hospitality.src,
};

// --- Mock catalog -----------------------------------------------------------
// A mix of FRAN-X listings and approved third-party vendor listings. Prices
// are in Naira. `priceValue: 0` means "price on request".

const MOCK: MarketplaceListing[] = [
  {
    id: "fx-001",
    slug: "tokunbo-toyota-camry-2019-xle",
    title: "Tokunbo Toyota Camry 2019 — XLE",
    category: "automobiles",
    subtype: "Cars",
    location: "Lagos, Nigeria",
    price: "₦9,500,000",
    priceValue: 9_500_000,
    description:
      "Foreign-used Toyota Camry XLE, full option, factory-fitted. Clean interior, smooth transmission, ice-cold A/C. Recently inspected and FRAN-X verified.",
    vendorName: "FRAN-X Auto",
    source: "franx",
    verified: true,
    featured: true,
    dateListed: "2026-08-22T10:00:00Z",
    images: [img.auto, img.capital],
    specs: { make: "Toyota", model: "Camry XLE", year: 2019, mileage: "48,200 km", condition: "Foreign used" },
  },
  {
    id: "fx-002",
    slug: "lekki-phase-1-4-bedroom-duplex",
    title: "Lekki Phase 1 — 4 Bedroom Duplex",
    category: "real-estate",
    subtype: "Houses",
    location: "Lekki, Lagos, Nigeria",
    price: "₦185,000,000",
    priceValue: 185_000_000,
    description:
      "Newly built 4-bedroom duplex with 2 BQ, ample parking and a paved compound. Located in a serene, secure estate in Lekki Phase 1.",
    vendorName: "FRAN-X Realty",
    source: "franx",
    verified: true,
    featured: true,
    dateListed: "2026-08-20T10:00:00Z",
    images: [img.real, img.hospitality],
    specs: { propertyType: "Duplex", size: "650 sqm", intendedUse: "Residential" },
  },
  {
    id: "fx-003",
    slug: "diesel-supply-10000-litres",
    title: "Diesel Supply — 10,000 Litres",
    category: "oil-gas",
    subtype: "Energy-related commercial opportunities",
    location: "Port Harcourt, Nigeria",
    price: "Quote on request",
    priceValue: 0,
    description:
      "AGO (diesel) supply of 10,000 litres to industrial buyers. Quality-assured, with delivery coordination. Buyer–seller matching facilitated by FRAN-X.",
    vendorName: "FRAN-X Oil & Gas",
    source: "franx",
    verified: true,
    featured: true,
    dateListed: "2026-08-18T10:00:00Z",
    images: [img.energy],
    specs: { opportunityType: "Energy supply" },
  },
  {
    id: "fx-004",
    slug: "logistics-partnership-lagos-axis",
    title: "Logistics Partnership — Lagos Axis",
    category: "businesses",
    subtype: "Business partnerships",
    location: "Lagos, Nigeria",
    price: "Open",
    priceValue: 0,
    description:
      "Strategic partnership opportunity for a logistics operator covering the Lagos commercial axis. Fleet and route network available; seeking a growth partner.",
    vendorName: "FRAN-X Holdings",
    source: "franx",
    verified: true,
    featured: false,
    dateListed: "2026-08-15T10:00:00Z",
    images: [img.biz, img.capital],
    specs: { industry: "Logistics", businessType: "Partnership" },
  },
  {
    id: "fx-005",
    slug: "honda-civic-2020-foreign-used",
    title: "Honda Civic 2020 (Foreign Used)",
    category: "automobiles",
    subtype: "Cars",
    location: "Abuja, Nigeria",
    price: "₦11,200,000",
    priceValue: 11_200_000,
    description:
      "Clean foreign-used Honda Civic 2020, low mileage, factory-fitted. FRAN-X inspected and verified. Ready for inspection and delivery.",
    vendorName: "Apex Motors",
    source: "vendor",
    verified: true,
    featured: false,
    dateListed: "2026-08-14T10:00:00Z",
    images: [img.auto],
    specs: { make: "Honda", model: "Civic", year: 2020, mileage: "32,500 km", condition: "Foreign used" },
  },
  {
    id: "fx-006",
    slug: "yaba-3-bedroom-flat-off-plan",
    title: "Yaba — 3 Bedroom Flat (Off-Plan)",
    category: "real-estate",
    subtype: "Apartments",
    location: "Yaba, Lagos, Nigeria",
    price: "₦62,000,000",
    priceValue: 62_000_000,
    description:
      "Off-plan 3-bedroom flat in a forthcoming development in Yaba. Modern finishes, secure estate, payment plan available. FRAN-X verified developer.",
    vendorName: "Creststone Developments",
    source: "vendor",
    verified: true,
    featured: false,
    dateListed: "2026-08-12T10:00:00Z",
    images: [img.real],
    specs: { propertyType: "Flat", size: "140 sqm", intendedUse: "Residential" },
  },
  {
    id: "fx-007",
    slug: "agri-tech-startup-seed-round",
    title: "Investment: Agri-Tech Startup (Seed)",
    category: "businesses",
    subtype: "Commercial opportunities",
    location: "Ibadan, Nigeria",
    price: "Open",
    priceValue: 0,
    description:
      "Seed investment opportunity in a verified agri-tech platform connecting smallholder farmers to off-takers. Seeking strategic capital partner.",
    vendorName: "FRAN-X Capital",
    source: "franx",
    verified: true,
    featured: true,
    dateListed: "2026-08-10T10:00:00Z",
    images: [img.biz, img.capital],
    specs: { industry: "Agriculture / Technology", businessType: "Investment" },
  },
  {
    id: "fx-008",
    slug: "commercial-building-ikoyi",
    title: "Commercial Building — Ikoyi",
    category: "real-estate",
    subtype: "Commercial buildings",
    location: "Ikoyi, Lagos, Nigeria",
    price: "₦1,250,000,000",
    priceValue: 1_250_000_000,
    description:
      "Grade-A commercial building on a prime Ikoyi corridor. Lettable floors, ample parking, strong rental yield. FRAN-X verified title.",
    vendorName: "FRAN-X Realty",
    source: "franx",
    verified: true,
    featured: false,
    dateListed: "2026-08-08T10:00:00Z",
    images: [img.real, img.capital],
    specs: { propertyType: "Commercial building", size: "1,800 sqm", intendedUse: "Commercial" },
  },
  {
    id: "fx-009",
    slug: "mercedes-actros-fleet-5-units",
    title: "Mercedes Actros Fleet — 5 Units",
    category: "automobiles",
    subtype: "Fleet vehicles",
    location: "Kano, Nigeria",
    price: "₦280,000,000",
    priceValue: 280_000_000,
    description:
      "Fleet of 5 Mercedes Actros trucks, well-maintained and currently operational. Full service history available. FRAN-X verified.",
    vendorName: "Northern Haulage Ltd",
    source: "vendor",
    verified: true,
    featured: false,
    dateListed: "2026-08-06T10:00:00Z",
    images: [img.auto],
    specs: { make: "Mercedes", model: "Actros", year: 2021, mileage: "—", condition: "Used" },
  },
  {
    id: "fx-010",
    slug: "land-bank-epe-5-acres",
    title: "Land Bank — Epe, 5 Acres",
    category: "real-estate",
    subtype: "Plots of land",
    location: "Epe, Lagos, Nigeria",
    price: "₦45,000,000",
    priceValue: 45_000_000,
    description:
      "5 acres of dry, titled land in a fast-appreciating Epe corridor. Suitable for residential or mixed-use development. FRAN-X verified survey.",
    vendorName: "FRAN-X Realty",
    source: "franx",
    verified: true,
    featured: false,
    dateListed: "2026-08-04T10:00:00Z",
    images: [img.real],
    specs: { propertyType: "Land", size: "5 acres", intendedUse: "Mixed-use" },
  },
  {
    id: "fx-011",
    slug: "lpfo-supply-off-taker",
    title: "LPFO Supply — Off-Taker Required",
    category: "oil-gas",
    subtype: "Approved oil & gas opportunities",
    location: "Warri, Nigeria",
    price: "Quote on request",
    priceValue: 0,
    description:
      "Low Pour Fuel Oil (LPFO) supply opportunity requiring a credible off-taker. FRAN-X facilitates buyer–seller matching and due diligence.",
    vendorName: "Delta Energy Partners",
    source: "vendor",
    verified: true,
    featured: false,
    dateListed: "2026-08-02T10:00:00Z",
    images: [img.energy],
    specs: { opportunityType: "Product off-take" },
  },
  {
    id: "fx-012",
    slug: "fmcg-distribution-business-sale",
    title: "FMCG Distribution Business for Sale",
    category: "businesses",
    subtype: "Businesses for sale",
    location: "Onitsha, Nigeria",
    price: "₦120,000,000",
    priceValue: 120_000_000,
    description:
      "Profitable FMCG distribution business with established retailer network and supply contracts. Asking price includes inventory and vehicles.",
    vendorName: "Onitsha Trade Group",
    source: "vendor",
    verified: true,
    featured: false,
    dateListed: "2026-07-28T10:00:00Z",
    images: [img.biz, img.capital],
    specs: { industry: "FMCG / Distribution", businessType: "Business for sale" },
  },
];

// --- Query helpers ----------------------------------------------------------

function dateScore(a: MarketplaceListing, b: MarketplaceListing) {
  return new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime();
}

function priceScore(a: MarketplaceListing, b: MarketplaceListing, dir: "asc" | "desc") {
  const av = a.priceValue || Number.MAX_SAFE_INTEGER;
  const bv = b.priceValue || Number.MAX_SAFE_INTEGER;
  return dir === "asc" ? av - bv : bv - av;
}

export function applyFilters(
  listings: MarketplaceListing[],
  f: MarketplaceFilters,
): MarketplaceListing[] {
  const kw = f.keyword.trim().toLowerCase();
  const loc = f.location.trim().toLowerCase();
  const min = f.priceMin ? Number(f.priceMin) : 0;
  const max = f.priceMax ? Number(f.priceMax) : Infinity;

  let out = listings.filter((l) => {
    if (f.category !== "all" && l.category !== f.category) return false;
    if (f.listingType !== "all" && l.source !== f.listingType) return false;
    if (loc && !l.location.toLowerCase().includes(loc)) return false;
    if (kw) {
      const hay = `${l.title} ${l.subtype} ${l.description} ${l.vendorName} ${l.location}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    if (l.priceValue > 0) {
      if (l.priceValue < min || l.priceValue > max) return false;
    }
    return true;
  });

  switch (f.sort) {
    case "featured":
      out = [...out].sort((a, b) => Number(b.featured) - Number(a.featured) || dateScore(a, b));
      break;
    case "price-low":
      out = [...out].sort((a, b) => priceScore(a, b, "asc"));
      break;
    case "price-high":
      out = [...out].sort((a, b) => priceScore(a, b, "desc"));
      break;
    case "newest":
    default:
      out = [...out].sort(dateScore);
      break;
  }
  return out;
}

export function getFeatured(listings: MarketplaceListing[]) {
  return listings.filter((l) => l.featured);
}

export function getLatest(listings: MarketplaceListing[], n = 6) {
  return [...listings].sort(dateScore).slice(0, n);
}

/** Naive category/location-based recommendation. Structured so FRIX AI can
 *  later provide intelligent recommendations in place of this logic. */
export function getRecommended(
  listings: MarketplaceListing[],
  opts: { category?: CategoryId; location?: string; excludeId?: string } = {},
  n = 3,
): MarketplaceListing[] {
  const { category, location, excludeId } = opts;
  const scored = listings
    .filter((l) => l.id !== excludeId)
    .map((l) => {
      let score = 0;
      if (category && l.category === category) score += 2;
      if (location && l.location.toLowerCase().includes(location.toLowerCase())) score += 1;
      if (l.featured) score += 1;
      return { l, score };
    })
    .sort((a, b) => b.score - a.score || dateScore(a.l, b.l));
  return scored.slice(0, n).map((s) => s.l);
}

export function getRelated(listing: MarketplaceListing, listings: MarketplaceListing[], n = 3) {
  return getRecommended(listings, { category: listing.category, excludeId: listing.id }, n);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function emptyFilters(): MarketplaceFilters {
  return {
    keyword: "",
    category: "all",
    location: "",
    listingType: "all",
    sort: "newest" as SortMode,
    priceMin: "",
    priceMax: "",
  };
}

export { MOCK as MOCK_LISTINGS };
