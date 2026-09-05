// Admin: per-product file management.
//
// Lets the admin upload / replace / delete the actual downloadable files
// (PDF e-books, DOCX/XLSX/PPTX templates, ZIP packs), add a free preview
// sample, upload a cover image and edit the product notes / instructions.
// Files go to the PRIVATE product-files bucket — customers receive signed
// URLs through the secure download API after a verified purchase.

import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Eye, FileUp, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loading } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { downloadProductFile, fileExt, formatFileSize, openProductFile, type ProductFile } from "@/lib/digital-store/files";

export type FilesProduct = {
  id: string;
  slug: string;
  name: string;
  notes: string | null;
};

const FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,image/*";
const KIND_LABEL: Record<string, string> = {
  product: "Paid file",
  preview: "Preview / sample",
  cover: "Cover image",
};

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(-120);
}

function storagePath(slug: string, kind: string, name: string) {
  return `${slug}/${kind}/${Date.now()}-${safeName(name)}`;
}

async function syncHasFile(slug: string, productFiles: ProductFile[]) {
  // has_file mirrors "does this product have at least one paid file?" so the
  // existing admin table and product page badges stay truthful.
  const has = productFiles.some((f) => f.kind === "product");
  await supabase.from("digital_products").update({ has_file: has } as never).eq("slug", slug);
}

export function ProductFilesDialog({ product, onClose }: {
  product: FilesProduct;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(product.notes ?? "");
  const [notesDirty, setNotesDirty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingKind = useRef<"product" | "preview" | "cover">("product");
  const replaceTarget = useRef<ProductFile | null>(null);

  const files = useQuery({
    queryKey: ["admin-product-files", product.slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_product_files")
        .select("*")
        .eq("product_slug", product.slug)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProductFile[];
    },
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin-product-files", product.slug] });
    void qc.invalidateQueries({ queryKey: ["admin-digital-products"] });
    void qc.invalidateQueries({ queryKey: ["store-products"] });
  };

  const upload = useMutation({
    mutationFn: async ({ kind, file }: { kind: "product" | "preview" | "cover"; file: File }) => {
      const path = storagePath(product.slug, kind, file.name);
      const { error: upErr } = await supabase.storage
        .from("product-files")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("digital_product_files").insert({
        product_slug: product.slug,
        kind,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type || "",
        file_size: file.size,
      } as never);
      if (insErr) {
        await supabase.storage.from("product-files").remove([path]);
        throw insErr;
      }
      if (kind === "cover") {
        await supabase.from("digital_products").update({ cover: path } as never).eq("slug", product.slug);
      }
      const list = (await qc.fetchQuery({
        queryKey: ["admin-product-files", product.slug],
        queryFn: files.queryFn,
      })) as ProductFile[];
      await syncHasFile(product.slug, list);
    },
    onSuccess: (_d, { kind }) => {
      toast.success(`${KIND_LABEL[kind]} uploaded`);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function getStoragePath(id: string): Promise<string> {
    const { data } = await supabase
      .from("digital_product_files")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    return (data?.storage_path as string) ?? "";
  }

  const replace = useMutation({
    mutationFn: async ({ row, file }: { row: ProductFile; file: File }) => {
      const oldPath = await getStoragePath(row.id);
      const path = storagePath(product.slug, row.kind, file.name);
      const { error: upErr } = await supabase.storage
        .from("product-files")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;
      const { error: updErr } = await supabase
        .from("digital_product_files")
        .update({
          file_name: file.name,
          storage_path: path,
          mime_type: file.type || "",
          file_size: file.size,
          version: row.version + 1,
        } as never)
        .eq("id", row.id);
      if (updErr) {
        await supabase.storage.from("product-files").remove([path]);
        throw updErr;
      }
      if (oldPath && oldPath !== path) {
        await supabase.storage.from("product-files").remove([oldPath]);
      }
    },
    onSuccess: () => {
      toast.success("File replaced");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: ProductFile) => {
      const path = await getStoragePath(row.id);
      const { error: delErr } = await supabase
        .from("digital_product_files")
        .delete()
        .eq("id", row.id);
      if (delErr) throw delErr;
      if (path) await supabase.storage.from("product-files").remove([path]);
      if (row.kind === "cover") {
        await supabase.from("digital_products").update({ cover: null } as never).eq("slug", product.slug);
      }
      const remaining = (files.data ?? []).filter((f) => f.id !== row.id);
      await syncHasFile(product.slug, remaining);
    },
    onSuccess: () => {
      toast.success("File deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveNotes = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("digital_products")
        .update({ notes: notes.trim() || null } as never)
        .eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notes saved");
      setNotesDirty(false);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const target = replaceTarget.current;
    if (target) {
      replaceTarget.current = null;
      replace.mutate({ row: target, file });
    } else {
      upload.mutate({ kind: pendingKind.current, file });
    }
  };

  const pickFor = (kind: "product" | "preview" | "cover", row?: ProductFile) => {
    pendingKind.current = kind;
    replaceTarget.current = row ?? null;
    inputRef.current?.click();
  };

  const handleDownload = async (row: ProductFile) => {
    try {
      await downloadProductFile(product.slug, row.id);
    } catch (e: any) {
      toast.error(e.message || "Download failed");
    }
  };
  const handleView = async (row: ProductFile) => {
    try {
      await openProductFile(product.slug, row.id);
    } catch (e: any) {
      toast.error(e.message || "Could not open file");
    }
  };

  const list = files.data ?? [];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product files — {product.name}</DialogTitle>
          <DialogDescription>
            Upload the actual files customers download after purchase. Paid files stay private and
            are only delivered after a verified payment.
          </DialogDescription>
        </DialogHeader>

        <input ref={inputRef} type="file" accept={FILE_ACCEPT} className="hidden" onChange={onPickFile} />

        {/* Upload actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={upload.isPending} onClick={() => pickFor("product")}>
            <Upload className="h-3.5 w-3.5" /> Upload file
          </Button>
          <Button size="sm" variant="outline" disabled={upload.isPending} onClick={() => pickFor("preview")}>
            <Eye className="h-3.5 w-3.5" /> Upload preview / sample
          </Button>
          <Button size="sm" variant="outline" disabled={upload.isPending} onClick={() => pickFor("cover")}>
            <FileUp className="h-3.5 w-3.5" /> Upload cover image
          </Button>
          {upload.isPending && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </span>
          )}
        </div>

        {/* File list */}
        {files.isLoading ? (
          <Loading rows={2} />
        ) : list.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            No files yet. Upload the full product file (e.g. the complete e-book PDF) — it becomes the
            downloadable file customers receive after purchasing.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">File name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Uploaded</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2">
                      <p className="max-w-[220px] truncate font-medium" title={f.file_name}>{f.file_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {fileExt(f.file_name)}{f.file_size ? ` · ${formatFileSize(f.file_size)}` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="outline"
                        className={
                          f.kind === "product"
                            ? "border-emerald-500/40 text-emerald-600"
                            : f.kind === "preview"
                              ? "border-sky-500/40 text-sky-600"
                              : "border-violet-500/40 text-violet-600"
                        }
                      >
                        {KIND_LABEL[f.kind] ?? f.kind}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">v{f.version}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" title="Download / view" onClick={() => handleDownload(f)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Open in new tab" onClick={() => handleView(f)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Replace with a new version" disabled={replace.isPending} onClick={() => pickFor(f.kind, f)}>
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Delete" disabled={remove.isPending} onClick={() => remove.mutate(f)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes / instructions */}
        <div>
          <Label>Product notes / instructions</Label>
          <Textarea
            className="mt-1"
            rows={5}
            placeholder={"How to use this product:\n1. Download the file.\n2. Open it in Microsoft Word.\n3. Replace the sample information with your own.\n4. Save your completed version."}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Shown to customers on the product page and in their library after purchase. Editable at any time.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button disabled={!notesDirty || saveNotes.isPending} onClick={() => saveNotes.mutate()}>
            {saveNotes.isPending ? "Saving…" : "Save notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
