// Server-only Paystack helpers. NEVER import this from client code.
// The secret key lives only in process.env and is never exposed to the browser,
// public API responses, or the embedded widget.
//
// Paystack webhook signatures are verified with the SAME secret key
// (HMAC SHA512 of the raw body), so no separate webhook secret is required.

import crypto from "node:crypto";

const API = "https://api.paystack.co";

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function secret(): string {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error("Paystack is not configured (PAYSTACK_SECRET_KEY missing).");
  return k;
}

type PaystackResponse = { status: number; data: any };

async function call(path: string, init: { method?: string; json?: unknown } = {}): Promise<PaystackResponse> {
  const res = await fetch(`${API}${path}`, {
    method: init.method || "GET",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: init.json ? JSON.stringify(init.json) : undefined,
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { status: res.status, data };
}

export async function initializeTransaction(opts: {
  email: string;
  amount: number; // kobo
  currency?: string;
  reference: string;
  plan?: string; // paystack plan code (recurring)
  callback_url?: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackResponse> {
  return call("/transaction/initialize", {
    method: "POST",
    json: {
      email: opts.email,
      amount: opts.amount,
      currency: opts.currency || "NGN",
      reference: opts.reference,
      ...(opts.plan ? { plan: opts.plan } : {}),
      ...(opts.callback_url ? { callback_url: opts.callback_url } : {}),
      metadata: opts.metadata || {},
    },
  });
}

export async function verifyTransaction(reference: string): Promise<PaystackResponse> {
  return call(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export async function createPlan(opts: {
  name: string;
  amount: number; // kobo
  interval: "monthly" | "yearly" | "weekly" | "daily";
  currency?: string;
}): Promise<PaystackResponse> {
  return call("/plan", {
    method: "POST",
    json: { name: opts.name, amount: opts.amount, interval: opts.interval, currency: opts.currency || "NGN" },
  });
}

// Verify a Paystack webhook event: HMAC SHA512 of the raw body with the secret key.
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) return false;
  try {
    const expected = crypto.createHmac("sha512", k).update(rawBody).digest("hex");
    // timing-safe compare
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

type TxData = {
  reference: string;
  status: string;
  amount: number; // kobo
  currency?: string;
  customer?: { email?: string; first_name?: string; last_name?: string; customer_code?: string };
  plan?: string | null;
  metadata?: Record<string, unknown> | null;
  source?: string;
  [key: string]: unknown;
};

/**
 * Process a verified successful Paystack transaction.
 * Idempotent: safe to call from both the verify route and the webhook.
 * Updates the payment, upserts a customer, activates the subscription,
 * and records the verified amount in the centralized revenue_history.
 */
export async function processVerifiedPayment(tx: TxData): Promise<{
  ok: boolean;
  already?: boolean;
  subscriptionId?: string | null;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const reference = tx.reference;
  const amount = Number(tx.amount) / 100; // kobo -> major unit
  const currency = tx.currency || "NGN";
  const email = tx.customer?.email || "";
  const source = tx.source || "api";

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("paystack_reference", reference)
    .maybeSingle();

  // Idempotency guard
  if (payment && payment.verification_status === "verified") {
    return { ok: true, already: true, subscriptionId: payment.subscription_id };
  }

  // Upsert unified customer
  let customerId = payment?.customer_id ?? null;
  if (email) {
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (existing) {
      customerId = existing.id;
    } else {
      const name = tx.customer
        ? `${tx.customer.first_name || ""} ${tx.customer.last_name || ""}`.trim() || email
        : email;
      const { data: c } = await supabaseAdmin
        .from("customers")
        .insert({ name, email, type: "individual" })
        .select("id")
        .single();
      if (c) customerId = c.id;
    }
  }

  const planId = (payment?.plan_id as string) || (tx.metadata?.plan_id as string) || null;
  const userId = (payment?.user_id as string) || (tx.metadata?.user_id as string) || null;

  // Update the payment record
  const paymentUpdate: Record<string, unknown> = {
    payment_status: "successful",
    verification_status: "verified",
    verification_source: source,
    paid_at: new Date().toISOString(),
    amount,
    currency,
    paystack_response: tx,
    ...(customerId ? { customer_id: customerId } : {}),
  };
  if (payment) {
    await supabaseAdmin.from("payments").update(paymentUpdate).eq("paystack_reference", reference);
  } else {
    // Webhook arrived before the initialize record (rare) — create it.
    const { data: p } = await supabaseAdmin
      .from("payments")
      .insert({
        transaction_id: reference,
        user_id: userId,
        plan_id: planId,
        amount,
        currency,
        payment_method: "paystack",
        paystack_reference: reference,
        payment_status: "successful",
        verification_status: "verified",
        verification_source: source,
        paid_at: new Date().toISOString(),
        paystack_response: tx,
        customer_id: customerId,
      } as never)
      .select("id")
      .single();
    if (p) payment.id = p.id;
  }

  // Create / activate subscription for recurring plans
  let subscriptionId = (payment?.subscription_id as string) || null;
  let planName: string | null = null;
  let productType: string | null = null;
  if (planId) {
    const { data: plan } = await supabaseAdmin
      .from("ai_packages")
      .select("*")
      .eq("id", planId)
      .maybeSingle();
    if (plan) {
      planName = plan.name;
      productType = plan.product_type;
      const recurring = plan.billing_interval === "monthly" || plan.billing_interval === "yearly";
      if (recurring && userId) {
        const periodEnd = new Date();
        if (plan.billing_interval === "yearly") periodEnd.setDate(periodEnd.getDate() + 365);
        else periodEnd.setDate(periodEnd.getDate() + 30);
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .eq("plan_id", planId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (sub) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              current_period_end: periodEnd.toISOString(),
              paystack_plan_code: tx.plan || plan.paystack_plan_code || null,
            })
            .eq("id", sub.id);
          subscriptionId = sub.id;
        } else {
          const { data: newSub } = await supabaseAdmin
            .from("subscriptions")
            .insert({
              user_id: userId,
              plan_id: planId,
              status: "active",
              started_at: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
              paystack_plan_code: tx.plan || plan.paystack_plan_code || null,
            } as never)
            .select("id")
            .single();
          if (newSub) subscriptionId = newSub.id;
        }
      }
    }
  }

  if (subscriptionId) {
    await supabaseAdmin.from("payments").update({ subscription_id: subscriptionId }).eq("paystack_reference", reference);
  }

  // Record in the ONE centralized revenue history (never deleted)
  const category = productType === "ai_integration" ? "AI Integration" : "Subscriptions";
  await supabaseAdmin.from("revenue_history").insert({
    transaction_id: (payment?.transaction_id as string) || reference,
    transacted_at: new Date().toISOString().slice(0, 10),
    customer_name: tx.customer
      ? `${tx.customer.first_name || ""} ${tx.customer.last_name || ""}`.trim() || null
      : null,
    customer_email: email || null,
    customer_id: customerId,
    category,
    service_product: planName || "Subscription",
    amount,
    currency,
    payment_method: "paystack",
    paystack_reference: reference,
    payment_status: "completed",
    related_type: "subscription",
    related_id: subscriptionId,
    payment_id: payment?.id ?? null,
    subscription_id: subscriptionId,
    verification_status: "verified",
  } as never);

  return { ok: true, subscriptionId };
}
