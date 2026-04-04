/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook handler. Receives signed events from Stripe and updates
 * the subscriptions table in Supabase accordingly.
 *
 * This endpoint must be registered in Stripe Dashboard → Developers → Webhooks.
 * Endpoint URL: https://<your-domain>/api/stripe/webhook
 *
 * Handled events:
 *   checkout.session.completed       — new subscription activated; upserts subscriptions row
 *   customer.subscription.updated    — plan change or renewal; updates status
 *   customer.subscription.deleted    — cancellation; updates status to "canceled"
 *
 * Auth: Stripe signature verification using STRIPE_WEBHOOK_SECRET (not user auth).
 *   Returns 400 if the signature is invalid.
 *   Returns 200 with a note if STRIPE_WEBHOOK_SECRET is not yet configured (dev mode).
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) because this endpoint runs without
 * a user session — Stripe is the caller, not a browser.
 *
 * Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_placeholder";

  // Allow unauthenticated requests in dev when secret is not yet configured
  if (webhookSecret === "whsec_placeholder") {
    return NextResponse.json({ received: true, note: "webhook secret not configured" });
  }

  let event: Stripe.Event;
  try {
    // Verify the event came from Stripe (prevents spoofed webhook calls)
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Use service role to write subscription data — no user session is present here
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (userId && session.subscription) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        status: "active",
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await supabase.from("subscriptions").update({ status: sub.status }).eq("stripe_subscription_id", sub.id);
  }

  return NextResponse.json({ received: true });
}
