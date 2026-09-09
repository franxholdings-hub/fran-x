// Shared purchase-access check for the digital store server routes
// (/api/store/read, /download, /download-file).
//
// A signed-in user may access a product when:
//  1. they hold a verified payment whose lines include the product slug
//     (or any verified subscription payment — Resource Pass unlocks all), or
//  2. they hold an active/trialing subscription record.

import type { SupabaseClient } from "@supabase/supabase-js";

export async function userHasProductAccess(
  db: SupabaseClient<any>,
  userId: string,
  slug: string,
): Promise<boolean> {
  const { data: payments } = await db
    .from("payments")
    .select("notes, related_id, related_type, verification_status")
    .eq("user_id", userId)
    .eq("verification_status", "verified");

  let allowed = false;
  for (const p of payments ?? []) {
    if (p.related_id === slug) allowed = true;
    if (p.related_type === "subscription") allowed = true;
    try {
      const parsed = JSON.parse((p.notes as string) || "{}") as {
        lines?: { slug: string; kind: string }[];
      };
      for (const line of parsed.lines ?? []) {
        if (line.slug === slug || line.kind === "subscription") allowed = true;
      }
    } catch {
      /* notes not JSON */
    }
  }

  if (!allowed) {
    const { data: sub } = await db
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["active", "trial", "trialing"])
      .limit(1)
      .maybeSingle();
    if (sub) allowed = true;
  }

  return allowed;
}
