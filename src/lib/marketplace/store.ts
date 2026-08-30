// FRAN-X Marketplace — client-side store.
//
// Favorites, recently-viewed listings, marketplace inquiries and
// vendor-created listings are persisted in localStorage until the backend
// CRM / vendor-management / admin-approval systems are connected. The hook
// signatures below are designed to map cleanly onto Supabase tables later.

import { useCallback, useEffect, useState } from "react";
import { MOCK_LISTINGS, slugify } from "./catalog";
import type {
  MarketplaceInquiry,
  MarketplaceListing,
  InquiryStatus,
  ListingStatus,
} from "./types";

const KEYS = {
  favorites: "franx.marketplace.favorites",
  recent: "franx.marketplace.recent",
  inquiries: "franx.marketplace.inquiries",
  vendor: "franx.marketplace.vendorListings",
} as const;

const SYNC_EVENT = "franx:marketplace:sync";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key } }));
}

// Re-render every hook that cares about this store when any key changes.
function useSynced<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string } | undefined;
      if (!detail || detail.key === key) setValue(read(key, fallback));
    };
    window.addEventListener(SYNC_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SYNC_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
}

// --- Favorites --------------------------------------------------------------

export function useFavorites() {
  const ids = useSynced<string[]>(KEYS.favorites, []);
  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    const current = read<string[]>(KEYS.favorites, []);
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    write(KEYS.favorites, next);
  }, []);
  return { ids, isSaved, toggle };
}

// --- Recently viewed --------------------------------------------------------

export function useRecentlyViewed() {
  const ids = useSynced<string[]>(KEYS.recent, []);
  const markViewed = useCallback((id: string) => {
    const current = read<string[]>(KEYS.recent, []);
    const next = [id, ...current.filter((x) => x !== id)].slice(0, 8);
    write(KEYS.recent, next);
  }, []);
  return { ids, markViewed };
}

// --- Marketplace inquiries --------------------------------------------------

export function useMarketplaceInquiries() {
  const inquiries = useSynced<MarketplaceInquiry[]>(KEYS.inquiries, []);

  const addInquiry = useCallback(
    (input: Omit<MarketplaceInquiry, "id" | "status" | "createdAt">) => {
      const inquiry: MarketplaceInquiry = {
        ...input,
        id: `MI-${Date.now().toString(36).toUpperCase()}`,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };
      const current = read<MarketplaceInquiry[]>(KEYS.inquiries, []);
      write(KEYS.inquiries, [inquiry, ...current]);
      return inquiry;
    },
    [],
  );

  const setInquiryStatus = useCallback((id: string, status: InquiryStatus) => {
    const current = read<MarketplaceInquiry[]>(KEYS.inquiries, []);
    write(
      KEYS.inquiries,
      current.map((i) => (i.id === id ? { ...i, status } : i)),
    );
  }, []);

  return { inquiries, addInquiry, setInquiryStatus };
}

// --- Vendor listings --------------------------------------------------------

export type VendorDraft = Omit<MarketplaceListing, "id" | "slug" | "source" | "dateListed" | "status">;

export function useVendorListings() {
  const listings = useSynced<MarketplaceListing[]>(KEYS.vendor, []);

  const createListing = useCallback((draft: VendorDraft): MarketplaceListing => {
    const listing: MarketplaceListing = {
      ...draft,
      id: `VL-${Date.now().toString(36).toUpperCase()}`,
      slug: slugify(draft.title) || `listing-${Date.now()}`,
      source: "vendor",
      dateListed: new Date().toISOString(),
      status: "draft",
    };
    const current = read<MarketplaceListing[]>(KEYS.vendor, []);
    write(KEYS.vendor, [listing, ...current]);
    return listing;
  }, []);

  const updateListing = useCallback((id: string, patch: Partial<MarketplaceListing>) => {
    const current = read<MarketplaceListing[]>(KEYS.vendor, []);
    write(
      KEYS.vendor,
      current.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  }, []);

  const setStatus = useCallback((id: string, status: ListingStatus) => {
    const current = read<MarketplaceListing[]>(KEYS.vendor, []);
    write(
      KEYS.vendor,
      current.map((l) => (l.id === id ? { ...l, status } : l)),
    );
  }, []);

  const removeListing = useCallback((id: string) => {
    const current = read<MarketplaceListing[]>(KEYS.vendor, []);
    write(KEYS.vendor, current.filter((l) => l.id !== id));
  }, []);

  return { listings, createListing, updateListing, setStatus, removeListing };
}

/**
 * The full browsable catalog: FRAN-X mock listings plus any vendor listings
 * that have reached `published` status. Vendor drafts/pending/rejected are
 * excluded from the public Marketplace.
 */
export function useCatalog(): MarketplaceListing[] {
  const vendor = useVendorListings();
  const publishedVendor = vendor.listings.filter((l) => l.status === "published");
  return [...publishedVendor, ...MOCK_LISTINGS];
}
