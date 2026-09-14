import { useNavigate } from "react-router-dom";

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

export default function PagePlan({ lang, session }) {
  const navigate = useNavigate();
  const de = lang === "de";

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

      {!session && (
        <div>
          <div style={{ fontSize:14, color:P.dim, lineHeight:1.7, marginBottom:16, maxWidth:440 }}>
            {de
              ? "Erstelle jetzt ein kostenloses Konto – dann bist du dabei, sobald es losgeht."
              : "Create a free account now — then you're in the moment it launches."}
          </div>
          <button onClick={() => navigate("/login")} style={{
            background:P.accent, border:"none", color:"#1B1E15",
            padding:"14px 28px", borderRadius:4, fontSize:14, fontWeight:700,
            fontFamily:"Inter, sans-serif", cursor:"pointer", letterSpacing:"0.04em",
          }}>
            {de ? "KONTO ERSTELLEN / ANMELDEN" : "CREATE ACCOUNT / SIGN IN"}
          </button>
        </div>
      )}
    </div>
  );
}
