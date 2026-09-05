// Secure download API for FRAN-X digital product files.
//
// GET /api/store/download?slug=<slug>&file=<fileId>[&direct=1][&inline=1]
//
// Access rules:
//   - 'preview' and 'cover' files are public (free samples / listing images).
//   - 'product' files require the caller to have an ACTIVE purchase of the
//     product in digital_library (granted only after a VERIFIED Paystack
//     payment) — never merely because a checkout page rendered.
// Access is delivered as a short-lived signed URL to the PRIVATE
// product-files bucket; no file is ever exposed at a public URL.

import { createFileRoute } from "@tanstack/react-router";

const ADMIN_EMAIL = "franxholdings@gmail.com"; // same admin model as useAuth/has_role
const SIGNED_URL_TTL_SECONDS = 600; // 10 minutes

type FileRow = {
  id: string;
  product_slug: string;
  kind: "product" | "preview" | "cover";
  file_name: string;
  storage_path: string;
  mime_type: string;
};

export const Route = createFileRoute("/api/store/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        const fileId = url.searchParams.get("file");
        const direct = url.searchParams.get("direct") === "1";
        const inline = url.searchParams.get("inline") === "1";
        if (!slug || !fileId)
          return Response.json({ error: "slug and file are required." }, { status: 400 });

        try {
          return await handleDownload(request, slug, fileId, direct, inline);
        } catch (e) {
          console.error("[download] failed:", e);
          return Response.json(
            {
              error:
                "File downloads are not configured on the server. Set SUPABASE_SERVICE_ROLE_KEY.",
            },
            { status: 503 },
          );
        }
      },
    },
  },
});

async function handleDownload(
  request: Request,
  slug: string,
  fileId: string,
  direct: boolean,
  inline: boolean,
): Promise<Response> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: file } = await supabaseAdmin
    .from("digital_product_files")
    .select("id,product_slug,kind,file_name,storage_path,mime_type")
    .eq("id", fileId)
    .eq("product_slug", slug)
    .maybeSingle();

  if (!file) return Response.json({ error: "File not found." }, { status: 404 });
  const row = file as unknown as FileRow;

        // Paid file — verify the purchase before granting access.
        if (row.kind === "product") {
          const { getUserFromRequest } = await import("@/lib/server-auth");
          const user = await getUserFromRequest(request);
          if (!user)
            return Response.json({ error: "Sign in to download this file." }, { status: 401 });

          const isAdmin = (user.email ?? "").toLowerCase() === ADMIN_EMAIL;
          if (!isAdmin) {
            const { data: access } = await supabaseAdmin
              .from("digital_library")
              .select("id,expires_at,is_active")
              .eq("user_id", user.id)
              .eq("product_slug", slug)
              .eq("is_active", true)
              .order("granted_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            const active =
              access &&
              (!access.expires_at || new Date(access.expires_at as string) > new Date());
            if (!active)
              return Response.json(
                { error: "You need to purchase this product to download its files." },
                { status: 403 },
              );
          }
        }

        // Issue a short-lived signed URL to the PRIVATE bucket.
        let signedUrl: string;
        try {
          const { data, error } = await supabaseAdmin.storage
            .from("product-files")
            .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS, {
              ...(inline ? {} : { download: row.file_name }),
            });
          if (error || !data?.signedUrl) throw error ?? new Error("No signed URL returned.");
          signedUrl = data.signedUrl;
        } catch (e) {
          console.error("[download] signed URL failed:", e);
          return Response.json(
            { error: "File storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY." },
            { status: 503 },
          );
        }

        // Best-effort download counters for paid files.
        if (row.kind === "product") {
          try {
            const { data: fr } = await supabaseAdmin
              .from("digital_product_files")
              .select("downloads")
              .eq("id", row.id)
              .maybeSingle();
            await supabaseAdmin
              .from("digital_product_files")
              .update({ downloads: ((fr?.downloads as number) ?? 0) + 1 } as never)
              .eq("id", row.id);
            const { data: pr } = await supabaseAdmin
              .from("digital_products")
              .select("downloads")
              .eq("slug", slug)
              .maybeSingle();
            await supabaseAdmin
              .from("digital_products")
              .update({ downloads: ((pr?.downloads as number) ?? 0) + 1 } as never)
              .eq("slug", slug);
          } catch {
            /* counters are best-effort */
          }
        }

  if (direct) return Response.redirect(signedUrl, 302);
  return Response.json({
    url: signedUrl,
    file_name: row.file_name,
    mime_type: row.mime_type,
  });
}
