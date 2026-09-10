import { useState, useEffect } from "react";

// ── Fonts & page style ────────────────────────────────────────────────────────

function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById("unbroken-fonts")) return;
  const link = document.createElement("link");
  link.id = "unbroken-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

function ensurePageStyle() {
  if (typeof document === "undefined") return;
  document.documentElement.style.height = "100%";
  document.body.style.margin = "0";
  document.body.style.minHeight = "100vh";
  document.body.style.background = "#20241C";
  const root = document.getElementById("root");
  if (root) root.style.minHeight = "100vh";
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const P = {
  bg:          "#20241C",
  panel:       "#2A2F22",
  border:      "#3D4530",
  text:        "#EEEAE0",
  dim:         "#A9AD9C",
  accent:      "#C9A227",
  bar:         "#8FA06B",
};

// ── Backend (Google Sheets via Apps Script) ───────────────────────────────────

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwjNHBJN0rwqb3mjLvfHEUp58B9vNO0-B7Y1GyFNIImbc8uVeu2PI0tuXT60PhbXJe75Q/exec";

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
    const cb = "unbrokenCb" + Date.now();
    const script = document.createElement("script");
    window[cb] = (data) => { resolve(data || {}); delete window[cb]; script.remove(); };
    script.onerror = () => { resolve({}); delete window[cb]; script.remove(); };
    script.src = `${SHEET_URL}?callback=${cb}`;
    document.body.appendChild(script);
  });
}

// ── Local free-text categorisation ───────────────────────────────────────────

const CAT_RULES = [
  { kw: ["zeit","schule","job","arbeit","stress"],              cat: "Zu wenig Zeit" },
  { kw: ["motiv","lust"],                                        cat: "Motivation fehlt" },
  { kw: ["freund","umfeld","familie","eltern"],                  cat: "Umfeld / Freunde bremsen mich" },
  { kw: ["rückschlag","aufgehört","abgebrochen","aufgegeben"],   cat: "Rückschläge nach guten Phasen" },
  { kw: ["plan","struktur","system","routine"],                  cat: "Struktur / kein fester Plan" },
  { kw: ["schlaf","müde","energie"],                             cat: "Schlaf / Energielevel" },
  { kw: ["zweifel","selbstvertrauen","unsicher","angst"],        cat: "Selbstzweifel" },
];

function categorise(text) {
  const lo = text.toLowerCase();
  const hit = CAT_RULES.find((r) => r.kw.some((k) => lo.includes(k)));
  return hit ? hit.cat : "Sonstiges (unsortiert)";
}

