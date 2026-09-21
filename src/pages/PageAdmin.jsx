import { useState } from "react";
import PlanView from "../PlanView";
import { supabase } from "../supabase";
import { TIERS } from "../tiers";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

function SimulateUserView({ profile, lang }) {
  const de = lang === "de";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const activeTier = profile?.tier || 0;

  const startSimulation = async (level) => {
    const warn = de
      ? "Das setzt deine eigenen Onboarding-Antworten (Trainingslevel, Ziel, Tage/Woche) auf diesem Account zurück, damit du den echten Ablauf durchläufst. Fortfahren?"
      : "This resets your own onboarding answers (training level, goal, days/week) on this account so you go through the real flow. Continue?";
    if (!window.confirm(warn)) return;

    setBusy(true); setErr(null);
    const { error } = await supabase.from("profiles").update({
      tier: level,
      training_level: null,
      equipment: null,
      days_per_week: null,
      goal: null,
    }).eq("id", profile.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    // Harter Reload, damit main.jsx das Profil neu laedt und den Onboarding-Flow zeigt
    window.location.href = "/";
  };

  const endSimulation = async () => {
    setBusy(true); setErr(null);
    const { error } = await supabase.from("profiles").update({ tier: 0 }).eq("id", profile.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    window.location.href = "/admin";
  };

  return (
    <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20, marginBottom:24 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:11, color:P.accent, letterSpacing:"0.12em", marginBottom:4 }}>
        {de ? "NUTZER-ANSICHT SIMULIEREN" : "SIMULATE USER VIEW"}
      </div>
      <div style={{ fontSize:12, color:P.dim, lineHeight:1.6, marginBottom:16 }}>
        {de
          ? "Simuliert komplett, wie ein frisch abonnierter Nutzer die App erlebt: Tier wählen → echter Onboarding-Flow → normale Oberfläche mit den für dieses Tier freigeschalteten Inhalten."
          : "Fully simulates how a freshly subscribed user experiences the app: pick a tier → real onboarding flow → normal interface with the content unlocked for that tier."}
      </div>

      {activeTier > 0 ? (
        <div>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:13, color:P.accent, letterSpacing:"0.04em", marginBottom:12 }}>
            {de ? `AKTIVE SIMULATION: TIER ${activeTier}` : `ACTIVE SIMULATION: TIER ${activeTier}`}
          </div>
          <button onClick={endSimulation} disabled={busy} style={{
            padding:"10px 18px", borderRadius:4, cursor: busy ? "default" : "pointer",
            border:`1px solid ${P.border}`, background:"transparent", color:P.dim,
            fontFamily:"Inter, sans-serif", fontSize:13, opacity: busy ? 0.6 : 1,
          }}>
            {de ? "Simulation beenden" : "End simulation"}
          </button>
        </div>
      ) : (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {TIERS.map((t) => (
            <button key={t.level} disabled={busy} onClick={() => startSimulation(t.level)} style={{
              padding:"10px 16px", borderRadius:4, cursor: busy ? "default" : "pointer",
              border:`1px solid ${P.accent}`, background:"transparent", color:P.accent,
              fontFamily:"Inter, sans-serif", fontSize:13, fontWeight:600,
              opacity: busy ? 0.6 : 1,
            }}>
              {de ? "Simulieren als" : "Simulate as"} {t.name}
            </button>
          ))}
        </div>
      )}

      {err && <div style={{ marginTop:12, fontSize:12, color:"#E05252" }}>{err}</div>}
    </div>
  );
}

export default function PageAdmin({ lang, session, profile }) {
  const de = lang === "de";

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
            ? "Testbereich für Pläne und Splits. Normale Nutzer sehen unter „Mein Bereich\" den Countdown."
            : "Test area for plans and splits. Regular users see the countdown under \"My Area\"."}
        </div>
      </div>

      <SimulateUserView profile={profile} lang={lang} />

      <PlanView profile={profile} lang={lang} isAdmin={true} />
    </div>
  );
}
