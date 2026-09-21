// POST /api/stripe-webhook
// Nimmt Stripe-Events entgegen (Testmodus und spaeter Live-Modus identisch)
// und haelt profiles.tier synchron mit dem tatsaechlichen Abo-Status.
//
// WICHTIG: Vercel muss den Body roh durchreichen, sonst schlaegt die
// Signaturpruefung fehl — deshalb bodyParser:false + manuelles Einlesen.

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TIER_BY_PRICE = {
  [process.env.STRIPE_PRICE_RECRUIT]: 1,
  [process.env.STRIPE_PRICE_OPERATOR]: 2,
  [process.env.STRIPE_PRICE_UNBROKEN]: 3,
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET fehlt");
    return res.status(500).send("Webhook not configured");
  }

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature check failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // Test-/echter Kauf abgeschlossen -> Tier direkt aus der Checkout-Session setzen
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.supabase_user_id;
        const tierLevel = Number(session.metadata?.tier_level) || null;

        if (userId && tierLevel) {
          await supabaseAdmin
            .from("profiles")
            .update({
              tier: tierLevel,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
            })
            .eq("id", userId);
        }
        break;
      }

      // Abo geaendert (z.B. Tier-Wechsel, Zahlung fehlgeschlagen, Reaktivierung)
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const tierLevel = TIER_BY_PRICE[priceId] ?? null;
        const isActive = sub.status === "active" || sub.status === "trialing";

        await supabaseAdmin
          .from("profiles")
          .update({ tier: isActive ? tierLevel : 0 })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      // Abo gekuendigt/beendet -> zurueck auf kein Tier
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await supabaseAdmin
          .from("profiles")
          .update({ tier: 0 })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handling failed:", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
