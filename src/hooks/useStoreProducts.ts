// DB-driven storefront products.
//
// The admin-managed digital_products table is the source of truth for the
// storefront: new products, price edits, notes and uploads made in the
// admin dashboard appear here without code changes. The static catalog in
// digital-store/catalog.ts stays as the fallback (and covers products the
// DB does not know about) so the store renders even before the migration
// is applied or while the DB is unreachable.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DIGITAL_PRODUCTS,
  STORE_CATEGORY_MAP,
  type DigitalProduct,
  type StoreCategoryId,
} from "@/lib/digital-store/catalog";
import type { PhotoKey } from "@/lib/photos";
import { PHOTOS } from "@/lib/photos";

export type StoreProduct = DigitalProduct & {
  /** Admin-editable notes / instructions for the customer. */
  notes?: string;
  /** Signed-URL-backed cover image (uploaded in the admin dashboard). */
  coverUrl?: string;
};

type DbProduct = {
  slug: string;
  name: string;
  category: string;
  price: number | string;
  currency: string;
  description: string | null;
  whats_included: string[] | string;
  file_format: string | null;
  cover: string | null;
  featured: boolean;
  is_bundle: boolean;
  bundle_slugs: string[] | string;
  related_slugs: string[] | string;
  has_file: boolean;
  disclaimer: string | null;
  notes: string | null;
};

function parseList(v: string[] | string | null | undefined): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string" || !v.trim()) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return v.split("\n").map((s) => s.trim()).filter(Boolean);
  }
}

function mapRow(row: DbProduct, coverFiles: { id: string; product_slug: string }[]): StoreProduct {
  const category = STORE_CATEGORY_MAP[row.category as StoreCategoryId]
    ? (row.category as StoreCategoryId)
    : "templates";
  const cover = PHOTOS[row.cover as PhotoKey]
    ? (row.cover as PhotoKey)
    : ("data" as PhotoKey);
  const coverFile = coverFiles.find((f) => f.product_slug === row.slug);
  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    category,
    price: Number(row.price) || 0,
    currency: row.currency || "NGN",
    description: row.description ?? "",
    whatsIncluded: parseList(row.whats_included),
    fileFormat: row.file_format || "PDF",
    cover,
    featured: row.featured,
    bundle: row.is_bundle,
    bundleSlugs: parseList(row.bundle_slugs),
    hasFile: row.has_file,
    published: true,
    relatedSlugs: parseList(row.related_slugs),
    disclaimer: row.disclaimer ?? undefined,
    notes: row.notes ?? undefined,
    coverUrl: coverFile
      ? `/api/store/download?slug=${encodeURIComponent(row.slug)}&file=${coverFile.id}&direct=1`
      : undefined,
  };
}

const DB_SELECT =
  "slug,name,category,price,currency,description,whats_included,file_format,cover,featured,is_bundle,bundle_slugs,related_slugs,has_file,disclaimer,notes";

export function useStoreProducts() {
  return useQuery({
    queryKey: ["store-products"],
    staleTime: 60_000,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_products")
        .select(DB_SELECT)
        .eq("is_published", true)
        .eq("is_archived", false)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as unknown as DbProduct[];
      if (rows.length === 0) return { products: DIGITAL_PRODUCTS, source: "static" as const };

      // Uploaded cover images (publicly readable, kind = 'cover').
      let coverFiles: { id: string; product_slug: string }[] = [];
      try {
        const { data: covers } = await supabase
          .from("digital_product_files")
          .select("id,product_slug")
          .eq("kind", "cover");
        coverFiles = (covers ?? []) as unknown as { id: string; product_slug: string }[];
      } catch {
        /* covers are optional */
      }

      const products = rows.map((r) => mapRow(r, coverFiles));
      // Static-only products (DB row never created) keep rendering.
      const dbSlugs = new Set(products.map((p) => p.slug));
      const extras = DIGITAL_PRODUCTS.filter(
        (p) => p.published && !dbSlugs.has(p.slug),
      ) as StoreProduct[];
      return { products: [...extras, ...products], source: "db" as const };
    },
  });
}
