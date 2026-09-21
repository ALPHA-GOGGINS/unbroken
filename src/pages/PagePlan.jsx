import WaitlistForm from "../WaitlistForm";
import PlanView from "../PlanView";
import { featuresUpToTier } from "../tiers";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

function CountdownBox({ value, label }) {
  return (
    <div style={{
      background:P.panel, border:`1px solid ${P.border}`, borderRadius:6,
      padding:"18px 12px", textAlign:"center", minWidth:78, flex:"1 1 78px", maxWidth:120,
    }}>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontWeight:700,
        fontSize:"clamp(26px, 5vw, 38px)", lineHeight:1,
        color:P.dim, opacity:0.45, marginBottom:6,
      }}>{value}</div>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontSize:10, letterSpacing:"0.12em",
        color:P.dim, opacity:0.6,
      }}>{label}</div>
    </div>
  );
}

// Features, die schon als echter Bildschirm existieren (PlanView) und deshalb
// nicht nochmal als "wird gebaut"-Platzhalter unten aufgelistet werden sollen.
const BUILT_FEATURE_IDS = ["training_plan", "day_unlock", "basic_streak"];

export default function PagePlan({ lang, session, profile }) {
  const de = lang === "de";
  const tier = profile?.tier || 0;

  // Eingeloggter Nutzer mit aktivem (oder simuliertem) Tier -> echte Oberfläche
  if (session && tier > 0) {
    const extraFeatures = featuresUpToTier(tier).filter(f => !BUILT_FEATURE_IDS.includes(f.id));

    return (
      <div style={{ width:"100%" }}>
        <div style={{
          fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.05em",
          fontSize:"clamp(28px,5vw,40px)", color:P.text, marginBottom:6,
        }}>
          {de ? "MEIN BEREICH" : "MY AREA"}
        </div>
        <div style={{
          fontFamily:"Oswald, sans-serif", fontSize:12, letterSpacing:"0.1em",
          color:P.accent, marginBottom:28,
        }}>
          {de ? `AKTIVES TIER: ${tier}` : `ACTIVE TIER: ${tier}`}
        </div>

        <PlanView profile={profile} lang={lang} isAdmin={false} />

        {extraFeatures.length > 0 && (
          <div style={{ marginTop:36 }}>
            <div style={{ fontFamily:"Oswald, sans-serif", fontSize:15, color:P.text, marginBottom:14 }}>
              {de ? "Weitere freigeschaltete Inhalte" : "Other unlocked content"}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {extraFeatures.map((f) => (
                <div key={f.id} style={{
                  background:P.panel, border:`1px solid ${P.border}`, borderRadius:6,
                  padding:"14px 16px", display:"flex", justifyContent:"space-between",
                  alignItems:"center", gap:12, flexWrap:"wrap",
                }}>
                  <span style={{ fontSize:14, color:P.text }}>{f[lang]}</span>
                  <span style={{
                    fontSize:11, color:P.dim, border:`1px solid ${P.border}`, borderRadius:4,
                    padding:"3px 8px", fontFamily:"Oswald, sans-serif", letterSpacing:"0.06em",
                  }}>
                    {de ? "WIRD GEBAUT" : "IN PROGRESS"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Ausgeloggt oder kein aktives Tier -> Coming Soon + Warteliste
  const units = de
    ? [["--","TAGE"],["--","STUNDEN"],["--","MINUTEN"]]
    : [["--","DAYS"],["--","HOURS"],["--","MINUTES"]];

  return (
    <div style={{ maxWidth:600, width:"100%" }}>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.06em",
        fontSize:"clamp(40px, 8vw, 64px)", lineHeight:1, color:P.accent,
      }}>COMING</div>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.06em",
        fontSize:"clamp(40px, 8vw, 64px)", lineHeight:1, color:P.text, marginBottom:24,
      }}>SOON.</div>

      <div style={{ width:56, height:3, background:P.accent, marginBottom:28 }}/>

      <div style={{ fontSize:15, color:P.dim, lineHeight:1.7, marginBottom:32, maxWidth:460 }}>
        {de
          ? "Der Trainingsplan wird gerade fertiggestellt. Sobald das Startdatum feststeht, läuft hier der Countdown bis zum Launch."
          : "The training plan is being finalised. Once the launch date is set, the countdown will run right here."}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {units.map(([v,l]) => <CountdownBox key={l} value={v} label={l} />)}
      </div>

      <div style={{
        display:"inline-block", padding:"8px 16px", borderRadius:4,
        border:`1px solid ${P.border}`, background:"rgba(201,162,39,0.06)",
        fontFamily:"Oswald, sans-serif", fontSize:11, letterSpacing:"0.1em", color:P.accent,
        marginBottom:32,
      }}>
        {de ? "COUNTDOWN GEHT BALD LIVE" : "COUNTDOWN GOES LIVE SOON"}
      </div>

      <div style={{ borderTop:`1px solid ${P.border}`, paddingTop:32, marginTop:8 }}>
        <WaitlistForm lang={lang} session={session} compact />
      </div>
    </div>
  );
}
