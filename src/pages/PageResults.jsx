import { useState, useEffect } from "react";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530", bar:"#8FA06B" };
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwjNHBJN0rwqb3mjLvfHEUp58B9vNO0-B7Y1GyFNIImbc8uVeu2PI0tuXT60PhbXJe75Q/exec";

const CAT_EN = {
  "Motivation fehlt":"Lack of motivation","Zu wenig Zeit":"Not enough time","Umfeld / Freunde bremsen mich":"Environment / friends hold me back",
  "Rückschläge nach guten Phasen":"Setbacks after good phases","Impulskontrolle / schädliche Gewohnheiten":"Impulse control / harmful habits",
  "Ich weiß nicht, wo ich anfangen soll":"I don't know where to start","Sonstiges (unsortiert)":"Other (unsorted)",
  "Fast nie":"Almost never","Gelegentlich":"Occasionally","Meistens":"Mostly","Fast immer":"Almost always",
  "Gar nicht":"Not at all","Eigene Notizen-App":"My own notes app","Fitness-App":"Fitness app",
  "Freunde als Kontrolle":"Friends keeping me accountable","Hab schon einen Coach":"Already have a coach","Etwas anderes":"Something else",
  "Tägliche Erinnerung":"Daily reminder","Austausch mit Leuten, die dasselbe durchmachen":"Connecting with people going through the same",
  "Persönliches Feedback zu meiner Situation":"Personal feedback on my situation","Ein klarer Wochenplan":"A clear weekly plan","Nichts bisher":"Nothing so far",
};

function fetchCounts() {
  return new Promise(resolve => {
    const cb = "ubCb" + Date.now();
    const s = document.createElement("script");
    window[cb] = d => { resolve(d||{}); delete window[cb]; s.remove(); };
    s.onerror = () => { resolve({}); delete window[cb]; s.remove(); };
    s.src = `${SHEET_URL}?callback=${cb}`;
    document.body.appendChild(s);
  });
}

function computePct(counts, prefix, lang) {
  const entries = Object.entries(counts).filter(([k]) => k.startsWith(prefix))
    .map(([k,v]) => ({ name: lang==="en"?(CAT_EN[k.slice(prefix.length)]||k.slice(prefix.length)):k.slice(prefix.length), value:v }));
  const total = entries.reduce((s,e) => s+e.value, 0);
  if (!total) return [];
  return entries.map(e => ({ name:e.name, pct:Math.round((e.value/total)*100) })).sort((a,b) => b.pct-a.pct);
}

function ResultBlock({ title, rows, empty }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:13, color:P.accent, letterSpacing:"0.08em", marginBottom:12 }}>{title}</div>
      {rows.length===0 ? <div style={{ fontSize:12, color:P.dim }}>{empty}</div> : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {rows.map(r => (
            <div key={r.name}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3 }}>
                <span style={{ color:P.text }}>{r.name}</span><span style={{ color:P.dim }}>{r.pct}%</span>
              </div>
              <div style={{ background:P.border, borderRadius:3, height:6 }}>
                <div style={{ background:P.bar, width:`${r.pct}%`, height:6, borderRadius:3 }}/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PageResults({ lang }) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const de = lang === "de";

  useEffect(() => {
    fetchCounts().then(d => { setCounts(d); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth:600 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:32, fontWeight:700, color:P.text, marginBottom:8 }}>
        {de?"AKTUELLE AUSWERTUNG":"CURRENT RESULTS"}
      </div>
      <div style={{ fontSize:14, color:P.dim, marginBottom:32, lineHeight:1.6 }}>
        {de?"Diese Zahlen stammen direkt aus den bisher eingegangenen Antworten.":"These numbers come directly from the responses collected so far."}
      </div>
      {loading ? <div style={{ color:P.dim }}>…</div> : (
        <>
          <ResultBlock title={de?"GRÖSSTES HINDERNIS":"BIGGEST OBSTACLE"} rows={computePct(counts,"hindernis:",lang)} empty={de?"Noch keine Antworten.":"No answers yet."} />
          <ResultBlock title={de?"KONSISTENZ":"CONSISTENCY"} rows={computePct(counts,"konsistenz:",lang)} empty={de?"Noch keine Antworten.":"No answers yet."} />
          <ResultBlock title={de?"AKTUELLE METHODE":"CURRENT METHOD"} rows={computePct(counts,"methode:",lang)} empty={de?"Noch keine Antworten.":"No answers yet."} />
          <ResultBlock title={de?"WAS WÜRDE HELFEN":"WHAT WOULD HELP"} rows={computePct(counts,"hilfewunsch:",lang)} empty={de?"Noch keine Antworten.":"No answers yet."} />
        </>
      )}
    </div>
  );
}

