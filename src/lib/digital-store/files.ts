// Digital product files — client helpers.
//
// - useProductFiles(slug): lists a product's files. RLS returns preview +
//   cover files to everyone and paid files only to customers who own the
//   product (see the product_files migration).
// - useProductAccess(slug): does the signed-in user own this product?
// - downloadProductFile / openProductFile: fetch a short-lived signed URL
//   from the secure download API (Bearer-authenticated) and hand it to the
//   browser. No file is ever served from a public URL.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ProductFileKind = "product" | "preview" | "cover";

export type ProductFile = {
  id: string;
  product_slug: string;
  kind: ProductFileKind;
  file_name: string;
  mime_type: string;
  file_size: number;
  version: number;
  created_at: string;
};

const FILE_SELECT =
  "id,product_slug,kind,file_name,mime_type,file_size,version,created_at";

export function useProductFiles(slug?: string) {
  return useQuery({
    queryKey: ["product-files", slug],
    enabled: !!slug,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_product_files")
        .select(FILE_SELECT)
        .eq("product_slug", slug!);
      if (error) throw error;
      return (data ?? []) as unknown as ProductFile[];
    },
  });
}

export function useProductAccess(slug?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["product-access", user?.id, slug],
    enabled: !!user && !!slug,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_library")
        .select("id,expires_at,is_active")
        .eq("user_id", user!.id)
        .eq("product_slug", slug!);
      if (error) throw error;
      const rows = (data ?? []) as { expires_at: string | null; is_active: boolean }[];
      return rows.some((r) => r.is_active && (!r.expires_at || new Date(r.expires_at) > new Date()));
    },
  });
}

async function sessionToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

async function fetchSignedFile(slug: string, fileId: string, opts?: { inline?: boolean }) {
  const token = await sessionToken();
  const qs = new URLSearchParams({ slug, file: fileId });
  if (opts?.inline) qs.set("inline", "1");
  const res = await fetch(`/api/store/download?${qs.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Could not access this file.");
  return json as { url: string; file_name: string; mime_type?: string };
}

/** Trigger a browser download of a purchased file. */
export async function downloadProductFile(slug: string, fileId: string) {
  const { url, file_name } = await fetchSignedFile(slug, fileId);
  const a = document.createElement("a");
  a.href = url;
  a.download = file_name; // the signed URL also carries attachment disposition
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Open a file in a new tab (e.g. "Read/View" for PDFs). */
export async function openProductFile(slug: string, fileId: string) {
  const { url } = await fetchSignedFile(slug, fileId, { inline: true });
  window.open(url, "_blank", "noopener");
}

/** Small helper for "Download All Files" — browsers need a beat between downloads. */
export async function downloadAllProductFiles(slug: string, fileIds: string[]) {
  for (const id of fileIds) {
    await downloadProductFile(slug, id);
    await new Promise((r) => setTimeout(r, 400));
  }
}

export function fileExt(name: string): string {
  return (name.split(".").pop() ?? "").toUpperCase() || "FILE";
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
