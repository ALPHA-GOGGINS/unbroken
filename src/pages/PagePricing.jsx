import { useNavigate } from "react-router-dom";
import { TIERS, featuresForTier } from "../tiers";

const P = {
  text: "#EEEAE0", dim: "#A9AD9C", accent: "#C9A227",
  panel: "#2A2F22", border: "#3D4530", bg: "#20241C",
};

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M2.5 7.2 5.6 10.3 11.5 3.7" stroke={P.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TierCard({ tier, lang, highlight, onWaitlist }) {
  const de = lang === "de";
  const features = featuresForTier(tier.level);
  const inherited = tier.level > 1;

  return (
    <div style={{
      background: P.panel, border: `1px solid ${highlight ? P.accent : P.border}`,
      borderRadius: 8, padding: 28, display: "flex", flexDirection: "column",
      flex: "1 1 280px", minWidth: 260, maxWidth: 340, position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -12, left: 24, padding: "4px 12px",
        borderRadius: 4, background: "#3D3420", border: `1px solid ${P.accent}`,
        fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.1em", color: P.accent,
      }}>
        {de ? "COMING SOON" : "COMING SOON"}
      </div>

      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: "0.14em", color: P.dim, marginTop: 8 }}>
        TIER {tier.level}
      </div>
      <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 28, color: P.text, marginBottom: 8 }}>
        {tier.name}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20 }}>
        <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 32, color: P.accent }}>
          {de ? tier.price : tier.priceEn}
        </span>
        <span style={{ fontSize: 13, color: P.dim }}>{tier.period[lang]}</span>
      </div>

      <div style={{ width: 40, height: 2, background: P.border, marginBottom: 20 }} />

      {inherited && (
        <div style={{ fontSize: 13, color: P.accent, marginBottom: 12, fontStyle: "italic" }}>
          {de ? `Alles aus Tier ${tier.level - 1}` : `Everything in Tier ${tier.level - 1}`}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, flex: 1 }}>
        {features.map((f) => (
          <div key={f.id} style={{ display: "flex", gap: 10 }}>
            <Check />
            <span style={{ fontSize: 14, lineHeight: 1.5, color: P.text }}>{f[lang]}</span>
          </div>
        ))}
      </div>

      <button onClick={onWaitlist} style={{
        background: "transparent", border: `1px solid ${P.accent}`, color: P.accent,
        padding: "13px 0", borderRadius: 4, fontSize: 14, fontWeight: 600,
        fontFamily: "Inter, sans-serif", letterSpacing: "0.03em", cursor: "pointer", width: "100%",
      }}>
        {de ? "AUF DIE WARTELISTE" : "JOIN THE WAITLIST"}
      </button>
    </div>
  );
}

export default function PagePricing({ lang }) {
  const de = lang === "de";
  const navigate = useNavigate();
  const goWaitlist = () => navigate(de ? "/warteliste" : "/waitlist");

  return (
    <div style={{ width: "100%", maxWidth: 1080 }}>
      <div style={{
        fontFamily: "Oswald, sans-serif", fontWeight: 700, letterSpacing: "0.05em",
        fontSize: "clamp(30px,6vw,48px)", color: P.text, lineHeight: 1.05, marginBottom: 16,
      }}>
        {de ? "DEIN LEVEL." : "YOUR LEVEL."}
      </div>

      <p style={{ fontSize: 15, lineHeight: 1.8, color: P.dim, maxWidth: 620, marginBottom: 12 }}>
        {de
          ? "Drei Stufen, ein Ziel: dranbleiben. Alle Tiers sind aktuell noch nicht buchbar — trag dich auf die Warteliste ein und du bekommst als Erster Zugang, sobald es losgeht."
          : "Three tiers, one goal: staying consistent. None of these are bookable yet — join the waitlist and be first in line the moment it launches."}
      </p>

      <div style={{ width: 56, height: 3, background: P.accent, marginBottom: 36 }} />

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }}>
        {TIERS.map((tier) => (
          <TierCard
            key={tier.key}
            tier={tier}
            lang={lang}
            highlight={tier.level === 2}
            onWaitlist={goWaitlist}
          />
        ))}
      </div>

      <div style={{ marginTop: 40, fontSize: 12, color: P.dim, lineHeight: 1.7, maxWidth: 620 }}>
        {de
          ? "Preise und Funktionsumfang können sich bis zum Launch noch ändern. Wer sich früh einträgt, sichert sich als Founding Member dauerhaft 20% Rabatt."
          : "Prices and features may still change before launch. Early sign-ups lock in a permanent 20% founding member discount."}
      </div>
    </div>
  );
}
