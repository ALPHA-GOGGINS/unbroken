import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530", bar:"#8FA06B" };
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwjNHBJN0rwqb3mjLvfHEUp58B9vNO0-B7Y1GyFNIImbc8uVeu2PI0tuXT60PhbXJe75Q/exec";

const CAT_RULES = [
  { keywords:["zeit","schule","job","arbeit","stress"], cat:"Zu wenig Zeit" },
  { keywords:["motiv","lust"], cat:"Motivation fehlt" },
  { keywords:["freund","umfeld","familie","eltern"], cat:"Umfeld / Freunde bremsen mich" },
  { keywords:["rückschlag","aufgehört","abgebrochen","aufgegeben"], cat:"Rückschläge nach guten Phasen" },
  { keywords:["plan","struktur","system","routine"], cat:"Struktur / kein fester Plan" },
  { keywords:["schlaf","müde","energie"], cat:"Schlaf / Energielevel" },
  { keywords:["zweifel","selbstvertrauen","unsicher","angst"], cat:"Selbstzweifel" },
];
function categorise(text) {
  const lower = text.toLowerCase();
  const match = CAT_RULES.find(r => r.keywords.some(k => lower.includes(k)));
  return match ? match.cat : "Sonstiges (unsortiert)";
}

function recordBatch(keys) {
  return new Promise(resolve => {
    const cb = "ubBatch" + Date.now();
    const s = document.createElement("script");
    window[cb] = d => { resolve(d||{}); delete window[cb]; s.remove(); };
    s.onerror = () => { resolve({}); delete window[cb]; s.remove(); };
    s.src = `${SHEET_URL}?data=${encodeURIComponent(JSON.stringify(keys))}&callback=${cb}`;
    document.body.appendChild(s);
  });
}

const Q1 = [
  { id:"motivation", sl:"Motivation fehlt", de:"Motivation fehlt", en:"Lack of motivation" },
  { id:"zeit", sl:"Zu wenig Zeit", de:"Zu wenig Zeit", en:"Not enough time" },
  { id:"umfeld", sl:"Umfeld / Freunde bremsen mich", de:"Umfeld / Freunde bremsen mich", en:"Environment / friends hold me back" },
  { id:"rueckschlaege", sl:"Rückschläge nach guten Phasen", de:"Rückschläge nach guten Phasen", en:"Setbacks after good phases" },
  { id:"impulskontrolle", sl:"Impulskontrolle / schädliche Gewohnheiten", de:"Impulskontrolle / schädliche Gewohnheiten", en:"Impulse control / harmful habits" },
  { id:"orientierung", sl:"Ich weiß nicht, wo ich anfangen soll", de:"Ich weiß nicht, wo ich anfangen soll", en:"I don't know where to start" },
  { id:"sonstiges", sl:null, de:"Etwas anderes …", en:"Something else …" },
];
const Q2 = [
  { id:"fast_nie", sl:"Fast nie", de:"Fast nie", en:"Almost never" },
  { id:"gelegentlich", sl:"Gelegentlich", de:"Gelegentlich", en:"Occasionally" },
  { id:"meistens", sl:"Meistens", de:"Meistens", en:"Mostly" },
  { id:"fast_immer", sl:"Fast immer", de:"Fast immer", en:"Almost always" },
];
const Q3 = [
  { id:"nichts", sl:"Gar nicht", de:"Gar nicht", en:"Not at all" },
  { id:"notizen", sl:"Eigene Notizen-App", de:"Eigene Notizen-App", en:"My own notes app" },
  { id:"fitnessapp", sl:"Fitness-App", de:"Fitness-App", en:"Fitness app" },
  { id:"freunde", sl:"Freunde als Kontrolle", de:"Freunde als Kontrolle", en:"Friends keeping me accountable" },
  { id:"coach", sl:"Hab schon einen Coach", de:"Hab schon einen Coach", en:"Already have a coach" },
  { id:"anderes3", sl:"Etwas anderes", de:"Etwas anderes", en:"Something else" },
];
const Q4 = [
  { id:"erinnerung", sl:"Tägliche Erinnerung", de:"Tägliche Erinnerung", en:"Daily reminder" },
  { id:"austausch", sl:"Austausch mit Leuten, die dasselbe durchmachen", de:"Austausch mit Leuten, die dasselbe durchmachen", en:"Connecting with people going through the same" },
  { id:"feedback", sl:"Persönliches Feedback zu meiner Situation", de:"Persönliches Feedback zu meiner Situation", en:"Personal feedback on my situation" },
  { id:"wochenplan", sl:"Ein klarer Wochenplan", de:"Ein klarer Wochenplan", en:"A clear weekly plan" },
  { id:"anderes4", sl:"Etwas anderes", de:"Etwas anderes", en:"Something else" },
];
const Q6 = [
  { id:"u16", sl:"Unter 16", de:"Unter 16", en:"Under 16" },
  { id:"16_20", sl:"16–20", de:"16–20", en:"16–20" },
  { id:"21_30", sl:"21–30", de:"21–30", en:"21–30" },
  { id:"ueber_30", sl:"Über 30", de:"Über 30", en:"Over 30" },
];

