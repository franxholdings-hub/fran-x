import { createFileRoute } from "@tanstack/react-router";

// Returns whether Paystack is configured — never exposes the key.
export const Route = createFileRoute("/api/paystack/status")({
  server: {
    handlers: {
      GET: async () => {
        const { paystackConfigured } = await import("@/lib/paystack.server");
        return Response.json({ configured: paystackConfigured() });
      },
    },
  },
});
