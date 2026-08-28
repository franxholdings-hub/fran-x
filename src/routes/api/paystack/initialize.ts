import { createFileRoute } from "@tanstack/react-router";

type Body = { planId?: string; email?: string };

export const Route = createFileRoute("/api/paystack/initialize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Body;
        const { planId, email } = body;
        if (!planId) return Response.json({ error: "Plan is required." }, { status: 400 });

        const { getUserFromRequest } = await import("@/lib/server-auth");
        const user = await getUserFromRequest(request);
        if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

        const payeeEmail = (email || user.email || "").trim();
        if (!payeeEmail) return Response.json({ error: "Email is required." }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: plan } = await supabaseAdmin
          .from("ai_packages")
          .select("*")
          .eq("id", planId)
          .maybeSingle();
        if (!plan || !plan.is_active) return Response.json({ error: "Plan not available." }, { status: 404 });
        if (plan.billing_interval === "free")
          return Response.json({ error: "Free plan does not require payment." }, { status: 400 });

        const { initializeTransaction, paystackConfigured } = await import("@/lib/paystack.server");
        if (!paystackConfigured())
          return Response.json({ error: "Paystack is not configured." }, { status: 503 });

        const { makeReference } = await import("@/lib/site");
        const reference = makeReference("FXP");
        const amountKobo = Math.round(Number(plan.monthly_price) * 100); // NGN -> kobo

        const host =
          request.headers.get("x-forwarded-host") ||
          request.headers.get("host") ||
          new URL(request.url).host;
        const callback_url = `https://${host}/pricing?reference=${reference}`;

        const init = await initializeTransaction({
          email: payeeEmail,
          amount: amountKobo,
          currency: plan.currency || "NGN",
          reference,
          ...(plan.paystack_plan_code ? { plan: plan.paystack_plan_code } : {}),
          callback_url,
          metadata: { user_id: user.id, plan_id: plan.id, plan_code: plan.code, type: "subscription" },
        });

        if (init.status !== 200 || !init.data?.data?.authorization_url) {
          return Response.json(
            { error: init.data?.message || "Could not start payment." },
            { status: 502 },
          );
        }

        // Record a pending payment — verified only after server-side confirmation.
        await supabaseAdmin.from("payments").insert({
          transaction_id: reference,
          user_id: user.id,
          plan_id: plan.id,
          service_product: plan.name,
          amount: Number(plan.monthly_price),
          currency: plan.currency || "NGN",
          payment_method: "paystack",
          paystack_reference: reference,
          payment_status: "pending",
          verification_status: "unverified",
          related_type: "subscription",
          related_id: plan.id,
        } as never);

        return Response.json({
          authorization_url: init.data.data.authorization_url,
          reference,
        });
      },
    },
  },
});
