import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import PlanView from "./PlanView";

// ── Design tokens ─────────────────────────────────────────────────────────────
const P = {
  bg: "#20241C", panel: "#2A2F22", border: "#3D4530",
  text: "#EEEAE0", dim: "#A9AD9C", accent: "#C9A227", bar: "#8FA06B",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const btnPrimary = {
  background: P.accent, border: "none", color: "#1B1E15",
  padding: "10px 22px", borderRadius: 4, fontSize: 14,
  fontWeight: 600, fontFamily: "Inter, sans-serif", cursor: "pointer",
};
const btnNav = {
  background: "transparent", border: `1px solid ${P.border}`,
  color: P.dim, padding: "10px 18px", borderRadius: 4,
  fontSize: 14, fontFamily: "Inter, sans-serif", cursor: "pointer",
};
const inputStyle = {
  width: "100%", background: "#1B1E15", border: `1px solid ${P.border}`,
  borderRadius: 4, padding: "10px 12px", color: P.text,
  fontFamily: "Inter, sans-serif", fontSize: 14, boxSizing: "border-box",
};
const taStyle = {
  marginTop: 4, width: "100%", background: "#1B1E15",
  border: `1px solid ${P.border}`, borderRadius: 4, padding: 10,
  color: P.text, fontFamily: "Inter, sans-serif", fontSize: 14,
  resize: "vertical", boxSizing: "border-box",
};

// ── Page setup ────────────────────────────────────────────────────────────────
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById("unbroken-fonts")) return;
  const link = document.createElement("link");
  link.id = "unbroken-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

function ensurePageStyle() {
  if (typeof document === "undefined") return;
  document.documentElement.style.height = "100%";
  document.body.style.margin = "0";
  document.body.style.minHeight = "100vh";
  document.body.style.background = P.bg;
  const root = document.getElementById("root");
  if (root) root.style.minHeight = "100vh";
}

