import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!priceId || priceId === "price_placeholder") {
    return NextResponse.json({ error: "Stripe not fully configured" }, { status: 503 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    metadata: { user_id: user.id },
    success_url: `${origin}/dashboard?subscribed=1`,
    cancel_url: `${origin}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
