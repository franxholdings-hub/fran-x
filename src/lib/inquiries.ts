import { supabase } from "@/integrations/supabase/client";
import { makeReference } from "@/lib/site";
import { z } from "zod";

export const baseInquirySchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().min(10, "Please describe your requirement").max(4000),
  budget: z.string().trim().max(120).optional().or(z.literal("")),
  timeline: z.string().trim().max(120).optional().or(z.literal("")),
  contact_method: z.string().trim().max(60).optional().or(z.literal("")),
});

export type InquiryPayload = {
  kind: "service" | "website" | "app" | "opportunity" | "contact";
  category?: string | null;
  service?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  country?: string | null;
  description: string;
  budget?: string | null;
  timeline?: string | null;
  contact_method?: string | null;
  details?: Record<string, unknown>;
};

export async function submitInquiry(payload: InquiryPayload) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("You need an account to submit this request.");

  const reference = makeReference(
    payload.kind === "website" ? "FXW" : payload.kind === "app" ? "FXA" : payload.kind === "opportunity" ? "FXO" : "FX",
  );

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      reference,
      user_id: user.id,
      kind: payload.kind,
      category: payload.category ?? null,
      service: payload.service ?? null,
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone || null,
      company: payload.company || null,
      country: payload.country || null,
      description: payload.description,
      budget: payload.budget || null,
      timeline: payload.timeline || null,
      contact_method: payload.contact_method || null,
      details: (payload.details ?? {}) as never,
    })
    .select("reference")
    .single();

  if (error) throw error;
  return data.reference as string;
}