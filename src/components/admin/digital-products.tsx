// Admin: Digital Products management (CRUD on the digital_products table).

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Package, Archive, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty, Loading, PanelSection } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney } from "@/lib/ai-integration";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  whats_included: string[] | string;
  file_format: string;
  cover: string | null;
  featured: boolean;
  is_bundle: boolean;
  is_published: boolean;
  is_archived: boolean;
  has_file: boolean;
  sort_order: number;
  sales_count: number;
  revenue: number;
  downloads: number;
};

const CATEGORIES = ["templates", "ebooks", "finance"] as const;
const EMPTY = {
  slug: "",
  name: "",
  category: "templates",
  price: 0,
  currency: "NGN",
  description: "",
  whats_included: "",
  file_format: "PDF",
  cover: "data",
  featured: false,
  is_bundle: false,
  is_published: false,
  sort_order: 0,
};

function parseList(v: string[] | string): string[] {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v) as string[]; } catch { return v.split("\n"); }
}

export function DigitalProducts() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const products = useQuery({
    queryKey: ["admin-digital-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const payload = {
        ...values,
        whats_included: String(values.whats_included)
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        price: Number(values.price) || 0,
        sort_order: Number(values.sort_order) || 0,
      } as Record<string, unknown>;
      if (editing) {
        const { error } = await supabase.from("digital_products").update(payload as never).eq("id", editing.id);
        if (error) throw error;
        await supabase.from("audit_log").insert({
          actor_id: user?.id ?? null, actor_email: user?.email ?? null,
          action: "digital_product.update", entity: "digital_products", entity_id: editing.id,
        } as never);
      } else {
        const { error } = await supabase.from("digital_products").insert(payload as never);
        if (error) throw error;
        await supabase.from("audit_log").insert({
          actor_id: user?.id ?? null, actor_email: user?.email ?? null,
          action: "digital_product.create", entity: "digital_products",
        } as never);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product created");
      setEditing(null); setCreating(false);
      void qc.invalidateQueries({ queryKey: ["admin-digital-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const { error } = await supabase.from("digital_products").update({ [field]: value } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-digital-products"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PanelSection
      title="Digital Products"
      description="Create, price, publish and archive templates, e-books and financial guides. A product can only be published once a real file is uploaded."
      action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New product</Button>}
    >
      {products.isLoading ? (
        <Loading />
      ) : products.data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3 text-right">Price</th>
                <th className="py-2 pr-3">Sales</th>
                <th className="py-2 pr-3">File</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.data.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2 pr-3">
                    <p className="font-medium">{p.name} {p.is_bundle && <Package className="ml-1 inline h-3 w-3 text-primary" />}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{p.slug}</p>
                  </td>
                  <td className="py-2 pr-3 capitalize">{p.category}</td>
                  <td className="py-2 pr-3 text-right">{formatMoney(Number(p.price), p.currency)}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{p.sales_count ?? 0} · {formatMoney(Number(p.revenue ?? 0))}</td>
                  <td className="py-2 pr-3">
                    <Badge variant="outline" className={p.has_file ? "border-emerald-500/40 text-emerald-600" : "border-amber-500/40 text-amber-600"}>
                      {p.has_file ? "Uploaded" : "No file"}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3">
                    {p.is_archived ? (
                      <Badge variant="outline" className="border-destructive/40 text-destructive">Archived</Badge>
                    ) : p.is_published ? (
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">Published</Badge>
                    ) : (
                      <Badge variant="outline">Unpublished</Badge>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(p)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => toggle.mutate({ id: p.id, field: "is_published", value: !p.is_published })}
                        title={p.is_published ? "Unpublish" : "Publish"}
                      >
                        {p.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => toggle.mutate({ id: p.id, field: "is_archived", value: !p.is_archived })}
                        title="Archive"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No digital products yet. Apply the digital_store migration and create products here.</Empty>
      )}

      {(editing || creating) && (
        <ProductDialog
          product={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(v) => save.mutate(v)}
          pending={save.isPending}
        />
      )}
    </PanelSection>
  );
}

function ProductDialog({ product, onClose, onSave, pending }: {
  product: Product | null;
  onClose: () => void;
  onSave: (v: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const [f, setF] = useState<Record<string, unknown>>(
    product
      ? { ...product, whats_included: parseList(product.whats_included).join("\n") }
      : { ...EMPTY },
  );
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Name</Label><Input className="mt-1" value={f.name as string} onChange={(e) => set("name", e.target.value)} /></div>
          <div><Label>Slug (unique)</Label><Input className="mt-1" value={f.slug as string} disabled={!!product} onChange={(e) => set("slug", e.target.value)} /></div>
          <div>
            <Label>Category</Label>
            <Select value={f.category as string} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Price (NGN)</Label><Input className="mt-1" type="number" value={f.price as number} onChange={(e) => set("price", e.target.value)} /></div>
          <div><Label>File format</Label><Input className="mt-1" value={f.file_format as string} onChange={(e) => set("file_format", e.target.value)} /></div>
          <div><Label>Cover photo key</Label><Input className="mt-1" value={f.cover as string} onChange={(e) => set("cover", e.target.value)} /></div>
          <div><Label>Sort order</Label><Input className="mt-1" type="number" value={f.sort_order as number} onChange={(e) => set("sort_order", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea className="mt-1" value={f.description as string} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>What's included (one per line)</Label><Textarea className="mt-1" rows={5} value={f.whats_included as string} onChange={(e) => set("whats_included", e.target.value)} /></div>
          <label className="flex items-center gap-2"><Switch checked={f.featured as boolean} onCheckedChange={(v) => set("featured", v)} /> Featured</label>
          <label className="flex items-center gap-2"><Switch checked={f.is_bundle as boolean} onCheckedChange={(v) => set("is_bundle", v)} /> Bundle</label>
          <label className="flex items-center gap-2 sm:col-span-2"><Switch checked={f.is_published as boolean} onCheckedChange={(v) => set("is_published", v)} /> Published (requires uploaded file)</label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!(f.name as string).trim() || !(f.slug as string).trim()) { toast.error("Name and slug are required."); return; } onSave(f); }} disabled={pending}>
            {pending ? "Saving…" : "Save product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