function ensureAnimations() {
  if (typeof document === "undefined") return;
  if (document.getElementById("unbroken-anim")) return;
  const style = document.createElement("style");
  style.id = "unbroken-anim";
  style.textContent = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0; }
    }
    /* Stickman running - echte Laufbewegung */
    @keyframes bodyBob {
      0%,100% { transform: translateY(0px); }
      50%     { transform: translateY(-3px); }
    }
    @keyframes legFront {
      0%   { transform: rotate(-35deg); }
      50%  { transform: rotate(35deg); }
      100% { transform: rotate(-35deg); }
    }
    @keyframes legBack {
      0%   { transform: rotate(35deg); }
      50%  { transform: rotate(-35deg); }
      100% { transform: rotate(35deg); }
    }
    @keyframes armFront {
      0%   { transform: rotate(30deg); }
      50%  { transform: rotate(-30deg); }
      100% { transform: rotate(30deg); }
    }
    @keyframes armBack {
      0%   { transform: rotate(-30deg); }
      50%  { transform: rotate(30deg); }
      100% { transform: rotate(-30deg); }
    }
    /* Cinematisches Intro */
    @keyframes glitch {
      0%,100% { clip-path: inset(0 0 100% 0); opacity: 0; }
      10%     { clip-path: inset(30% 0 40% 0); opacity: 1; transform: translateX(-4px); }
      20%     { clip-path: inset(0 0 0 0);     opacity: 1; transform: translateX(2px); }
      30%     { clip-path: inset(60% 0 10% 0); opacity: 1; transform: translateX(0); }
      40%,90% { clip-path: inset(0 0 0 0);     opacity: 1; transform: translateX(0); }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes introFade {
      0%   { opacity: 0; transform: scale(1.04); }
      100% { opacity: 1; transform: scale(1); }
    }
    .fade-up   { animation: fadeUp  0.5s ease both; }
    .fade-up-2 { animation: fadeUp  0.5s ease 0.15s both; }
    .fade-up-3 { animation: fadeUp  0.5s ease 0.30s both; }
    .fade-in   { animation: fadeIn  0.4s ease both; }
    .survey-enter { animation: fadeUp 0.4s ease both; }
  `;
  document.head.appendChild(style);
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text, speed = 60) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
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

// ── Stickman SVG – echte Laufbewegung ────────────────────────────────────────
function Stickman() {
  const stroke = "#C9A227";
  const sw = 2;
  return (
    <svg width="32" height="42" viewBox="0 0 32 42" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 10 }}>
      <g style={{ animation: "bodyBob 0.4s ease-in-out infinite" }}>
        {/* Kopf */}
        <circle cx="16" cy="6" r="5" fill="none" stroke={stroke} strokeWidth={sw} />
        {/* Torso */}
        <line x1="16" y1="11" x2="16" y2="26" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        {/* Linker Arm – schwingt nach vorne */}
        <line x1="16" y1="15" x2="8" y2="22" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
          style={{ transformOrigin: "16px 15px", animation: "armFront 0.4s ease-in-out infinite" }} />
        {/* Rechter Arm – schwingt nach hinten */}
        <line x1="16" y1="15" x2="24" y2="22" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
          style={{ transformOrigin: "16px 15px", animation: "armBack 0.4s ease-in-out infinite" }} />
        {/* Linkes Bein – schwingt nach vorne */}
        <line x1="16" y1="26" x2="9" y2="38" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
          style={{ transformOrigin: "16px 26px", animation: "legFront 0.4s ease-in-out infinite" }} />
        {/* Rechtes Bein – schwingt nach hinten */}
        <line x1="16" y1="26" x2="23" y2="38" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
          style={{ transformOrigin: "16px 26px", animation: "legBack 0.4s ease-in-out infinite" }} />
      </g>
    </svg>
  );
}


// ── Cinematisches Intro ───────────────────────────────────────────────────────
function CinematicIntro({ onDone }) {
  const [phase, setPhase] = useState(0);
  const lines = ["NO EXCUSES.", "NO SHORTCUTS.", "UNBROKEN."];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => onDone(), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0D0F0A",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16, zIndex: 999,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "rgba(201,162,39,0.25)",
        animation: "scanline 1.5s linear infinite",
        pointerEvents: "none",
      }} />
      {lines.map((line, i) => (
        <div key={i} style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: i === 2 ? 42 : 22,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: i === 2 ? "#C9A227" : "#EEEAE0",
          opacity: phase > i ? 1 : 0,
          transform: phase > i ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
          {line}
        </div>
      ))}
    </div>
  );
}

const UI = {
  de: {
    tagline:        "Anonyme Kurzumfrage · Early Alpha",
    navStart:       "Start",
    navConcept:     "Konzept",
    navResults:     "Ergebnisse",
    navManifesto:   "Manifest",
    startSub:       "Gebaut für Leute, die es leid sind, auf Motivation zu warten.",
    exploreBtn:     "Explorer-Modus",
    exploreSub:     "Erst verstehen, worum es geht",
    directBtn:      "Direkt zur Umfrage",
    directSub:      "Ohne Umwege loslegen",
    aboutTitle:     "Worum es geht",
    aboutP1:        "Unbroken kommt nicht von jemandem, der bereits oben steht und von dort erklärt, wie man hochkommt. Hinter diesem Projekt steckt jemand, der selbst noch mittendrin ist – mit allem, was dazugehört.",
    aboutP2:        "Das Kernkonzept: Statt eines starren Plans entsteht hier etwas, das sich durch echte Daten von echten Menschen weiterentwickelt. Jede Umfrage-Antwort fließt direkt in die nächste Version der Programme ein.",
    aboutP3:        "Wir stehen ganz am Anfang. Wer jetzt mitmacht, gestaltet mit, was daraus wird.",
    aboutPersonTitle: "Wer steckt dahinter?",
    aboutPersonBody:  "Unbroken wird von einer einzelnen Person aufgebaut, die selbst mitten im eigenen Weg steckt. Name und weitere Details bleiben hier bewusst anonym.",
    aboutCta:       "Zur Umfrage",
    resultsTitle:   "Aktuelle Auswertung",
    resultsIntro:   "Diese Zahlen stammen direkt aus den bisher eingegangenen Antworten und aktualisieren sich mit jeder neuen Teilnahme.",
    resultsEmpty:   "Noch keine Antworten in dieser Kategorie.",
    catHindernis:   "Größtes Hindernis",
    catKonsistenz:  "Wie konsistent Teilnehmer dranbleiben",
    catMethode:     "Aktuelle Methode, um dranzubleiben",
    catHilfewunsch: "Was am meisten helfen würde",
    manifestoTitle: "Manifest",
    manifestoItems: [
      "Wir verkaufen keine Motivation. Motivation kommt und geht – Disziplin bleibt.",
      "Wer selbst durch etwas gegangen ist, versteht es besser als jeder außenstehende Experte.",
      "Kein starrer Plan schlägt einen, der auf echten Daten echter Menschen basiert.",
      "Rückschläge gehören zum Weg. Sie sind keine Niederlage, sondern Datenpunkte.",
      "Wir sind ganz am Anfang – und das sagen wir offen, statt es zu verbergen.",
    ],
    back:           "Zurück",
    next:           "Weiter",
    submit:         "Absenden",
    submitting:     "Wird gesendet…",
    thanksTitle:    "Danke.",
    thanksBody:     "Deine Antwort ist anonym erfasst worden. Keine Rohtexte werden gespeichert – nur Kategorien und Häufigkeiten.",
    thanksResults:  "So sehen alle bisherigen Antworten aus:",
    nothingYet:     "Hat mir bisher nichts geholfen",
    otherPlaceholder: "Kurz in eigenen Worten – bitte keine persönlichen oder gesundheitsbezogenen Details.",
    q1: "Was bremst dich am meisten, an deinem Ziel dranzubleiben?",
    q2: "Wie oft schaffst du es, konsequent an deinem Ziel dranzubleiben?",
    q3: "Wie versuchst du aktuell, dranzubleiben?",
    q4: "Was würde dir am meisten helfen?",
    q5: "Was hat dir bisher am meisten geholfen – falls überhaupt etwas?",
    q6: "Wie alt bist du ungefähr?",
  },
  en: {
    tagline:        "Anonymous short survey · Early Alpha",
    navStart:       "Start",
    navConcept:     "Concept",
    navResults:     "Results",
    navManifesto:   "Manifesto",
    startSub:       "Built for people done waiting on motivation.",
    exploreBtn:     "Explorer mode",
    exploreSub:     "Understand what this is first",
    directBtn:      "Go straight to the survey",
    directSub:      "No preamble, just questions",
    aboutTitle:     "What this is",
    aboutP1:        "Unbroken isn't built by someone at the top explaining how to get there. It's built by someone still in it — progress, setbacks, and everything in between.",
    aboutP2:        "The core idea: instead of a fixed plan, this evolves through real data from real people. Every survey response feeds directly into the next version of the programs.",
    aboutP3:        "We're at the very start. Joining now means shaping what this becomes.",
    aboutPersonTitle: "Who's behind this?",
    aboutPersonBody:  "Unbroken is built by a single person who is still in the middle of their own journey. Name and further details stay anonymous here by choice.",
    aboutCta:       "Go to the survey",
    resultsTitle:   "Current results",
    resultsIntro:   "These numbers come directly from the responses collected so far and update with every new submission.",
    resultsEmpty:   "No answers in this category yet.",
    catHindernis:   "Biggest obstacle",
    catKonsistenz:  "How consistently people stick with it",
    catMethode:     "Current method to stay consistent",
    catHilfewunsch: "What would help most",
    manifestoTitle: "Manifesto",
    manifestoItems: [
      "We don't sell motivation. Motivation comes and goes — discipline stays.",
      "Whoever has lived through something understands it better than any outside expert.",
      "No fixed plan beats one that grows from real data of real people.",
      "Setbacks are part of the path, not a defeat — they're data points.",
      "We're at the very start — and we say so openly instead of hiding it.",
    ],
    back:           "Back",
    next:           "Next",
    submit:         "Submit",
    submitting:     "Sending…",
    thanksTitle:    "Thanks.",
    thanksBody:     "Your answer was recorded anonymously. No raw text is stored — only categories and frequencies.",
    thanksResults:  "Here's how all answers look so far:",
    nothingYet:     "Nothing has helped me so far",
    otherPlaceholder: "Briefly, in your own words — please no personal or health-related details.",
    q1: "What holds you back most from sticking to your goal?",
    q2: "How often do you manage to stay consistent with your goal?",
    q3: "How do you currently try to stay consistent?",
    q4: "What would help you most?",
    q5: "What has helped you most so far — if anything?",
    q6: "About how old are you?",
  },
};

// ── Survey data ───────────────────────────────────────────────────────────────

const Q1 = [
  { id: "motivation",      sl: "Motivation fehlt",                              de: "Motivation fehlt",                              en: "Lack of motivation" },
  { id: "zeit",            sl: "Zu wenig Zeit",                                 de: "Zu wenig Zeit",                                 en: "Not enough time" },
  { id: "umfeld",          sl: "Umfeld / Freunde bremsen mich",                 de: "Umfeld / Freunde bremsen mich",                 en: "Environment / friends hold me back" },
  { id: "rueckschlaege",   sl: "Rückschläge nach guten Phasen",                 de: "Rückschläge nach guten Phasen",                 en: "Setbacks after good phases" },
  { id: "impulskontrolle", sl: "Impulskontrolle / schädliche Gewohnheiten",     de: "Impulskontrolle / schädliche Gewohnheiten",     en: "Impulse control / harmful habits" },
  { id: "orientierung",    sl: "Ich weiß nicht, wo ich anfangen soll",          de: "Ich weiß nicht, wo ich anfangen soll",          en: "I don't know where to start" },
  { id: "sonstiges",       sl: null,                                             de: "Etwas anderes …",                               en: "Something else …" },
];

const QUOTES = {
  motivation:      { de: "Motivation ist langfristig nichts wert! Disziplin ist die Lösung.", en: "Motivation is worth nothing long-term. Discipline is the solution." },
  zeit:            { de: "Jeder hat Zeit für das, was ihm wirklich wichtig ist.",              en: "Everyone has time for what truly matters to them." },
  umfeld:          { de: "Dein Umfeld testet dich nicht – es zeigt dir, wo du stehst.",       en: "Your environment doesn't test you — it shows where you stand." },
  rueckschlaege:   { de: "Ein Rückschlag ist kein Ende, nur eine neue Startlinie.",            en: "A setback isn't an end — just a new starting line." },
  impulskontrolle: { de: "Kontrolle beginnt genau dann, wenn sie am schwersten fällt.",       en: "Control begins exactly when it's hardest." },
  orientierung:    { de: "Du musst nicht wissen, wohin – nur, dass du losgehst.",              en: "You don't need to know where — just that you're moving." },
};

const Q2 = [
  { id: "fast_nie",    sl: "Fast nie",    de: "Fast nie",    en: "Almost never" },
  { id: "gelegentlich",sl: "Gelegentlich",de: "Gelegentlich",en: "Occasionally" },
  { id: "meistens",   sl: "Meistens",    de: "Meistens",    en: "Mostly" },
  { id: "fast_immer", sl: "Fast immer",  de: "Fast immer",  en: "Almost always" },
];

const Q3 = [
  { id: "nichts",    sl: "Gar nicht",                    de: "Gar nicht",                    en: "Not at all" },
  { id: "notizen",   sl: "Eigene Notizen-App",           de: "Eigene Notizen-App",           en: "My own notes app" },
  { id: "fitnessapp",sl: "Fitness-App",                  de: "Fitness-App",                  en: "Fitness app" },
  { id: "freunde",   sl: "Freunde als Kontrolle",        de: "Freunde als Kontrolle",        en: "Friends keeping me accountable" },
  { id: "coach",     sl: "Hab schon einen Coach",        de: "Hab schon einen Coach",        en: "Already have a coach" },
  { id: "anderes",   sl: "Etwas anderes",                de: "Etwas anderes",                en: "Something else" },
];

const Q4 = [
  { id: "erinnerung", sl: "Tägliche Erinnerung",                              de: "Tägliche Erinnerung",                              en: "Daily reminder" },
  { id: "austausch",  sl: "Austausch mit Leuten, die dasselbe durchmachen",   de: "Austausch mit Leuten, die dasselbe durchmachen",   en: "Connecting with people going through the same" },
  { id: "feedback",   sl: "Persönliches Feedback zu meiner Situation",        de: "Persönliches Feedback zu meiner Situation",        en: "Personal feedback on my situation" },
  { id: "wochenplan", sl: "Ein klarer Wochenplan",                            de: "Ein klarer Wochenplan",                            en: "A clear weekly plan" },
  { id: "anderes",    sl: "Etwas anderes",                                    de: "Etwas anderes",                                    en: "Something else" },
];

const Q6 = [
  { id: "u16",     sl: "Unter 16", de: "Unter 16", en: "Under 16" },
  { id: "16_20",   sl: "16–20",    de: "16–20",    en: "16–20" },
  { id: "21_30",   sl: "21–30",    de: "21–30",    en: "21–30" },
  { id: "ueber_30",sl: "Über 30",  de: "Über 30",  en: "Over 30" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function computePercent(counts, prefix) {
  const entries = Object.entries(counts)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, v]) => ({ name: k.slice(prefix.length), value: v }));
  const total = entries.reduce((s, e) => s + e.value, 0);
  if (!total) return [];
  return entries
    .map((e) => ({ name: e.name, pct: Math.round((e.value / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function UnbrokenApp() {
  useEffect(ensureFonts, []);
  useEffect(ensurePageStyle, []);
  useEffect(ensureAnimations, []);

  const { displayed: typedTitle, done: typeDone } = useTypewriter("UNBROKEN", 80);

  const [lang, setLang]   = useState("de");
  const [view, setView]   = useState("start");
  const [showIntro, setShowIntro] = useState(true);
  const t = UI[lang];

  // survey state
  const [step, setStep]         = useState(0);
  const [q1, setQ1]             = useState(null);
  const [q1Other, setQ1Other]   = useState("");
  const [q2, setQ2]             = useState(null);
  const [q3, setQ3]             = useState(null);
  const [q4, setQ4]             = useState(null);
  const [q5, setQ5]             = useState("");
  const [q5None, setQ5None]     = useState(false);
  const [age, setAge]           = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);

  // results state
  const [counts, setCounts]           = useState({});
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    if (view === "results") {
      setResultsLoading(true);
      fetchCountsJsonp().then((d) => { setCounts(d); setResultsLoading(false); });
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

    if (q1 === "sonstiges") {
      keys.push(`hindernis:${categorise(q1Other)}`);
    } else {
      keys.push(`hindernis:${Q1.find((o) => o.id === q1)?.sl}`);
    }
    keys.push(`konsistenz:${Q2.find((o) => o.id === q2)?.sl}`);
    keys.push(`methode:${Q3.find((o) => o.id === q3)?.sl}`);
    keys.push(`hilfewunsch:${Q4.find((o) => o.id === q4)?.sl}`);
    keys.push(q5None ? "hilft:Nichts bisher" : `hilft:${categorise(q5)}`);
    keys.push(`alter:${Q6.find((o) => o.id === age)?.sl}`);

    await recordBatch(keys);
    const updated = await fetchCountsJsonp();
    setCounts(updated);
    setSubmitting(false);
    setDone(true);
  };

  const hindernisData = computePercent(counts, "hindernis:");

  return (
    <>
      {showIntro && <CinematicIntro onDone={() => setShowIntro(false)} />}
    <div style={{ minHeight: "100vh", width: "100%", background: P.bg, color: P.text, fontFamily: "Inter, system-ui, sans-serif", display: "flex", justifyContent: "center", padding: "32px 16px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div
              style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: "0.04em", cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={() => setView("start")}
            >
              <span>{typedTitle}</span>
              {!typeDone && (
                <span style={{ display: "inline-block", width: 2, height: 28, background: P.accent, marginLeft: 3, animation: "blink 0.8s step-end infinite" }} />
              )}
              {typeDone && <Stickman />}
            </div>
            <div style={{ color: P.dim, fontSize: 13, marginTop: 2 }} className="fade-in">{t.tagline}</div>
          </div>
          <LangSwitch lang={lang} setLang={setLang} />
        </div>

        {/* ── Nav ── */}
        <NavBar view={view} setView={setView} t={t} />

        {/* ── Start ── */}
        {view === "start" && (
          <div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: P.text, marginBottom: 24 }} className="fade-up">{t.startSub}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="fade-up-2"><ChoiceCard title={t.exploreBtn} sub={t.exploreSub} onClick={() => setView("about")} /></div>
              <div className="fade-up-3"><ChoiceCard title={t.directBtn} sub={t.directSub} primary onClick={() => setView("survey")} /></div>
            </div>
          </div>
        )}

        {/* ── Concept / About ── */}
        {view === "about" && (
          <div className="fade-in">
          <Panel>
            <Heading>{t.aboutTitle}</Heading>
            <Body>{t.aboutP1}</Body>
            <Body>{t.aboutP2}</Body>
            <Body dim>{t.aboutP3}</Body>
            <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 16, marginTop: 4, marginBottom: 20 }}>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 6 }}>{t.aboutPersonTitle}</div>
              <Body dim>{t.aboutPersonBody}</Body>
            </div>
            <button onClick={() => setView("survey")} style={btnPrimary}>{t.aboutCta}</button>
          </Panel>
          </div>
        )}

        {/* ── Results ── */}
        {view === "results" && (
          <div className="fade-in">
          <Panel>
            <Heading>{t.resultsTitle}</Heading>
            <Body dim>{t.resultsIntro}</Body>
            {resultsLoading ? (
              <div style={{ color: P.dim, fontSize: 13, marginTop: 12 }}>…</div>
            ) : (
              <>
                <ResultBlock title={t.catHindernis}    rows={computePercent(counts, "hindernis:")}   empty={t.resultsEmpty} />
                <ResultBlock title={t.catKonsistenz}   rows={computePercent(counts, "konsistenz:")}  empty={t.resultsEmpty} />
                <ResultBlock title={t.catMethode}      rows={computePercent(counts, "methode:")}     empty={t.resultsEmpty} />
                <ResultBlock title={t.catHilfewunsch}  rows={computePercent(counts, "hilfewunsch:")} empty={t.resultsEmpty} />
              </>
            )}
          </Panel>
          </div>
        )}

        {/* ── Manifesto ── */}
        {view === "manifesto" && (
          <div className="fade-in">
          <Panel>
            <Heading>{t.manifestoTitle}</Heading>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
              {t.manifestoItems.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <span style={{ color: P.accent, fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 18, minWidth: 28 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 15, lineHeight: 1.6 }}>{line}</span>
                </div>
              ))}
            </div>
          </Panel>
          </div>
        )}

        {/* ── Survey ── */}
        {view === "survey" && !done && (
          <div className="survey-enter">
          <>
            <ProgressTicks step={step} total={6} />
            <Panel style={{ marginTop: 16 }}>
              {step === 0 && (
                <Question title={t.q1}>
                  {Q1.map((opt) => (
                    <OptionBtn key={opt.id} selected={q1 === opt.id} onClick={() => setQ1(opt.id)} label={opt[lang]} />
                  ))}
                  {q1 && q1 !== "sonstiges" && QUOTES[q1] && (
                    <div style={{ fontStyle: "italic", color: P.accent, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                      "{QUOTES[q1][lang]}"
                    </div>
                  )}
                  {q1 === "sonstiges" && (
                    <textarea value={q1Other} onChange={(e) => setQ1Other(e.target.value)} placeholder={t.otherPlaceholder} style={taStyle} rows={2} />
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
                  <textarea
                    value={q5}
                    onChange={(e) => { setQ5(e.target.value); if (e.target.value.trim()) setQ5None(false); }}
                    placeholder={t.otherPlaceholder}
                    style={taStyle}
                    rows={3}
                    disabled={q5None}
                  />
                  <OptionBtn selected={q5None} onClick={() => { setQ5None((v) => !v); setQ5(""); }} label={t.nothingYet} />
                </Question>
              )}
              {step === 5 && (
                <Question title={t.q6}>
                  {Q6.map((opt) => <OptionBtn key={opt.id} selected={age === opt.id} onClick={() => setAge(opt.id)} label={opt[lang]} />)}
                </Question>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  style={{ ...btnNav, opacity: step === 0 ? 0.3 : 1, cursor: step === 0 ? "default" : "pointer" }}
                >
                  {t.back}
                </button>
                {step < 5 ? (
                  <button
                    onClick={() => canAdvance() && setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.4, cursor: canAdvance() ? "pointer" : "default" }}
                  >
                    {t.next}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canAdvance() || submitting}
                    style={{ ...btnPrimary, opacity: canAdvance() && !submitting ? 1 : 0.4, cursor: canAdvance() && !submitting ? "pointer" : "default" }}
                  >
                    {submitting ? t.submitting : t.submit}
                  </button>
                )}
              </div>
            </Panel>
          </>
          </div>
        )}

        {/* ── Thank-you / results ── */}
        {view === "survey" && done && (
          <Panel>
            <Heading>{t.thanksTitle}</Heading>
            <Body dim>{t.thanksBody}</Body>
            <div style={{ fontSize: 13, color: P.dim, marginTop: 16, marginBottom: 10 }}>{t.thanksResults}</div>
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

// ── Sub-components ────────────────────────────────────────────────────────────

function NavBar({ view, setView, t }) {
  const items = [
    { id: "start",     label: t.navStart },
    { id: "about",     label: t.navConcept },
    { id: "results",   label: t.navResults },
    { id: "manifesto", label: t.navManifesto },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          style={{
            background: view === item.id ? "rgba(201,162,39,0.15)" : "transparent",
            color:      view === item.id ? P.accent : P.dim,
            border:     `1px solid ${view === item.id ? P.accent : P.border}`,
            borderRadius: 4,
            padding: "6px 12px",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function LangSwitch({ lang, setLang }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {["de", "en"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? P.accent : "transparent",
            color:      lang === l ? "#1B1E15" : P.dim,
            border:     `1px solid ${P.border}`,
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ChoiceCard({ title, sub, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "18px 16px",
        borderRadius: 6,
        border:     `1px solid ${primary ? P.accent : P.border}`,
        background:  primary ? "rgba(201,162,39,0.12)" : P.panel,
        cursor: "pointer",
      }}
    >
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, color: P.text, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 13, color: P.dim }}>{sub}</div>
    </button>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function Heading({ children }) {
  return <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, marginBottom: 12 }}>{children}</div>;
}

function Body({ children, dim }) {
  return <p style={{ fontSize: 14, lineHeight: 1.6, color: dim ? P.dim : P.text, marginBottom: 12, marginTop: 0 }}>{children}</p>;
}

function ProgressTicks({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? P.accent : P.border }} />
      ))}
    </div>
  );
}

function Question({ title, children }) {
  return (
    <div>
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 16, lineHeight: 1.3 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function OptionBtn({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "12px 14px",
        borderRadius: 4,
        border:     `1px solid ${selected ? P.accent : P.border}`,
        background:  selected ? "rgba(201,162,39,0.12)" : "transparent",
        color: P.text,
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {label}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const btnPrimary = {
  background: P.accent,
  border: "none",
  color: "#1B1E15",
  padding: "10px 22px",
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
  cursor: "pointer",
};

const btnNav = {
  background: "transparent",
  border: `1px solid ${P.border}`,
  color: P.dim,
  padding: "10px 18px",
  borderRadius: 4,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
};

const taStyle = {
  marginTop: 4,
  width: "100%",
  background: "#1B1E15",
  border: `1px solid ${P.border}`,
  borderRadius: 4,
  padding: 10,
  color: P.text,
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  resize: "vertical",
  boxSizing: "border-box",
};
