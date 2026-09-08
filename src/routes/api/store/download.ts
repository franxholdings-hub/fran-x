// Secure download of a purchased digital product.
// Verifies the signed-in user actually paid for the product (verified payment
// or an active Resource Pass subscription) before issuing a short-lived
// signed URL for the private product-files bucket.

import { createFileRoute } from "@tanstack/react-router";

type Body = { slug?: string };

export const Route = createFileRoute("/api/store/download")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { slug } = (await request.json().catch(() => ({}))) as Body;
        if (!slug) return Response.json({ error: "Missing product." }, { status: 400 });

        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 1. Does the product exist and have a real file?
        const { data: product } = await supabaseAdmin
          .from("digital_products")
          .select("slug, name, file_url, file_name, has_file, is_published, is_archived")
          .eq("slug", slug)
          .maybeSingle();

        if (!product || !product.file_url || !product.has_file)
          return Response.json({ error: "This product has no file available yet." }, { status: 404 });

        // 2. Ownership: a verified payment whose lines include this slug.
        const { data: payments } = await supabaseAdmin
          .from("payments")
          .select("notes, related_id, related_type, verification_status")
          .eq("user_id", user.id)
          .eq("verification_status", "verified");

        let owned = false;
        let subscriber = false;
        for (const p of payments ?? []) {
          if (p.related_id === slug) owned = true;
          if (p.related_type === "subscription") subscriber = true;
          try {
            const parsed = JSON.parse((p.notes as string) || "{}") as {
              lines?: { slug: string; kind: string }[];
            };
            for (const line of parsed.lines ?? []) {
              if (line.slug === slug) owned = true;
              if (line.kind === "subscription") subscriber = true;
            }
          } catch {
            /* notes not JSON */
          }
        }

        // 3. Active Resource Pass style subscription also unlocks the library.
        if (!owned && !subscriber) {
          const { data: sub } = await supabaseAdmin
            .from("subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .in("status", ["active", "trial", "trialing"])
            .limit(1)
            .maybeSingle();
          if (sub) subscriber = true;
        }

        if (!owned && !subscriber)
          return Response.json({ error: "You have not purchased this product." }, { status: 403 });

        const { data: signed, error } = await supabaseAdmin.storage
          .from("product-files")
          .createSignedUrl(product.file_url as string, 300, {
            download: (product.file_name as string) || `${product.slug}`,
          });

        if (error || !signed?.signedUrl)
          return Response.json({ error: "Could not prepare the download." }, { status: 500 });

        return Response.json({ url: signed.signedUrl, name: product.file_name || product.name });
      },
    },
  },
});
