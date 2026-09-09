// Secure document download for a purchased digital product, generated from
// the full e-book / template content the admin wrote. Formats: PDF, Word
// (.doc) and plain text (.txt). Access is authorised server-side (verified
// purchase or an active subscription) before any content is returned.

import { createFileRoute } from "@tanstack/react-router";

type Body = { slug?: string; format?: string };

const FORMATS = ["pdf", "doc", "txt"] as const;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const Route = createFileRoute("/api/store/download-file")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { slug, format = "pdf" } = (await request.json().catch(() => ({}))) as Body;
        if (!slug) return Response.json({ error: "Missing product." }, { status: 400 });
        if (!(FORMATS as readonly string[]).includes(format))
          return Response.json({ error: "Unsupported format." }, { status: 400 });

        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { userHasProductAccess } = await import("@/lib/store/access");
        if (!(await userHasProductAccess(supabaseAdmin, user.id, slug)))
          return Response.json({ error: "You have not purchased this product." }, { status: 403 });

        const [{ data: product }, { data: content }] = await Promise.all([
          supabaseAdmin.from("digital_products").select("name").eq("slug", slug).maybeSingle(),
          supabaseAdmin
            .from("digital_product_content")
            .select("body")
            .eq("product_slug", slug)
            .maybeSingle(),
        ]);

        const name = ((product?.name as string) ?? slug).slice(0, 120);
        const body =
          ((content?.body as string) ?? "").trim() ||
          "The written content for this product has not been published yet. Please contact support if you expected a document.";
        const fileBase = name.replace(/[^\w\- ]+/g, "").trim() || slug;

        if (format === "txt") {
          const text = `${name}\nFRAN-X Technologies — Digital Store\n\n${body}\n`;
          return new Response(text, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Content-Disposition": `attachment; filename="${fileBase}.txt"`,
            },
          });
        }

        if (format === "doc") {
          const paragraphs = body
            .split(/\r?\n/)
            .map((line) => line.trim())
            .map((line) =>
              /^#{1,6}\s/.test(line)
                ? `<h2>${escapeHtml(line.replace(/^#+\s*/, ""))}</h2>`
                : line
                  ? `<p>${escapeHtml(line)}</p>`
                  : "",
            )
            .join("\n");
          const html = [
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">',
            "<head><meta charset=\"utf-8\"><title>",
            escapeHtml(name),
            "</title></head>",
            '<body style="font-family: Georgia, serif; line-height: 1.7;">',
            `<h1>${escapeHtml(name)}</h1>`,
            '<p style="color: #666; font-size: 10pt;">FRAN-X Technologies — Digital Store</p>',
            paragraphs,
            "</body></html>",
          ].join("\n");
          return new Response(html, {
            headers: {
              "Content-Type": "application/msword; charset=utf-8",
              "Content-Disposition": `attachment; filename="${fileBase}.doc"`,
            },
          });
        }

        const { buildPdf } = await import("@/lib/store/pdf");
        const bytes = await buildPdf(name, body);
        return new Response(bytes, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
          },
        });
      },
    },
  },
});
