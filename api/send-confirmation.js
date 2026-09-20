// Vercel Serverless Function — POST /api/send-confirmation
// Sendet die Bestaetigungsmail fuer die UNBROKEN-Warteliste via Resend.
// Der API-Key bleibt server-side (Vercel Env Var RESEND_API_KEY) und wird nie an den Client ausgeliefert.

const FROM_ADDRESS = process.env.RESEND_FROM || "UNBROKEN <hello@unbroken40.com>";

function buildEmail(lang, position) {
  const de = lang === "de";

  const subject = de
    ? "Du bist auf der UNBROKEN Warteliste"
    : "You're on the UNBROKEN waitlist";

  const heading = de ? "DU BIST DRIN." : "YOU'RE IN.";
  const posLine = position
    ? (de ? `Deine Position: #${position}` : `Your position: #${position}`)
    : "";
  const body = de
    ? "Wir melden uns per Mail, sobald UNBROKEN startet. Kein Spam, keine Weitergabe deiner Adresse."
    : "We'll email you the moment UNBROKEN launches. No spam, no sharing your address.";
  const footer = de
    ? "Diese Mail wurde ausgeloest, weil du dich auf unbroken40.com eingetragen hast."
    : "This email was triggered because you signed up at unbroken40.com.";

  const html = `
  <div style="background:#1B1E15;padding:40px 16px;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#2A2F22;border:1px solid #3D4530;border-radius:6px;padding:32px;">
      <div style="font-family:'Oswald',Arial,sans-serif;font-weight:700;letter-spacing:0.05em;font-size:28px;color:#EEEAE0;margin-bottom:16px;">
        ${heading}
      </div>
      ${posLine ? `<div style="font-family:'Oswald',Arial,sans-serif;font-weight:700;font-size:40px;color:#C9A227;margin-bottom:16px;">${posLine}</div>` : ""}
      <div style="width:48px;height:3px;background:#C9A227;margin:16px 0 24px;"></div>
      <p style="font-size:15px;line-height:1.7;color:#A9AD9C;margin:0 0 24px;">${body}</p>
      <p style="font-size:12px;line-height:1.6;color:#6E7263;margin:0;">${footer}</p>
    </div>
  </div>`;

  const text = de
    ? `${heading}\n${posLine}\n\n${body}`
    : `${heading}\n${posLine}\n\n${body}`;

  return { subject, html, text };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY fehlt in den Environment Variables");
    return res.status(500).json({ error: "Email service not configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { email, lang, position } = body || {};

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const { subject, html, text } = buildEmail(lang === "de" ? "de" : "en", position);

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [email],
        subject,
        html,
        text,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", data);
      return res.status(resendRes.status).json({ error: data });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error("send-confirmation failed:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
