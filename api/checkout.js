// api/checkout.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Emails descartáveis
const disposableDomains = new Set([
  "mailinator.com", "tempmail.com", "10minutemail.com",
  "guerrillamail.com", "yopmail.com", "sharklasers.com",
  "trashmail.com", "dispostable.com", "fakeinbox.com",
  "getnada.com", "maildrop.cc", "spamgourmet.com",
  "mohmal.com", "linshiyouxiang.net"
]);

function isDisposableEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomains.has(domain);
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido." });

  try {
    const { plan, email } = req.body || {};

    if (!plan)
      return res.status(400).json({ error: "Plano é obrigatório." });

    if (!email)
      return res.status(400).json({ error: "Email é obrigatório." });

    const normalizedEmail = email.toLowerCase().trim();

    if (isDisposableEmail(normalizedEmail)) {
      return res.status(403).json({
        error: "Emails temporários ou descartáveis não são permitidos."
      });
    }

    // Mapeamento para seus preços reais do Stripe
    const priceMap = {
      basic: "price_1SXwjnLooFe0F9gaMhOnaU3I",
      pro: "price_1SXwpILooFe0F9gaQEDSo4M8",
      studio: "price_1SXwt3LooFe0F9gaE5EanLAj",
    };

    const priceId = priceMap[plan];

    if (!priceId) {
      return res.status(400).json({ error: "Plano inválido." });
    }

    const origin =
      req.headers.origin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: normalizedEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(normalizedEmail)}`,
      cancel_url: `${origin}/cancel`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("checkout error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