function ensureAnimations() {
  if (typeof document === "undefined") return;
  if (document.getElementById("unbroken-anim")) return;
  const style = document.createElement("style");
  style.id = "unbroken-anim";
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
    @keyframes scanline { 0%{transform:translateY(-100%);} 100%{transform:translateY(100vh);} }
    @keyframes arrowBounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(5px);} }
    .fade-up   { animation: fadeUp 0.5s ease both; }
    .fade-up-2 { animation: fadeUp 0.5s ease 0.15s both; }
    .fade-up-3 { animation: fadeUp 0.5s ease 0.30s both; }
    .fade-in   { animation: fadeIn 0.4s ease both; }
    .survey-enter { animation: fadeUp 0.4s ease both; }
  `;
  document.head.appendChild(style);
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function useTypewriter(text, speed = 60) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

// ── Cinematc Intro ────────────────────────────────────────────────────────────
function CinematicIntro({ onDone }) {
  const [phase, setPhase] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const lines = ["NO EXCUSES.", "NO SHORTCUTS.", "UNBROKEN."];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setReady(true), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleClick = () => { setLeaving(true); setTimeout(() => onDone(), 600); };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0D0F0A",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16, zIndex: 999,
      transform: leaving ? "translateY(-100vh)" : "translateY(0)",
      transition: leaving ? "transform 0.6s cubic-bezier(0.7,0,0.3,1)" : "none",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "rgba(201,162,39,0.25)",
        animation: "scanline 1.5s linear infinite", pointerEvents: "none",
      }} />
      {lines.map((line, i) => (
        <div key={i} style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: i === 2 ? 42 : 22, fontWeight: 700, letterSpacing: "0.12em",
          color: i === 2 ? P.accent : P.text,
          opacity: phase > i ? 1 : 0,
          transform: phase > i ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>{line}</div>
      ))}
      <button onClick={handleClick} style={{
        marginTop: 32, background: "transparent", border: `1px solid ${P.accent}`,
        borderRadius: "50%", width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: ready ? "pointer" : "default",
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        animation: ready ? "arrowBounce 1s ease-in-out infinite" : "none",
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3 L10 17 M4 11 L10 17 L16 11" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ── Category translations ──────────────────────────────────────────────────────
const CAT_EN = {
  "Motivation fehlt": "Lack of motivation",
  "Zu wenig Zeit": "Not enough time",
  "Umfeld / Freunde bremsen mich": "Environment / friends hold me back",
  "Rückschläge nach guten Phasen": "Setbacks after good phases",
  "Impulskontrolle / schädliche Gewohnheiten": "Impulse control / harmful habits",
  "Ich weiß nicht, wo ich anfangen soll": "I don't know where to start",
  "Sonstiges (unsortiert)": "Other (unsorted)",
  "Fast nie": "Almost never",
  "Gelegentlich": "Occasionally",
  "Meistens": "Mostly",
  "Fast immer": "Almost always",
  "Gar nicht": "Not at all",
  "Eigene Notizen-App": "My own notes app",
  "Fitness-App": "Fitness app",
  "Freunde als Kontrolle": "Friends keeping me accountable",
  "Hab schon einen Coach": "Already have a coach",
  "Etwas anderes": "Something else",
  "Tägliche Erinnerung": "Daily reminder",
  "Austausch mit Leuten, die dasselbe durchmachen": "Connecting with people going through the same",
  "Persönliches Feedback zu meiner Situation": "Personal feedback on my situation",
  "Ein klarer Wochenplan": "A clear weekly plan",
  "Nichts bisher": "Nothing so far",
  "Struktur / kein fester Plan": "No structure / fixed plan",
  "Schlaf / Energielevel": "Sleep / energy levels",
  "Selbstzweifel": "Self-doubt",
};

function translateCat(name, lang) {
  if (lang === "de") return name;
  return CAT_EN[name] || name;
}

function computePercent(counts, prefix, lang) {
  const entries = Object.entries(counts)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, v]) => ({ name: translateCat(k.slice(prefix.length), lang), value: v }));
  const total = entries.reduce((s, e) => s + e.value, 0);
  if (!total) return [];
  return entries.map((e) => ({ name: e.name, pct: Math.round((e.value / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

// ── Backend ───────────────────────────────────────────────────────────────────
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwjNHBJN0rwqb3mjLvfHEUp58B9vNO0-B7Y1GyFNIImbc8uVeu2PI0tuXT60PhbXJe75Q/exec";

function recordBatch(keys) {
  return new Promise((resolve) => {
    const cb = "unbrokenBatch" + Date.now();
    const script = document.createElement("script");
    window[cb] = (data) => { resolve(data || {}); delete window[cb]; script.remove(); };
    script.onerror = () => { resolve({}); delete window[cb]; script.remove(); };
    script.src = `${SHEET_URL}?data=${encodeURIComponent(JSON.stringify(keys))}&callback=${cb}`;
    document.body.appendChild(script);
  });
}

function fetchCountsJsonp() {
  return new Promise((resolve) => {
    const cb = "unbrokenCounts" + Date.now();
    const script = document.createElement("script");
    window[cb] = (data) => { resolve(data || {}); delete window[cb]; script.remove(); };
    script.onerror = () => { resolve({}); delete window[cb]; script.remove(); };
    script.src = `${SHEET_URL}?callback=${cb}`;
    document.body.appendChild(script);
  });
}

// ── Local categorisation ──────────────────────────────────────────────────────
const CAT_RULES = [
  { keywords: ["zeit", "schule", "job", "arbeit", "stress"], cat: "Zu wenig Zeit" },
  { keywords: ["motiv", "lust"], cat: "Motivation fehlt" },
  { keywords: ["freund", "umfeld", "familie", "eltern"], cat: "Umfeld / Freunde bremsen mich" },
  { keywords: ["rückschlag", "aufgehört", "abgebrochen", "aufgegeben"], cat: "Rückschläge nach guten Phasen" },
  { keywords: ["plan", "struktur", "system", "routine"], cat: "Struktur / kein fester Plan" },
  { keywords: ["schlaf", "müde", "energie"], cat: "Schlaf / Energielevel" },
  { keywords: ["zweifel", "selbstvertrauen", "unsicher", "angst"], cat: "Selbstzweifel" },
];

function categorise(text) {
  const lower = text.toLowerCase();
  const match = CAT_RULES.find((r) => r.keywords.some((k) => lower.includes(k)));
  return match ? match.cat : "Sonstiges (unsortiert)";
}

// ── Translations ──────────────────────────────────────────────────────────────
const UI = {
  de: {
    tagline: "Early Alpha · Disziplin. Kein Puder.",
    navStart: "Start", navConcept: "Konzept", navResults: "Ergebnisse",
    navManifesto: "Manifest", navMyPlan: "Mein Plan",
    startSub: "Gebaut für Leute, die es leid sind, auf Motivation zu warten.",
    exploreBtn: "Explorer-Modus", exploreSub: "Erst verstehen, worum es geht",
    directBtn: "Direkt zur Umfrage", directSub: "Ohne Umwege loslegen",
    aboutTitle: "Worum es geht",
    aboutP1: "Unbroken kommt nicht von jemandem, der bereits oben steht und erklärt, wie man hochkommt. Hinter diesem Projekt steckt jemand, der selbst noch mittendrin ist.",
    aboutP2: "Das Kernkonzept: Statt eines starren Plans entsteht hier etwas, das sich durch echte Daten von echten Menschen weiterentwickelt.",
    aboutP3: "Wir stehen ganz am Anfang. Wer jetzt mitmacht, gestaltet mit, was daraus wird.",
    aboutPersonTitle: "Wer steckt dahinter?",
    aboutPersonBody: "Unbroken wird von einer einzelnen Person aufgebaut, die selbst mitten im eigenen Weg steckt. Name und weitere Details bleiben bewusst anonym.",
    aboutCta: "Zur Umfrage",
    resultsTitle: "Aktuelle Auswertung",
    resultsIntro: "Diese Zahlen stammen direkt aus den bisher eingegangenen Antworten.",
    resultsEmpty: "Noch keine Antworten in dieser Kategorie.",
    catHindernis: "Größtes Hindernis", catKonsistenz: "Wie konsistent Leute dranbleiben",
    catMethode: "Aktuelle Methode", catHilfewunsch: "Was am meisten helfen würde",
    manifestoTitle: "Manifest",
    manifestoItems: [
      "Wir verkaufen keine Motivation. Motivation kommt und geht – Disziplin bleibt.",
      "Wer selbst durch etwas gegangen ist, versteht es besser als jeder Außenstehende.",
      "Kein starrer Plan schlägt einen, der auf echten Daten echter Menschen basiert.",
      "Rückschläge gehören zum Weg. Sie sind keine Niederlage, sondern Datenpunkte.",
      "Wir stehen ganz am Anfang – und das sagen wir offen.",
    ],
    aboutPersonTitle2: "Wer steckt dahinter?",
    aboutPersonBody2: "Unbroken wird von einer einzelnen Person aufgebaut, die selbst mitten im eigenen Weg steckt. Name und weitere Details bleiben bewusst anonym.",
    back: "Zurück", next: "Weiter", submit: "Absenden", submitting: "Wird gesendet…",
    thanksTitle: "Danke.",
    thanksBody: "Deine Antwort wurde anonym gespeichert. Keine Rohtexte – nur Kategorien und Zähler.",
    thanksResults: "So haben bisher alle geantwortet:",
    nothingYet: "Hat mir bisher nichts geholfen",
    otherPlaceholder: "Kurz in eigenen Worten – bitte keine persönlichen oder gesundheitsbezogenen Details.",
    q1: "Was bremst dich am meisten, an deinem Ziel dranzubleiben?",
    q2: "Wie oft schaffst du es, an deinem Ziel dranzubleiben?",
    q3: "Wie versuchst du aktuell, dranzubleiben?",
    q4: "Was würde dir am meisten helfen?",
    q5: "Was hat dir bisher am meisten geholfen – falls überhaupt etwas?",
    q6: "Wie alt bist du ungefähr?",
  },
  en: {
    tagline: "Early Alpha · Discipline. No Sugarcoat.",
    navStart: "Start", navConcept: "Concept", navResults: "Results",
    navManifesto: "Manifesto", navMyPlan: "My Plan",
    startSub: "Built for people done waiting on motivation.",
    exploreBtn: "Explorer mode", exploreSub: "Understand what this is first",
    directBtn: "Go straight to the survey", directSub: "No preamble, just questions",
    aboutTitle: "What this is",
    aboutP1: "Unbroken isn't built by someone at the top explaining how to get there. It's built by someone still in it — progress, setbacks, and everything in between.",
    aboutP2: "The core idea: instead of a fixed plan, this evolves through real data from real people.",
    aboutP3: "We're at the very start. Joining now means shaping what this becomes.",
    aboutPersonTitle: "Who's behind this?",
    aboutPersonBody: "Unbroken is built by a single person who is still in the middle of their own journey. Name and further details stay anonymous here by choice.",
    aboutCta: "Go to the survey",
    resultsTitle: "Current results",
    resultsIntro: "These numbers come directly from the responses collected so far.",
    resultsEmpty: "No answers in this category yet.",
    catHindernis: "Biggest obstacle", catKonsistenz: "How consistently people stick with it",
    catMethode: "Current method", catHilfewunsch: "What would help most",
    manifestoTitle: "Manifesto",
    manifestoItems: [
      "We don't sell motivation. Motivation comes and goes — discipline stays.",
      "Whoever has lived through something understands it better than any outside expert.",
      "No fixed plan beats one that grows from real data of real people.",
      "Setbacks are part of the path, not a defeat — they're data points.",
      "We're at the very start — and we say so openly.",
    ],
    back: "Back", next: "Next", submit: "Submit", submitting: "Sending…",
    thanksTitle: "Thanks.",
    thanksBody: "Your answer was recorded anonymously. No raw text stored — only categories and counts.",
    thanksResults: "Here's how all answers look so far:",
    nothingYet: "Nothing has helped me so far",
    otherPlaceholder: "Briefly, in your own words — please no personal or health-related details.",
    q1: "What holds you back most from sticking to your goal?",
    q2: "How often do you manage to stay consistent with your goal?",
    q3: "How do you currently try to stay consistent?",
    q4: "What would help you most?",
    q5: "What has helped you most so far, if anything?",
    q6: "About how old are you?",
  },
};

// ── Survey data ────────────────────────────────────────────────────────────────
const QUOTES = {
  motivation: { de: "Motivation ist langfristig nichts wert! Disziplin ist die Lösung.", en: "Motivation is crap. Discipline is the solution." },
  zeit:        { de: "Jeder hat Zeit für das, was ihm wirklich wichtig ist.", en: "Everyone has time for what truly matters to them." },
  umfeld:      { de: "Dein Umfeld testet dich nicht – es zeigt dir, wo du stehst.", en: "Your environment doesn't test you — it shows you where you stand." },
  rueckschlaege: { de: "Ein Rückschlag ist kein Ende, nur eine neue Startlinie.", en: "A setback isn't an end, just a new starting line." },
  impulskontrolle: { de: "Kontrolle beginnt in dem Moment, in dem es am schwersten ist.", en: "Control begins in the exact moment it's hardest." },
  orientierung: { de: "Du musst nicht wissen, wohin – nur, dass du losgehst.", en: "You don't need to know where — just that you're moving." },
};

const Q1 = [
  { id: "motivation",      sl: "Motivation fehlt",                              de: "Motivation fehlt",                              en: "Lack of motivation" },
  { id: "zeit",            sl: "Zu wenig Zeit",                                 de: "Zu wenig Zeit",                                 en: "Not enough time" },
  { id: "umfeld",          sl: "Umfeld / Freunde bremsen mich",                 de: "Umfeld / Freunde bremsen mich",                 en: "Environment / friends hold me back" },
  { id: "rueckschlaege",   sl: "Rückschläge nach guten Phasen",                 de: "Rückschläge nach guten Phasen",                 en: "Setbacks after good phases" },
  { id: "impulskontrolle", sl: "Impulskontrolle / schädliche Gewohnheiten",     de: "Impulskontrolle / schädliche Gewohnheiten",     en: "Impulse control / harmful habits" },
  { id: "orientierung",    sl: "Ich weiß nicht, wo ich anfangen soll",          de: "Ich weiß nicht, wo ich anfangen soll",          en: "I don't know where to start" },
  { id: "sonstiges",       sl: null,                                            de: "Etwas anderes …",                               en: "Something else …" },
];

const Q2 = [
  { id: "fast_nie",     sl: "Fast nie",    de: "Fast nie",    en: "Almost never" },
  { id: "gelegentlich", sl: "Gelegentlich",de: "Gelegentlich",en: "Occasionally" },
  { id: "meistens",     sl: "Meistens",    de: "Meistens",    en: "Mostly" },
  { id: "fast_immer",   sl: "Fast immer",  de: "Fast immer",  en: "Almost always" },
];

const Q3 = [
  { id: "nichts",     sl: "Gar nicht",              de: "Gar nicht",              en: "Not at all" },
  { id: "notizen",    sl: "Eigene Notizen-App",      de: "Eigene Notizen-App",      en: "My own notes app" },
  { id: "fitnessapp", sl: "Fitness-App",             de: "Fitness-App",             en: "Fitness app" },
  { id: "freunde",    sl: "Freunde als Kontrolle",   de: "Freunde als Kontrolle",   en: "Friends keeping me accountable" },
  { id: "coach",      sl: "Hab schon einen Coach",   de: "Hab schon einen Coach",   en: "Already have a coach" },
  { id: "anderes3",   sl: "Etwas anderes",           de: "Etwas anderes",           en: "Something else" },
];

const Q4 = [
  { id: "erinnerung",  sl: "Tägliche Erinnerung",                             de: "Tägliche Erinnerung",                             en: "Daily reminder" },
  { id: "austausch",   sl: "Austausch mit Leuten, die dasselbe durchmachen",   de: "Austausch mit Leuten, die dasselbe durchmachen",   en: "Connecting with people going through the same" },
  { id: "feedback",    sl: "Persönliches Feedback zu meiner Situation",        de: "Persönliches Feedback zu meiner Situation",        en: "Personal feedback on my situation" },
  { id: "wochenplan",  sl: "Ein klarer Wochenplan",                            de: "Ein klarer Wochenplan",                            en: "A clear weekly plan" },
  { id: "anderes4",    sl: "Etwas anderes",                                    de: "Etwas anderes",                                    en: "Something else" },
];

const Q6 = [
  { id: "u16",      sl: "Unter 16", de: "Unter 16", en: "Under 16" },
  { id: "16_20",    sl: "16–20",    de: "16–20",    en: "16–20" },
  { id: "21_30",    sl: "21–30",    de: "21–30",    en: "21–30" },
  { id: "ueber_30", sl: "Über 30",  de: "Über 30",  en: "Over 30" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function Panel({ children }) {
  return (
    <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 24 }}>
      {children}
    </div>
  );
}

function Heading({ children }) {
  return <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 12, lineHeight: 1.3 }}>{children}</div>;
}

function Body({ children, dim }) {
  return <p style={{ fontSize: 14, lineHeight: 1.6, color: dim ? P.dim : P.text, margin: "0 0 10px" }}>{children}</p>;
}

function ProgressTicks({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? P.accent : P.border }} />
      ))}
    </div>
  );
}

function Question({ title, children }) {
  return (
    <div>
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 16, lineHeight: 1.3 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function OptionBtn({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign: "left", padding: "12px 14px", borderRadius: 4, width: "100%",
      border: `1px solid ${selected ? P.accent : P.border}`,
      background: selected ? "rgba(201,162,39,0.12)" : "transparent",
      color: P.text, fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer",
    }}>{label}</button>
  );
}

function ChoiceCard({ title, sub, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      textAlign: "left", padding: "20px 16px", borderRadius: 6, width: "100%",
      border: `1px solid ${primary ? P.accent : P.border}`,
      background: primary ? "rgba(201,162,39,0.12)" : P.panel, cursor: "pointer",
    }}>
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, color: P.text, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 13, color: P.dim }}>{sub}</div>
    </button>
  );
}

function ResultBlock({ title, rows, empty }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 10 }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12, color: P.dim }}>{empty}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <div key={row.name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span>{row.name}</span><span>{row.pct}%</span>
              </div>
              <div style={{ background: P.border, borderRadius: 3, height: 6 }}>
                <div style={{ background: P.bar, width: `${row.pct}%`, height: 6, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NavBar({ view, setView, t, hidden }) {
  if (hidden) return null;
  const items = [
    { id: "start", label: t.navStart },
    { id: "about", label: t.navConcept },
    { id: "results", label: t.navResults },
    { id: "manifesto", label: t.navManifesto },
    { id: "myplan", label: t.navMyPlan },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
      {items.map((item) => (
        <button key={item.id} onClick={() => setView(item.id)} style={{
          background: item.id === "myplan" ? (view === item.id ? P.accent : "rgba(201,162,39,0.15)") : view === item.id ? "rgba(201,162,39,0.15)" : "transparent",
          color: item.id === "myplan" ? (view === item.id ? "#1B1E15" : P.accent) : view === item.id ? P.accent : P.dim,
          border: `1px solid ${item.id === "myplan" || view === item.id ? P.accent : P.border}`,
          borderRadius: 4, padding: "6px 12px", fontSize: 12,
          fontFamily: "Inter, sans-serif", cursor: "pointer",
          fontWeight: item.id === "myplan" ? 700 : 400,
        }}>{item.label}</button>
      ))}
    </div>
  );
}

function LangSwitch({ lang, setLang }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {["de", "en"].map((l) => (
        <button key={l} onClick={() => setLang(l)} style={{
          background: lang === l ? P.accent : "transparent",
          color: lang === l ? "#1B1E15" : P.dim,
          border: `1px solid ${P.border}`,
          borderRadius: 4, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function AuthInline({ lang, onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handle = async () => {
    setLoading(true); setError(null); setMessage(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage(lang === "de" ? "Bestätigungs-E-Mail gesendet." : "Confirmation email sent.");
    }
    setLoading(false);
  };

  return (
    <Panel>
      <button onClick={onBack} style={{ ...btnNav, marginBottom: 16, fontSize: 12 }}>← {lang === "de" ? "Zurück" : "Back"}</button>
      <Heading>{mode === "login" ? (lang === "de" ? "Einloggen" : "Log in") : (lang === "de" ? "Konto erstellen" : "Create account")}</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        {error && <div style={{ fontSize: 13, color: "#E05252", padding: "8px 10px", background: "rgba(224,82,82,0.1)", borderRadius: 4 }}>{error}</div>}
        {message && (
          <div style={{ fontSize: 13, color: P.accent, padding: "12px 14px", background: "rgba(201,162,39,0.1)", borderRadius: 4, lineHeight: 1.6 }}>
            {message}
            <div style={{ marginTop: 8, color: P.dim, fontSize: 12 }}>
              {lang === "de"
                ? "Die Mail kommt von noreply@mail.app.supabase.io – schau auch im Spam-Ordner nach."
                : "The email comes from noreply@mail.app.supabase.io — check your spam folder too."}
            </div>
          </div>
        )}
        <button onClick={handle} disabled={loading} style={{ ...btnPrimary, width: "100%", opacity: loading ? 0.6 : 1 }}>
          {loading ? "..." : mode === "login" ? (lang === "de" ? "Einloggen" : "Log in") : (lang === "de" ? "Konto erstellen" : "Create account")}
        </button>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ ...btnNav, width: "100%" }}>
          {mode === "login" ? (lang === "de" ? "Noch kein Konto? Registrieren" : "No account? Register") : (lang === "de" ? "Bereits ein Konto? Einloggen" : "Already have an account? Log in")}
        </button>
      </div>
    </Panel>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function UnbrokenApp({ session, profile, justConfirmed }) {
  useEffect(ensureFonts, []);
  useEffect(ensurePageStyle, []);
  useEffect(ensureAnimations, []);

  const { displayed: typedTitle, done: typeDone } = useTypewriter("UNBROKEN", 80);
  const [lang, setLang] = useState("de");
  // Intro nur einmal pro Browser-Session zeigen
  const [showIntro, setShowIntro] = useState(() => {
    if (justConfirmed) return false;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("introSeen")) return false;
    return true;
  });
  const [view, setView] = useState(justConfirmed ? "myplan" : "start");
  const t = UI[lang];

  const [surveyDone, setSurveyDone] = useState(false);

  // Prüfe ob dieser Account die Umfrage schon gemacht hat
  useEffect(() => {
    if (!session) return;
    supabase.from("profiles").select("survey_done").eq("id", session.user.id).single()
      .then(({ data }) => { if (data?.survey_done) setSurveyDone(true); });
  }, [session]);
  const [step, setStep] = useState(0);
  const [q1, setQ1] = useState(null);
  const [q1Other, setQ1Other] = useState("");
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);
  const [q4, setQ4] = useState(null);
  const [q5, setQ5] = useState("");
  const [q5None, setQ5None] = useState(false);
  const [age, setAge] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [counts, setCounts] = useState({});
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    if (view === "results") {
      setResultsLoading(true);
      fetchCountsJsonp().then((data) => { setCounts(data); setResultsLoading(false); });
    }
  }, [view]);

  const canAdvance = () => {
    if (step === 0) return q1 && (q1 !== "sonstiges" || q1Other.trim().length > 0);
    if (step === 1) return !!q2;
    if (step === 2) return !!q3;
    if (step === 3) return !!q4;
    if (step === 4) return q5None || q5.trim().length > 0;
    if (step === 5) return !!age;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const keys = [];
    keys.push(q1 === "sonstiges" ? `hindernis:${categorise(q1Other)}` : `hindernis:${Q1.find(o => o.id === q1)?.sl}`);
    keys.push(`konsistenz:${Q2.find(o => o.id === q2)?.sl}`);
    keys.push(`methode:${Q3.find(o => o.id === q3)?.sl}`);
    keys.push(`hilfewunsch:${Q4.find(o => o.id === q4)?.sl}`);
    keys.push(q5None ? "hilft:Nichts bisher" : `hilft:${categorise(q5)}`);
    keys.push(`alter:${Q6.find(o => o.id === age)?.sl}`);
    // Optimistisch: sofort done zeigen, Sheets im Hintergrund senden
    setSubmitting(false);
    setDone(true);
    if (session) {
      supabase.from("profiles").update({ survey_done: true }).eq("id", session.user.id);
    }
    recordBatch(keys).then(() => fetchCountsJsonp()).then(setCounts);
  };

  const hindernisData = computePercent(counts, "hindernis:", lang);

  return (
    <>
      {showIntro && <CinematicIntro onDone={() => {
        setShowIntro(false);
        if (typeof sessionStorage !== "undefined") sessionStorage.setItem("introSeen", "1");
      }} />}
      <div style={{ minHeight: "100vh", width: "100%", background: P.bg, color: P.text, fontFamily: "Inter, system-ui, sans-serif", display: "flex", justifyContent: "center", padding: "32px 16px", boxSizing: "border-box" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: "0.04em", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => setView("start")}>
                <span>{typedTitle}</span>
                {!typeDone && <span style={{ display: "inline-block", width: 2, height: 28, background: P.accent, marginLeft: 3, animation: "blink 0.8s step-end infinite" }} />}
              </div>
              <div style={{ color: P.dim, fontSize: 13, marginTop: 2 }} className="fade-in">{t.tagline}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <LangSwitch lang={lang} setLang={setLang} />
              {session && (
                <button onClick={() => supabase.auth.signOut()} style={{ background: "transparent", border: `1px solid ${P.border}`, color: P.dim, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
                  {lang === "de" ? "Abmelden" : "Sign out"}
                </button>
              )}
            </div>
          </div>

          <NavBar view={view} setView={setView} t={t} hidden={view === "survey"} />

          {/* Start */}
          {view === "start" && (
            <div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: P.text, marginBottom: 24 }} className="fade-up">{t.startSub}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="fade-up-2"><ChoiceCard title={t.exploreBtn} sub={t.exploreSub} onClick={() => setView("about")} /></div>
                {!session && !surveyDone && (
                  <div className="fade-up-3"><ChoiceCard title={t.directBtn} sub={t.directSub} primary onClick={() => setView("survey")} /></div>
                )}
                {session && (
                  <div className="fade-up-3"><ChoiceCard title={t.navMyPlan} sub={lang === "de" ? "Dein persönlicher Bereich" : "Your personal area"} primary onClick={() => setView("myplan")} /></div>
                )}
              </div>
            </div>
          )}

          {/* Concept */}
          {view === "about" && (
            <div className="fade-in">
              <Panel>
                <Heading>{t.aboutTitle}</Heading>
                <Body>{t.aboutP1}</Body>
                <Body>{t.aboutP2}</Body>
                <Body dim>{t.aboutP3}</Body>
                <button onClick={() => setView("survey")} style={{ ...btnPrimary, width: "100%" }}>{t.aboutCta}</button>
              </Panel>
            </div>
          )}

          {/* Results */}
          {view === "results" && (
            <div className="fade-in">
              <Panel>
                <Heading>{t.resultsTitle}</Heading>
                <Body dim>{t.resultsIntro}</Body>
                {resultsLoading ? (
                  <div style={{ color: P.dim, fontSize: 13 }}>…</div>
                ) : (
                  <>
                    <ResultBlock title={t.catHindernis}   rows={computePercent(counts, "hindernis:",   lang)} empty={t.resultsEmpty} />
                    <ResultBlock title={t.catKonsistenz}  rows={computePercent(counts, "konsistenz:",  lang)} empty={t.resultsEmpty} />
                    <ResultBlock title={t.catMethode}     rows={computePercent(counts, "methode:",     lang)} empty={t.resultsEmpty} />
                    <ResultBlock title={t.catHilfewunsch} rows={computePercent(counts, "hilfewunsch:", lang)} empty={t.resultsEmpty} />
                  </>
                )}
              </Panel>
            </div>
          )}

          {/* Manifesto */}
          {view === "manifesto" && (
            <div className="fade-in">
              <Panel>
                <Heading>{t.manifestoTitle}</Heading>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {t.manifestoItems.map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 10 }}>
                      <span style={{ color: P.accent, fontFamily: "Oswald, sans-serif", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 15, lineHeight: 1.5 }}>{line}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* My Plan */}
          {view === "myplan" && (
            <div className="fade-in">
              {session && profile?.is_admin ? (
                <PlanView profile={profile} lang={lang} isAdmin={true} />
              ) : session ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 48, fontWeight: 700, letterSpacing: "0.06em", color: P.accent, marginBottom: 8 }}>COMING</div>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 48, fontWeight: 700, letterSpacing: "0.06em", color: P.text, marginBottom: 24 }}>SOON.</div>
                  <div style={{ width: 60, height: 2, background: P.accent, margin: "0 auto 24px" }} />
                  <div style={{ fontSize: 14, color: P.dim, maxWidth: 320, margin: "0 auto", lineHeight: 1.7 }}>
                    {lang === "de" ? "Dein persönlicher Trainingsplan wird auf Basis der Umfrage-Ergebnisse entwickelt. Du wirst einer der ersten sein, der ihn erhält." : "Your personal training plan is being developed based on the survey results. You'll be one of the first to receive it."}
                  </div>
                  <div style={{ marginTop: 32, display: "inline-block", padding: "8px 20px", border: `1px solid ${P.border}`, borderRadius: 4, fontSize: 12, color: P.dim, fontFamily: "Oswald, sans-serif", letterSpacing: "0.08em" }}>EARLY ALPHA</div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 48, fontWeight: 700, letterSpacing: "0.06em", color: P.accent, marginBottom: 8 }}>COMING</div>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 48, fontWeight: 700, letterSpacing: "0.06em", color: P.text, marginBottom: 24 }}>SOON.</div>
                  <div style={{ width: 60, height: 2, background: P.accent, margin: "0 auto 24px" }} />
                  <div style={{ fontSize: 14, color: P.dim, maxWidth: 320, margin: "0 auto 24px", lineHeight: 1.7 }}>
                    {lang === "de" ? "Erstelle jetzt ein kostenloses Konto und sei einer der ersten, der Zugriff auf seinen persönlichen Plan erhält." : "Create a free account now and be one of the first to get access to your personal plan."}
                  </div>
                  <button onClick={() => setView("login")} style={{ ...btnPrimary, padding: "14px 32px", fontSize: 15, letterSpacing: "0.04em" }}>
                    {lang === "de" ? "KONTO ERSTELLEN / ANMELDEN" : "CREATE ACCOUNT / SIGN IN"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login */}
          {view === "login" && (
            <div className="fade-in">
              <AuthInline lang={lang} onBack={() => setView("myplan")} />
            </div>
          )}

          {/* Survey */}
          {view === "survey" && !done && (
            <div className="survey-enter">
              <ProgressTicks step={step} total={6} />
              <div style={{ marginTop: 16 }}>
                <Panel>
                  {step === 0 && (
                    <Question title={t.q1}>
                      {Q1.map((opt) => (
                        <OptionBtn key={opt.id} selected={q1 === opt.id} onClick={() => setQ1(opt.id)} label={opt[lang]} />
                      ))}
                      {q1 && q1 !== "sonstiges" && QUOTES[q1] && (
                        <div style={{ fontStyle: "italic", color: P.accent, fontSize: 13, marginTop: 4 }}>"{QUOTES[q1][lang]}"</div>
                      )}
                      {q1 === "sonstiges" && (
                        <textarea value={q1Other} onChange={e => setQ1Other(e.target.value)} placeholder={t.otherPlaceholder} style={taStyle} rows={2} />
                      )}
                    </Question>
                  )}
                  {step === 1 && (
                    <Question title={t.q2}>
                      {Q2.map((opt) => <OptionBtn key={opt.id} selected={q2 === opt.id} onClick={() => setQ2(opt.id)} label={opt[lang]} />)}
                    </Question>
                  )}
                  {step === 2 && (
                    <Question title={t.q3}>
                      {Q3.map((opt) => <OptionBtn key={opt.id} selected={q3 === opt.id} onClick={() => setQ3(opt.id)} label={opt[lang]} />)}
                    </Question>
                  )}
                  {step === 3 && (
                    <Question title={t.q4}>
                      {Q4.map((opt) => <OptionBtn key={opt.id} selected={q4 === opt.id} onClick={() => setQ4(opt.id)} label={opt[lang]} />)}
                    </Question>
                  )}
                  {step === 4 && (
                    <Question title={t.q5}>
                      <textarea value={q5} onChange={e => { setQ5(e.target.value); if (e.target.value.trim()) setQ5None(false); }} placeholder={t.otherPlaceholder} style={taStyle} rows={3} disabled={q5None} />
                      <OptionBtn selected={q5None} onClick={() => { setQ5None(v => !v); setQ5(""); }} label={t.nothingYet} />
                    </Question>
                  )}
                  {step === 5 && (
                    <Question title={t.q6}>
                      {Q6.map((opt) => <OptionBtn key={opt.id} selected={age === opt.id} onClick={() => setAge(opt.id)} label={opt[lang]} />)}
                    </Question>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                    <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ ...btnNav, opacity: step === 0 ? 0.3 : 1, cursor: step === 0 ? "default" : "pointer" }}>{t.back}</button>
                    {step < 5 ? (
                      <button onClick={() => canAdvance() && setStep(s => s + 1)} disabled={!canAdvance()} style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.4, cursor: canAdvance() ? "pointer" : "default" }}>{t.next}</button>
                    ) : (
                      <button onClick={handleSubmit} disabled={!canAdvance() || submitting} style={{ ...btnPrimary, opacity: canAdvance() && !submitting ? 1 : 0.4, cursor: canAdvance() && !submitting ? "pointer" : "default" }}>{submitting ? t.submitting : t.submit}</button>
                    )}
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {/* Thank you */}
          {view === "survey" && done && (
            <Panel>
              <Heading>{t.thanksTitle}</Heading>
              <Body dim>{t.thanksBody}</Body>
              <button onClick={() => setView("myplan")} style={{ ...btnPrimary, width: "100%", marginTop: 8, marginBottom: 16 }}>
                {lang === "de" ? "→ Mein Plan ansehen" : "→ See my plan"}
              </button>
              <div style={{ fontSize: 13, color: P.dim, marginBottom: 10 }}>{t.thanksResults}</div>
              {hindernisData.length === 0 ? (
                <div style={{ fontSize: 12, color: P.dim }}>{t.resultsEmpty}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {hindernisData.map((row) => (
                    <div key={row.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <span>{row.name}</span><span>{row.pct}%</span>
                      </div>
                      <div style={{ background: P.border, borderRadius: 3, height: 6 }}>
                        <div style={{ background: P.bar, width: `${row.pct}%`, height: 6, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

        </div>
      </div>
    </>
  );
}
