import { useMemo, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CATEGORY_MAP } from "@/lib/marketplace/catalog";
import { PHOTOS } from "@/lib/photos";
import type { CategoryId, ListingSpecs, MarketplaceListing } from "@/lib/marketplace/types";
import type { VendorDraft } from "@/lib/marketplace/store";

const CATEGORY_PHOTO: Record<CategoryId, string> = {
  automobiles: PHOTOS.automotive.src,
  "real-estate": PHOTOS.realEstate.src,
  businesses: PHOTOS.opportunities.src,
  "oil-gas": PHOTOS.energy.src,
};

type FormState = {
  title: string;
  category: CategoryId;
  subtype: string;
  location: string;
  price: string;
  description: string;
  images: string[];
  specs: ListingSpecs;
};

function emptyForm(category: CategoryId): FormState {
  return {
    title: "",
    category,
    subtype: CATEGORIES.find((c) => c.id === category)!.subtypes[0] ?? "",
    location: "",
    price: "",
    description: "",
    images: [],
    specs: {},
  };
}

function fromListing(l: MarketplaceListing): FormState {
  return {
    title: l.title,
    category: l.category,
    subtype: l.subtype,
    location: l.location,
    price: l.price,
    description: l.description,
    images: l.images,
    specs: l.specs,
  };
}

export function VendorListingForm({
  listing,
  onSaved,
  onCancel,
}: {
  listing?: MarketplaceListing;
  onSaved: (draft: VendorDraft, action: "draft" | "submit") => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    listing ? fromListing(listing) : emptyForm("automobiles"),
  );

  const subtypes = useMemo(() => CATEGORY_MAP[form.category].subtypes, [form.category]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setSpec = (key: keyof ListingSpecs, value: string) =>
    setForm((f) => ({ ...f, specs: { ...f.specs, [key]: value || undefined } }));

  const onCategoryChange = (id: CategoryId) => {
    setForm((f) => ({
      ...emptyForm(id),
      title: f.title,
      location: f.location,
      price: f.price,
      description: f.description,
      images: f.images,
    }));
  };

  const fileInput = useRef<HTMLInputElement>(null);

  const addImage = () =>
    setForm((f) => ({ ...f, images: [...f.images, ""].slice(0, 4) }));
  const setImage = (i: number, url: string) =>
    setForm((f) => ({ ...f, images: f.images.map((x, idx) => (idx === i ? url : x)) }));
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const onFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 4 - form.images.length;
    const toRead = Array.from(files).slice(0, Math.max(0, remaining));
    toRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setForm((f) => (f.images.length >= 4 ? f : { ...f, images: [...f.images, dataUrl] }));
      };
      reader.readAsDataURL(file);
    });
    if (fileInput.current) fileInput.current.value = "";
  };

  const buildDraft = (): VendorDraft => {
    const images = form.images.map((u) => u.trim()).filter(Boolean);
    const finalImages = images.length ? images : [CATEGORY_PHOTO[form.category]];
    const priceValue = parsePrice(form.price);
    return {
      title: form.title.trim(),
      category: form.category,
      subtype: form.subtype,
      location: form.location.trim(),
      price: form.price.trim() || "Price on request",
      priceValue,
      description: form.description.trim(),
      vendorName: "FRAN-X Vendor",
      verified: false,
      featured: false,
      images: finalImages,
      specs: form.specs,
    };
  };

  const valid = form.title.trim() && form.location.trim() && form.description.trim();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSaved(buildDraft(), "submit");
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Approved category *">
          <Select value={form.category} onValueChange={(v) => onCategoryChange(v as CategoryId)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            Only approved FRAN-X categories are permitted.
          </p>
        </Field>
        <Field label={`${CATEGORY_MAP[form.category].shortLabel} type *`}>
          <Select value={form.subtype} onValueChange={(v) => set("subtype", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {subtypes.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Listing title *">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Tokunbo Toyota Camry 2019" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location *">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Lagos, Nigeria" />
        </Field>
        <Field label="Price / value">
          <Input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. ₦9,500,000 or 'Price on request'" />
        </Field>
      </div>

      <Field label="Description *">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Describe the asset or opportunity…" />
      </Field>

      {/* Category-specific specs */}
      <div className="rounded-lg border border-border bg-surface/40 p-4">
        <p className="eyebrow">{CATEGORY_MAP[form.category].shortLabel} details</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {form.category === "automobiles" && (
            <>
              <SpecField label="Make" value={form.specs.make ?? ""} onChange={(v) => setSpec("make", v)} placeholder="Toyota" />
              <SpecField label="Model" value={form.specs.model ?? ""} onChange={(v) => setSpec("model", v)} placeholder="Camry XLE" />
              <SpecField label="Year" value={form.specs.year ? String(form.specs.year) : ""} onChange={(v) => setSpec("year", v)} placeholder="2019" />
              <SpecField label="Mileage" value={form.specs.mileage ?? ""} onChange={(v) => setSpec("mileage", v)} placeholder="48,200 km" />
              <SpecField label="Condition" value={form.specs.condition ?? ""} onChange={(v) => setSpec("condition", v)} placeholder="Foreign used" />
            </>
          )}
          {form.category === "real-estate" && (
            <>
              <SpecField label="Property type" value={form.specs.propertyType ?? ""} onChange={(v) => setSpec("propertyType", v)} placeholder="Duplex" />
              <SpecField label="Size" value={form.specs.size ?? ""} onChange={(v) => setSpec("size", v)} placeholder="650 sqm" />
              <SpecField label="Intended use" value={form.specs.intendedUse ?? ""} onChange={(v) => setSpec("intendedUse", v)} placeholder="Residential" />
            </>
          )}
          {form.category === "businesses" && (
            <>
              <SpecField label="Industry" value={form.specs.industry ?? ""} onChange={(v) => setSpec("industry", v)} placeholder="Logistics" />
              <SpecField label="Business type" value={form.specs.businessType ?? ""} onChange={(v) => setSpec("businessType", v)} placeholder="Partnership" />
            </>
          )}
          {form.category === "oil-gas" && (
            <SpecField label="Opportunity type" value={form.specs.opportunityType ?? ""} onChange={(v) => setSpec("opportunityType", v)} placeholder="Energy supply" />
          )}
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Images (URLs)</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addImage} disabled={form.images.length >= 4}>
            <ImagePlus className="h-4 w-4" /> Add image
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {form.images.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface/30 px-4 py-3 text-xs text-muted-foreground">
              No images added — a category placeholder will be used. Add image URLs to showcase this listing.
            </p>
          ) : (
            form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={url} onChange={(e) => setImage(i, e.target.value)} placeholder="https://…/image.jpg" />
                <Button type="button" variant="outline" size="icon" onClick={() => removeImage(i)} aria-label="Remove image">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={!valid}
          onClick={() => onSaved(buildDraft(), "draft")}
        >
          Save as draft
        </Button>
        <Button type="submit" disabled={!valid}>Submit for review</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SpecField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </Field>
  );
}

function parsePrice(s: string): number {
  const digits = s.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}
