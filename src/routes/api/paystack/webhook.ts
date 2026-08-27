import { createFileRoute } from "@tanstack/react-router";

// Public Paystack webhook. Authenticity is proven by the HMAC SHA512
// signature computed with PAYSTACK_SECRET_KEY (no separate webhook secret).
export const Route = createFileRoute("/api/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyWebhookSignature, processVerifiedPayment } = await import("@/lib/paystack.server");

        const raw = await request.text();
        const signature = request.headers.get("x-paystack-signature");
        if (!verifyWebhookSignature(raw, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: { event?: string; data?: Record<string, unknown> };
        try {
          event = JSON.parse(raw);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        if (event.event === "charge.success") {
          const tx = event.data;
          if (tx && tx.status === "success" && tx.reference) {
            try {
              await processVerifiedPayment({ ...(tx as never), source: "webhook" });
            } catch (err) {
              console.error("paystack webhook processing failed", err);
            }
          }
        }

        // Acknowledge quickly — Paystack expects a 200.
        return Response.json({ received: true });
      },
    },
  },
});
