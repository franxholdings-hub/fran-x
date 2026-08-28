import { createFileRoute } from "@tanstack/react-router";

type Body = { reference?: string };

export const Route = createFileRoute("/api/paystack/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { reference } = (await request.json().catch(() => ({}))) as Body;
        if (!reference) return Response.json({ error: "Reference is required." }, { status: 400 });

        const { verifyTransaction, processVerifiedPayment, paystackConfigured } = await import(
          "@/lib/paystack.server"
        );
        if (!paystackConfigured())
          return Response.json({ error: "Paystack is not configured." }, { status: 503 });

        const v = await verifyTransaction(reference);
        if (v.status !== 200 || !v.data?.data)
          return Response.json({ error: v.data?.message || "Verification failed." }, { status: 502 });

        const tx = v.data.data;
        if (tx.status === "success") {
          const result = await processVerifiedPayment({ ...tx, source: "api" });
          return Response.json({ success: true, reference, already: Boolean(result.already) });
        }

        // Not successful — record the real status from Paystack.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("payments")
          .update({ payment_status: tx.status || "failed", paystack_response: tx })
          .eq("paystack_reference", reference);
        return Response.json({ success: false, reference, status: tx.status });
      },
    },
  },
});