const QUOTES = {
  motivation: { de:"Motivation ist langfristig nichts wert! Disziplin ist die Lösung.", en:"Motivation is crap. Discipline is the solution." },
  zeit:       { de:"Jeder hat Zeit für das, was ihm wirklich wichtig ist.", en:"Everyone has time for what truly matters to them." },
  umfeld:     { de:"Dein Umfeld testet dich nicht – es zeigt dir, wo du stehst.", en:"Your environment doesn't test you — it shows you where you stand." },
  rueckschlaege: { de:"Ein Rückschlag ist kein Ende, nur eine neue Startlinie.", en:"A setback isn't an end, just a new starting line." },
  impulskontrolle: { de:"Kontrolle beginnt in dem Moment, in dem es am schwersten ist.", en:"Control begins in the exact moment it's hardest." },
  orientierung: { de:"Du musst nicht wissen, wohin – nur, dass du losgehst.", en:"You don't need to know where — just that you're moving." },
};

function OptionBtn({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{ textAlign:"left", padding:"12px 14px", borderRadius:4, width:"100%", border:`1px solid ${selected?P.accent:P.border}`, background:selected?"rgba(201,162,39,0.12)":"transparent", color:P.text, fontFamily:"Inter, sans-serif", fontSize:14, cursor:"pointer", marginBottom:8 }}>
      {label}
    </button>
  );
}

const DEVICE_KEY = "ub_survey_done";

