// Secure reader for a purchased digital product.
// Returns the full long-form e-book body written by the admin, but only to a
// signed-in user who actually paid for the product (or holds an active
// subscription).

import { createFileRoute } from "@tanstack/react-router";

type Body = { slug?: string };

export const Route = createFileRoute("/api/store/read")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { slug } = (await request.json().catch(() => ({}))) as Body;
        if (!slug) return Response.json({ error: "Missing product." }, { status: 400 });

        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: payments } = await supabaseAdmin
          .from("payments")
          .select("notes, related_id, related_type, verification_status")
          .eq("user_id", user.id)
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
          const { data: sub } = await supabaseAdmin
            .from("subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .in("status", ["active", "trial", "trialing"])
            .limit(1)
            .maybeSingle();
          if (sub) allowed = true;
        }

        if (!allowed)
          return Response.json({ error: "You have not purchased this product." }, { status: 403 });

        const { data: product } = await supabaseAdmin
          .from("digital_products")
          .select("name")
          .eq("slug", slug)
          .maybeSingle();

        const { data: content } = await supabaseAdmin
          .from("digital_product_content")
          .select("body, updated_at")
          .eq("product_slug", slug)
          .maybeSingle();

        return Response.json({
          name: (product?.name as string) ?? slug,
          body: (content?.body as string) ?? "",
          updatedAt: content?.updated_at ?? null,
        });
      },
    },
  },
});
