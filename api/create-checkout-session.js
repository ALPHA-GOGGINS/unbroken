// POST /api/create-checkout-session
// Erstellt eine Stripe Checkout Session (Testmodus) fuer einen der drei Tiers.
// Aktuell admin-only, solange die Tiers oeffentlich noch nicht kaeuflich sind —
// dient zum Durchtesten des kompletten Checkout-Flows mit Stripe-Testkarten.

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PRICE_IDS = {
  1: process.env.STRIPE_PRICE_RECRUIT,
  2: process.env.STRIPE_PRICE_OPERATOR,
  3: process.env.STRIPE_PRICE_UNBROKEN,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY fehlt");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  // Auth: Supabase-Access-Token aus dem Authorization-Header pruefen
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("is_admin, stripe_customer_id")
    .eq("id", userData.user.id)
    .single();

  if (profileErr || !profile?.is_admin) {
    return res.status(403).json({ error: "Test-Checkout ist aktuell nur für Admins verfügbar" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const tierLevel = Number(body?.tierLevel);
  const priceId = PRICE_IDS[tierLevel];

  if (!priceId) {
    return res.status(400).json({ error: `Keine Price-ID für Tier ${tierLevel} konfiguriert (Env Var prüfen)` });
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: profile.stripe_customer_id || undefined,
      customer_email: profile.stripe_customer_id ? undefined : userData.user.email,
      client_reference_id: userData.user.id,
      metadata: {
        supabase_user_id: userData.user.id,
        tier_level: String(tierLevel),
      },
      success_url: `${origin}/admin?checkout=success`,
      cancel_url: `${origin}/admin?checkout=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Checkout konnte nicht erstellt werden" });
  }
}
