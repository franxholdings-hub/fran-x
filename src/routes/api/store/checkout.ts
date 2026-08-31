import { createFileRoute } from "@tanstack/react-router";

type CartLine = {
  slug: string;
  name: string;
  price: number;
  kind: "product" | "subscription";
  subCode?: string;
};

type Body = { items?: CartLine[] };

export const Route = createFileRoute("/api/store/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { items } = (await request.json().catch(() => ({}))) as Body;
        if (!Array.isArray(items) || items.length === 0)
          return Response.json({ error: "Your cart is empty." }, { status: 400 });

        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        // Server-side price validation: recompute the total from the catalog
        // so a tampered client price can never be charged.
        const { DIGITAL_PRODUCTS, STORE_SUBSCRIPTIONS } = await import(
          "@/lib/digital-store/catalog"
        );

        let total = 0;
        const lines: {
          slug: string;
          name: string;
          price: number;
          kind: string;
          subCode?: string;
        }[] = [];

        for (const item of items) {
          if (item.kind === "subscription") {
            const plan = STORE_SUBSCRIPTIONS.find((s) => s.code === item.subCode);
            if (!plan) return Response.json({ error: `Unknown plan: ${item.subCode}` }, { status: 400 });
            const price = plan.annualPrice > 0 ? plan.annualPrice : plan.monthlyPrice;
            total += price;
            lines.push({ slug: item.slug, name: plan.name, price, kind: "subscription", subCode: plan.code });
          } else {
            const product = DIGITAL_PRODUCTS.find((p) => p.slug === item.slug && p.published);
            if (!product) return Response.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
            total += product.price;
            lines.push({ slug: product.slug, name: product.name, price: product.price, kind: "product" });
          }
        }

        if (total <= 0)
          return Response.json({ error: "Cart total must be greater than zero." }, { status: 400 });

        const { initializeTransaction, paystackConfigured } = await import("@/lib/paystack.server");
        if (!paystackConfigured())
          return Response.json({ error: "Paystack is not configured." }, { status: 503 });

        const { makeReference } = await import("@/lib/site");
        const reference = makeReference("FXD"); // FX Digital
        const amountKobo = Math.round(total * 100);

        const host =
          request.headers.get("x-forwarded-host") ||
          request.headers.get("host") ||
          new URL(request.url).host;
        const callback_url = `https://${host}/store/checkout?reference=${reference}`;

        const init = await initializeTransaction({
          email: user.email || "",
          amount: amountKobo,
          currency: "NGN",
          reference,
          callback_url,
          metadata: {
            user_id: user.id,
            type: "digital_store",
            lines,
            total,
          },
        });

        if (init.status !== 200 || !init.data?.data?.authorization_url) {
          return Response.json(
            { error: init.data?.message || "Could not start payment." },
            { status: 502 },
          );
        }

        // Record a pending payment — verified only after server-side confirmation.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        try {
          await supabaseAdmin.from("payments").insert({
            transaction_id: reference,
            user_id: user.id,
            service_product: lines.map((l) => l.name).join(" + "),
            amount: total,
            currency: "NGN",
            payment_method: "paystack",
            paystack_reference: reference,
            payment_status: "pending",
            verification_status: "unverified",
            related_type: lines.some((l) => l.kind === "subscription") ? "subscription" : "one_time",
            related_id: lines[0]?.slug,
            notes: JSON.stringify({ lines }),
          } as never);
        } catch {
          // Recording is best-effort; the webhook/verify still processes the payment.
        }

        return Response.json({
          authorization_url: init.data.data.authorization_url,
          reference,
          total,
        });
      },
    },
  },
});