export default function PageSurvey({ lang, session, profile }) {
  const navigate  = useNavigate();
  const de        = lang === "de";

  // null = wird noch geprüft, true/false = Ergebnis
  const [alreadyDone, setAlreadyDone] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      // 1. Gerät
      let device = false;
      try { device = localStorage.getItem(DEVICE_KEY) === "1"; } catch (e) {}
      if (device) { if (!cancelled) setAlreadyDone(true); return; }

      // 2. Account – frisch aus Supabase, nicht aus veraltetem Prop
      if (session?.user?.id) {
        const { data } = await supabase
          .from("profiles").select("survey_done").eq("id", session.user.id).maybeSingle();
        if (!cancelled) setAlreadyDone(!!data?.survey_done);
        return;
      }

      if (!cancelled) setAlreadyDone(false);
    };

    check();
    return () => { cancelled = true; };
  }, [session]);
  const [step, setStep]     = useState(0);
  const [q1, setQ1]         = useState(null);
  const [q1Other, setQ1Other] = useState("");
  const [q2, setQ2]         = useState(null);
  const [q3, setQ3]         = useState(null);
  const [q4, setQ4]         = useState(null);
  const [q5, setQ5]         = useState("");
  const [q5None, setQ5None] = useState(false);
  const [age, setAge]       = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]     = useState(false);

  const canAdvance = () => {
    if (step===0) return q1 && (q1!=="sonstiges" || q1Other.trim().length>0);
    if (step===1) return !!q2;
    if (step===2) return !!q3;
    if (step===3) return !!q4;
    if (step===4) return q5None || q5.trim().length>0;
    if (step===5) return !!age;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const keys = [];
    keys.push(q1==="sonstiges" ? `hindernis:${categorise(q1Other)}` : `hindernis:${Q1.find(o=>o.id===q1)?.sl}`);
    keys.push(`konsistenz:${Q2.find(o=>o.id===q2)?.sl}`);
    keys.push(`methode:${Q3.find(o=>o.id===q3)?.sl}`);
    keys.push(`hilfewunsch:${Q4.find(o=>o.id===q4)?.sl}`);
    keys.push(q5None?"hilft:Nichts bisher":`hilft:${categorise(q5)}`);
    keys.push(`alter:${Q6.find(o=>o.id===age)?.sl}`);
    setDone(true);
    setSubmitting(false);
    try { localStorage.setItem(DEVICE_KEY, "1"); } catch (e) { /* private mode */ }

    if (session?.user?.id) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ survey_done: true })
        .eq("id", session.user.id)
        .select();
      console.log("[UMFRAGE] user:", session.user.id);
      console.log("[UMFRAGE] fehler:", error);
      console.log("[UMFRAGE] geaenderte zeilen:", data);
    } else {
      console.log("[UMFRAGE] keine session beim absenden");
    }

    recordBatch(keys);
  };

  const questions = [
    de?"Was bremst dich am meisten, an deinem Ziel dranzubleiben?":"What holds you back most from sticking to your goal?",
    de?"Wie oft schaffst du es, an deinem Ziel dranzubleiben?":"How often do you manage to stay consistent with your goal?",
    de?"Wie versuchst du aktuell, dranzubleiben?":"How do you currently try to stay consistent?",
    de?"Was würde dir am meisten helfen?":"What would help you most?",
    de?"Was hat dir bisher am meisten geholfen – falls überhaupt etwas?":"What has helped you most so far, if anything?",
    de?"Wie alt bist du ungefähr?":"About how old are you?",
  ];

  if (alreadyDone === null && !done) return (
    <div style={{ color:P.dim, fontSize:13 }}>…</div>
  );

  if (alreadyDone && !done) return (
    <div style={{ maxWidth:480 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:32, color:P.text, marginBottom:12 }}>
        {de?"Schon erledigt.":"Already done."}
      </div>
      <div style={{ width:40, height:2, background:P.accent, marginBottom:20 }}/>
      <div style={{ fontSize:14, color:P.dim, marginBottom:28, lineHeight:1.7 }}>
        {de
          ? "Die Umfrage kann pro Konto und Gerät nur einmal ausgefüllt werden. So bleiben die Ergebnisse aussagekräftig."
          : "The survey can only be filled out once per account and device. That keeps the results meaningful."}
      </div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <button onClick={() => navigate(de?"/ergebnisse":"/results")} style={{ background:P.accent, border:"none", color:"#1B1E15", padding:"12px 22px", borderRadius:4, fontSize:14, fontWeight:700, fontFamily:"Inter, sans-serif", cursor:"pointer" }}>
          {de?"Ergebnisse ansehen":"View results"}
        </button>
        <button onClick={() => navigate("/plan")} style={{ background:"transparent", border:`1px solid ${P.border}`, color:P.dim, padding:"12px 22px", borderRadius:4, fontSize:14, fontFamily:"Inter, sans-serif", cursor:"pointer" }}>
          {de?"Zu meinem Plan":"Go to my plan"}
        </button>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ maxWidth:480 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:32, color:P.text, marginBottom:12 }}>{de?"Danke.":"Thanks."}</div>
      <div style={{ fontSize:14, color:P.dim, marginBottom:24, lineHeight:1.6 }}>
        {de?"Deine Antwort wurde anonym gespeichert.":"Your answer was recorded anonymously."}
      </div>
      <button onClick={() => navigate("/plan")} style={{ background:P.accent, border:"none", color:"#1B1E15", padding:"12px 24px", borderRadius:4, fontSize:14, fontWeight:700, fontFamily:"Inter, sans-serif", cursor:"pointer" }}>
        {de?"→ Mein Plan":"→ My Plan"}
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth:480 }}>
      {/* Progress */}
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {[0,1,2,3,4,5].map(i => <div key={i} style={{ height:3, flex:1, borderRadius:2, background:i<=step?P.accent:P.border }}/>)}
      </div>

      <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:24 }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:18, fontWeight:600, marginBottom:16, lineHeight:1.3, color:P.text }}>
          {questions[step]}
        </div>

        {step===0 && <>
          {Q1.map(opt => <OptionBtn key={opt.id} label={opt[lang]} selected={q1===opt.id} onClick={() => setQ1(opt.id)}/>)}
          {q1 && q1!=="sonstiges" && QUOTES[q1] && <div style={{ fontStyle:"italic", color:P.accent, fontSize:13, marginTop:4 }}>"{QUOTES[q1][lang]}"</div>}
          {q1==="sonstiges" && <textarea value={q1Other} onChange={e=>setQ1Other(e.target.value)} placeholder={de?"Kurz in eigenen Worten – bitte keine persönlichen Details.":"Briefly in your own words — no personal details please."} style={{ width:"100%", background:"#1B1E15", border:`1px solid ${P.border}`, borderRadius:4, padding:10, color:P.text, fontFamily:"Inter, sans-serif", fontSize:14, resize:"vertical", boxSizing:"border-box" }} rows={2}/>}
        </>}
        {step===1 && Q2.map(opt => <OptionBtn key={opt.id} label={opt[lang]} selected={q2===opt.id} onClick={() => setQ2(opt.id)}/>)}
        {step===2 && Q3.map(opt => <OptionBtn key={opt.id} label={opt[lang]} selected={q3===opt.id} onClick={() => setQ3(opt.id)}/>)}
        {step===3 && Q4.map(opt => <OptionBtn key={opt.id} label={opt[lang]} selected={q4===opt.id} onClick={() => setQ4(opt.id)}/>)}
        {step===4 && <>
          <textarea value={q5} onChange={e=>{setQ5(e.target.value);if(e.target.value.trim())setQ5None(false);}} placeholder={de?"Freiwillig – keine persönlichen Details.":"Optional — no personal details."} style={{ width:"100%", background:"#1B1E15", border:`1px solid ${P.border}`, borderRadius:4, padding:10, color:P.text, fontFamily:"Inter, sans-serif", fontSize:14, resize:"vertical", boxSizing:"border-box", marginBottom:8 }} rows={3} disabled={q5None}/>
          <OptionBtn label={de?"Hat mir bisher nichts geholfen":"Nothing has helped me so far"} selected={q5None} onClick={() => {setQ5None(v=>!v);setQ5("");}}/>
        </>}
        {step===5 && Q6.map(opt => <OptionBtn key={opt.id} label={opt[lang]} selected={age===opt.id} onClick={() => setAge(opt.id)}/>)}

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:20 }}>
          <button onClick={() => setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{ background:"transparent", border:`1px solid ${P.border}`, color:P.dim, padding:"10px 18px", borderRadius:4, fontSize:14, fontFamily:"Inter, sans-serif", cursor:step===0?"default":"pointer", opacity:step===0?0.3:1 }}>
            {de?"Zurück":"Back"}
          </button>
          {step<5 ? (
            <button onClick={() => canAdvance()&&setStep(s=>s+1)} disabled={!canAdvance()} style={{ background:P.accent, border:"none", color:"#1B1E15", padding:"10px 22px", borderRadius:4, fontSize:14, fontWeight:700, fontFamily:"Inter, sans-serif", cursor:canAdvance()?"pointer":"default", opacity:canAdvance()?1:0.4 }}>
              {de?"Weiter":"Next"}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canAdvance()||submitting} style={{ background:P.accent, border:"none", color:"#1B1E15", padding:"10px 22px", borderRadius:4, fontSize:14, fontWeight:700, fontFamily:"Inter, sans-serif", cursor:canAdvance()&&!submitting?"pointer":"default", opacity:canAdvance()&&!submitting?1:0.4 }}>
              {submitting?"...":(de?"Absenden":"Submit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
