import { useState } from "react";
import PlanView from "../PlanView";
import { supabase } from "../supabase";
import { TIERS, TIER_NONE } from "../tiers";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

function TierPreviewToggle({ profile, lang, onUpdated }) {
  const de = lang === "de";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const current = profile?.tier ?? TIER_NONE;

  const setTier = async (level) => {
    setBusy(true); setErr(null);
    const { error } = await supabase.from("profiles").update({ tier: level }).eq("id", profile.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onUpdated({ ...profile, tier: level });
  };

  const options = [{ level: TIER_NONE, name: de ? "Kein Abo" : "No plan" }, ...TIERS];

  return (
    <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20, marginBottom:24 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:11, color:P.accent, letterSpacing:"0.12em", marginBottom:4 }}>
        {de ? "ANSICHT ALS TIER" : "VIEW AS TIER"}
      </div>
      <div style={{ fontSize:12, color:P.dim, lineHeight:1.6, marginBottom:16 }}>
        {de
          ? "Setzt profiles.tier direkt für deinen Account — ohne Zahlung. Du siehst die App danach genau so wie ein Nutzer dieser Stufe."
          : "Sets profiles.tier directly on your account — no payment involved. You'll see the app exactly as a user on that tier would."}
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {options.map((opt) => {
          const active = current === opt.level;
          return (
            <button key={opt.level} disabled={busy} onClick={() => setTier(opt.level)} style={{
              padding:"9px 16px", borderRadius:4, cursor: busy ? "default" : "pointer",
              border:`1px solid ${active ? P.accent : P.border}`,
              background: active ? "rgba(201,162,39,0.14)" : "transparent",
              color: active ? P.accent : P.dim,
              fontFamily:"Inter, sans-serif", fontSize:13, fontWeight: active ? 700 : 400,
              opacity: busy ? 0.6 : 1,
            }}>
              {opt.name}{active ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      {err && (
        <div style={{ marginTop:12, fontSize:12, color:"#E05252" }}>{err}</div>
      )}
    </div>
  );
}

function StripeTestCheckout({ lang }) {
  const de = lang === "de";
  const [loading, setLoading] = useState(null);
  const [err, setErr] = useState(null);

  const startCheckout = async (tierLevel) => {
    setLoading(tierLevel); setErr(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setErr(de ? "Nicht eingeloggt." : "Not signed in."); setLoading(null); return; }

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tierLevel }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message || (de ? "Checkout konnte nicht gestartet werden." : "Could not start checkout."));
      setLoading(null);
    }
  };

  return (
    <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20, marginBottom:24 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:11, color:P.accent, letterSpacing:"0.12em", marginBottom:4 }}>
        {de ? "STRIPE TEST-CHECKOUT" : "STRIPE TEST CHECKOUT"}
      </div>
      <div style={{ fontSize:12, color:P.dim, lineHeight:1.6, marginBottom:16 }}>
        {de
          ? "Kompletter Checkout-Flow im Stripe-Testmodus. Testkarte: 4242 4242 4242 4242, beliebiges zukünftiges Datum, beliebiger CVC. Nach erfolgreichem Test-Kauf setzt der Webhook profiles.tier automatisch."
          : "Full checkout flow in Stripe test mode. Test card: 4242 4242 4242 4242, any future date, any CVC. On successful test purchase, the webhook sets profiles.tier automatically."}
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {TIERS.map((t) => (
          <button key={t.level} disabled={loading !== null} onClick={() => startCheckout(t.level)} style={{
            padding:"10px 16px", borderRadius:4, cursor: loading ? "default" : "pointer",
            border:`1px solid ${P.accent}`, background:"transparent", color:P.accent,
            fontFamily:"Inter, sans-serif", fontSize:13, fontWeight:600,
            opacity: loading !== null && loading !== t.level ? 0.4 : 1,
          }}>
            {loading === t.level
              ? "…"
              : `${de ? "Test-Checkout" : "Test checkout"} ${t.name}`}
          </button>
        ))}
      </div>
      {err && <div style={{ marginTop:12, fontSize:12, color:"#E05252" }}>{err}</div>}
    </div>
  );
}

export default function PageAdmin({ lang, session, profile: initialProfile }) {
  const de = lang === "de";
  const [profile, setProfile] = useState(initialProfile);

  if (!session || !profile?.is_admin) {
    return (
      <div style={{ maxWidth:480 }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:28, color:P.text, marginBottom:12 }}>
          {de ? "Kein Zugriff" : "No access"}
        </div>
        <div style={{ fontSize:14, color:P.dim, lineHeight:1.7 }}>
          {de ? "Dieser Bereich ist nicht öffentlich." : "This area is not public."}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width:"100%" }}>
      <div style={{
        background:"rgba(201,162,39,0.08)", border:`1px solid ${P.accent}`,
        borderRadius:6, padding:"12px 16px", marginBottom:24,
      }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:11, color:P.accent, letterSpacing:"0.12em", marginBottom:4 }}>
          ADMIN – BAUKASTEN
        </div>
        <div style={{ fontSize:12, color:P.dim, lineHeight:1.6 }}>
          {de
            ? "Testbereich für Pläne und Splits. Normale Nutzer sehen unter „Mein Plan\" den Countdown."
            : "Test area for plans and splits. Regular users see the countdown under \"My Plan\"."}
        </div>
      </div>

      <TierPreviewToggle profile={profile} lang={lang} onUpdated={setProfile} />
      <StripeTestCheckout lang={lang} />

      <PlanView profile={profile} lang={lang} isAdmin={true} />
    </div>
  );
}
