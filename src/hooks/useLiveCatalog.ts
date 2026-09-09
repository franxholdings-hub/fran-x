// Live catalog overrides — merges admin-managed values from the database over
// the static store catalog so any admin edit (price, name, description,
// what's included, availability) reflects on the public website immediately.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DigitalProduct } from "@/lib/digital-store/catalog";

type Row = {
  slug: string;
  name: string;
  price: number;
  description: string;
  whats_included: string[] | string | null;
  file_format: string | null;
  has_file: boolean | null;
  is_published: boolean | null;
  is_archived: boolean | null;
};

function toList(v: Row["whats_included"]): string[] | null {
  if (!v) return null;
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v) as string[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function useLiveProducts() {
  const query = useQuery({
    queryKey: ["live-digital-products"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_products")
        .select("slug, name, price, description, whats_included, file_format, has_file, is_published, is_archived");
      if (error) throw error;
      const map = new Map<string, Row>();
      for (const row of (data ?? []) as unknown as Row[]) map.set(row.slug, row);
      return map;
    },
  });

  const merge = (product: DigitalProduct): DigitalProduct => {
    const row = query.data?.get(product.slug);
    if (!row) return product;
    const included = toList(row.whats_included);
    return {
      ...product,
      name: row.name || product.name,
      price: Number(row.price ?? product.price),
      description: row.description || product.description,
      ...(included && included.length ? { whatsIncluded: included } : {}),
      fileFormat: row.file_format || product.fileFormat,
      hasFile: row.has_file ?? product.hasFile,
      published: (row.is_published ?? product.published) && !row.is_archived,
    };
  };

  return { merge, isLoading: query.isLoading };
}
