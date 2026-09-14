import { useNavigate } from "react-router-dom";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

export default function PageStart({ lang, session }) {
  const navigate = useNavigate();
  const de = lang === "de";

  return (
    <div style={{ maxWidth:480 }}>
      {/* Hero */}
      <div style={{ marginBottom:40 }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:52, fontWeight:700, color:P.text, letterSpacing:"0.04em", lineHeight:1, marginBottom:12 }}>
          UNBROKEN
        </div>
        <div style={{ fontSize:15, color:P.dim, lineHeight:1.7, marginBottom:4 }}>
          {de?"Gebaut für Leute, die es leid sind, auf Motivation zu warten.":"Built for people done waiting on motivation."}
        </div>
        <div style={{ width:40, height:2, background:P.accent, marginTop:16 }}/>
      </div>

      {/* CTAs */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <button onClick={() => navigate("/plan")} style={primaryBtn}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:17, color:"#1B1E15", marginBottom:2, letterSpacing:"0.02em" }}>
            {de?"MEIN PLAN":"MY PLAN"}
          </div>
          <div style={{ fontSize:12, color:"rgba(27,30,21,0.65)" }}>
            {de?"Dein persönlicher Trainingsplan":"Your personal training plan"}
          </div>
        </button>

        <button onClick={() => navigate(de?"/konzept":"/concept")} style={secondaryBtn}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:15, color:P.text, marginBottom:2 }}>
            {de?"KONZEPT":"CONCEPT"}
          </div>
          <div style={{ fontSize:12, color:P.dim }}>
            {de?"Erst verstehen, worum es geht":"Understand what this is first"}
          </div>
        </button>

        {!session && (
          <button onClick={() => navigate(de?"/umfrage":"/survey")} style={secondaryBtn}>
            <div style={{ fontFamily:"Oswald, sans-serif", fontSize:15, color:P.text, marginBottom:2 }}>
              {de?"UMFRAGE":"SURVEY"}
            </div>
            <div style={{ fontSize:12, color:P.dim }}>
              {de?"Direkt loslegen, ohne Umwege":"No preamble, just questions"}
            </div>
          </button>
        )}

        <button onClick={() => navigate(de?"/manifest":"/manifesto")} style={secondaryBtn}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:15, color:P.text, marginBottom:2 }}>
            {de?"MANIFEST":"MANIFESTO"}
          </div>
          <div style={{ fontSize:12, color:P.dim }}>
            {de?"Wofür wir stehen":"What we stand for"}
          </div>
        </button>
      </div>

      {/* Tag */}
      <div style={{ marginTop:40, fontSize:11, color:P.dim, letterSpacing:"0.06em", fontFamily:"Oswald, sans-serif" }}>
        EARLY ALPHA · {de?"DISZIPLIN. KEIN PUDER.":"DISCIPLINE. NO SUGARCOAT."}
      </div>
    </div>
  );
}

const primaryBtn = {
  textAlign:"left", padding:"18px 16px", borderRadius:6, width:"100%",
  cursor:"pointer", border:"1px solid #C9A227", background:"#C9A227",
};
const secondaryBtn = {
  textAlign:"left", padding:"16px 16px", borderRadius:6, width:"100%",
  cursor:"pointer", border:"1px solid #3D4530", background:"#2A2F22",
};
