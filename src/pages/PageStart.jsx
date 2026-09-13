import { useNavigate } from "react-router-dom";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

export default function PageStart({ lang, session }) {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:48, fontWeight:700, color:P.text, letterSpacing:"0.04em", marginBottom:8, lineHeight:1.1 }}>
        UNBROKEN
      </div>
      <div style={{ fontSize:16, color:P.dim, marginBottom:48, lineHeight:1.6 }}>
        {lang==="de"?"Gebaut für Leute, die es leid sind, auf Motivation zu warten.":"Built for people done waiting on motivation."}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:400 }}>
        <button onClick={() => navigate(lang==="de"?"/konzept":"/concept")} style={cardStyle(false)}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:16, color:P.text, marginBottom:2 }}>
            {lang==="de"?"Explorer-Modus":"Explorer mode"}
          </div>
          <div style={{ fontSize:13, color:P.dim }}>{lang==="de"?"Erst verstehen, worum es geht":"Understand what this is first"}</div>
        </button>

        {!session && (
          <button onClick={() => navigate(lang==="de"?"/umfrage":"/survey")} style={cardStyle(true)}>
            <div style={{ fontFamily:"Oswald, sans-serif", fontSize:16, color:"#1B1E15", marginBottom:2 }}>
              {lang==="de"?"Direkt zur Umfrage":"Go straight to the survey"}
            </div>
            <div style={{ fontSize:13, color:"rgba(27,30,21,0.7)" }}>{lang==="de"?"Ohne Umwege loslegen":"No preamble, just questions"}</div>
          </button>
        )}

        <button onClick={() => navigate("/plan")} style={cardStyle(true)}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:16, color:"#1B1E15", marginBottom:2 }}>
            {lang==="de"?"Mein Plan":"My Plan"}
          </div>
          <div style={{ fontSize:13, color:"rgba(27,30,21,0.7)" }}>{lang==="de"?"Dein persönlicher Trainingsplan":"Your personal training plan"}</div>
        </button>
      </div>
    </div>
  );
}

const cardStyle = (primary) => ({
  textAlign:"left", padding:"20px 16px", borderRadius:6, width:"100%", cursor:"pointer",
  border: `1px solid ${primary?"#C9A227":"#3D4530"}`,
  background: primary ? "#C9A227" : "#2A2F22",
});

