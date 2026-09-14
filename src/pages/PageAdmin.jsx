import PlanView from "../PlanView";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

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
            ? "Testbereich für Pläne und Splits. Normale Nutzer sehen unter „Mein Plan\" den Countdown."
            : "Test area for plans and splits. Regular users see the countdown under \"My Plan\"."}
        </div>
      </div>

      <PlanView profile={profile} lang={lang} isAdmin={true} />
    </div>
  );
}
