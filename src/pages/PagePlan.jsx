import { useNavigate } from "react-router-dom";
import PlanView from "../PlanView";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

export default function PagePlan({ lang, session, profile }) {
  const navigate = useNavigate();

  if (!session) return (
    <div style={{ maxWidth:400 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:48, fontWeight:700, color:P.accent, letterSpacing:"0.06em", lineHeight:1 }}>COMING</div>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:48, fontWeight:700, color:P.text, letterSpacing:"0.06em", marginBottom:24 }}>SOON.</div>
      <div style={{ width:60, height:2, background:P.accent, marginBottom:24 }}/>
      <div style={{ fontSize:14, color:P.dim, lineHeight:1.7, marginBottom:32 }}>
        {lang==="de"?"Erstelle jetzt ein kostenloses Konto und sei einer der ersten, der Zugriff auf seinen persönlichen Plan erhält.":"Create a free account now and be one of the first to get access to your personal plan."}
      </div>
      <button onClick={() => navigate("/login")} style={{ background:P.accent, border:"none", color:"#1B1E15", padding:"14px 32px", borderRadius:4, fontSize:15, fontWeight:700, fontFamily:"Inter, sans-serif", cursor:"pointer", letterSpacing:"0.04em" }}>
        {lang==="de"?"KONTO ERSTELLEN / ANMELDEN":"CREATE ACCOUNT / SIGN IN"}
      </button>
    </div>
  );

  if (!profile?.is_admin) return (
    <div style={{ maxWidth:400 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:48, fontWeight:700, color:P.accent, letterSpacing:"0.06em", lineHeight:1 }}>COMING</div>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:48, fontWeight:700, color:P.text, letterSpacing:"0.06em", marginBottom:24 }}>SOON.</div>
      <div style={{ width:60, height:2, background:P.accent, marginBottom:24 }}/>
      <div style={{ fontSize:14, color:P.dim, lineHeight:1.7 }}>
        {lang==="de"?"Dein persönlicher Trainingsplan wird entwickelt. Du wirst einer der ersten sein, der ihn erhält.":"Your personal training plan is being developed. You'll be one of the first to receive it."}
      </div>
      <div style={{ marginTop:32, display:"inline-block", padding:"8px 20px", border:`1px solid ${P.border}`, borderRadius:4, fontSize:12, color:P.dim, fontFamily:"Oswald, sans-serif", letterSpacing:"0.08em" }}>EARLY ALPHA</div>
    </div>
  );

  return <PlanView profile={profile} lang={lang} isAdmin={profile?.is_admin} />;
}

