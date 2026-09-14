import { useNavigate } from "react-router-dom";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

export default function PageStart({ lang, session }) {
  const navigate = useNavigate();
  const de = lang === "de";
  const desktop = window.innerWidth >= 900;

  return (
    <div style={{ maxWidth: desktop ? 720 : 480 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize: desktop ? 88 : 52, fontWeight:700, color:P.text, letterSpacing:"0.04em", lineHeight:1, marginBottom:20 }}>
        UNBROKEN
      </div>

      <div style={{ fontSize: desktop ? 20 : 16, color:P.text, lineHeight:1.6, marginBottom:16, maxWidth:520 }}>
        {de
          ? "Gebaut für Leute, die es leid sind, auf Motivation zu warten."
          : "Built for people done waiting on motivation."}
      </div>

      <div style={{ fontSize: desktop ? 15 : 14, color:P.dim, lineHeight:1.8, marginBottom:36, maxWidth:520 }}>
        {de
          ? "Disziplin ist kein Talent. Sie ist eine Entscheidung, die du jeden Tag neu triffst. Unbroken gibt dir die Struktur dafür – kein Hype, keine leeren Versprechen."
          : "Discipline isn't a talent. It's a decision you make again every single day. Unbroken gives you the structure for it — no hype, no empty promises."}
      </div>

      <div style={{ width:48, height:3, background:P.accent, marginBottom:36 }}/>

      <button onClick={() => navigate("/plan")} style={{
        textAlign:"left", padding:"20px 24px", borderRadius:6,
        cursor:"pointer", border:"1px solid #C9A227", background:"#C9A227",
        minWidth: desktop ? 320 : "100%",
      }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize: desktop ? 20 : 17, color:"#1B1E15", marginBottom:4, letterSpacing:"0.03em" }}>
          {de ? "JETZT STARTEN" : "START NOW"}
        </div>
        <div style={{ fontSize:13, color:"rgba(27,30,21,0.7)" }}>
          {de ? "Dein persönlicher Trainingsplan" : "Your personal training plan"}
        </div>
      </button>

      <div style={{ marginTop:48, fontSize:11, color:P.dim, letterSpacing:"0.08em", fontFamily:"Oswald, sans-serif" }}>
        EARLY ALPHA · {de ? "DISZIPLIN. KEIN PUDER." : "DISCIPLINE. NO SUGARCOAT."}
      </div>
    </div>
  );
}

