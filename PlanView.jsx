import { useState } from "react";

const P = {
  bg: "#20241C", panel: "#2A2F22", border: "#3D4530",
  text: "#EEEAE0", dim: "#A9AD9C", accent: "#C9A227", bar: "#8FA06B",
};

// ── Übungspool (v2) ────────────────────────────────────────────────────────────
const EXERCISES = {
  P1:  { name: "Bankdrücken (Langhantel)",         sets: 3, reps: "8-10",    category: "push" },
  P2:  { name: "Schrägbankdrücken (Kurzhantel)",   sets: 3, reps: "8-10",    category: "push" },
  P3:  { name: "Bankdrücken (Kurzhantel, flach)",  sets: 3, reps: "10-12",   category: "push" },
  P4:  { name: "Butterfly / Chest Press Maschine", sets: 3, reps: "10-12",   category: "push" },
  P5:  { name: "Schulterdrücken (Kurzhantel)",     sets: 3, reps: "10",      category: "push" },
  P6:  { name: "Schulterdrücken Maschine",         sets: 3, reps: "10-12",   category: "push" },
  P7:  { name: "Seitheben",                        sets: 3, reps: "12-15",   category: "push" },
  P8:  { name: "Dips (assistiert)",                sets: 3, reps: "8-10",    category: "push" },
  P9:  { name: "Trizepsdrücken Kabel",             sets: 3, reps: "12-15",   category: "push" },
  P10: { name: "French Press (Kurzhantel)",        sets: 3, reps: "10-12",   category: "push" },
  L1:  { name: "Latzug (weiter Griff)",            sets: 3, reps: "10-12",   category: "pull" },
  L2:  { name: "Latzug (enger Griff)",             sets: 3, reps: "10-12",   category: "pull" },
  L3:  { name: "Rudern (Kabel, sitzend)",          sets: 3, reps: "10-12",   category: "pull" },
  L4:  { name: "Rudern (Langhantel, vorgebeugt)",  sets: 3, reps: "8-10",    category: "pull" },
  L5:  { name: "Rudern (Maschine)",                sets: 3, reps: "10-12",   category: "pull" },
  L6:  { name: "Klimmzüge (assistiert)",           sets: 3, reps: "6-8",     category: "pull" },
  L7:  { name: "Face Pulls",                       sets: 3, reps: "15",      category: "pull" },
  L8:  { name: "Bizeps-Curls (Langhantel/EZ-Bar)", sets: 3, reps: "10-12",   category: "pull" },
  L9:  { name: "Bizeps-Curls (Kurzhantel)",        sets: 3, reps: "10-12",   category: "pull" },
  L10: { name: "Hammer-Curls",                     sets: 3, reps: "12",      category: "pull" },
  B1:  { name: "Kniebeuge (Langhantel)",           sets: 3, reps: "8-10",    category: "legs" },
  B2:  { name: "Kniebeuge (Smith Machine)",        sets: 3, reps: "10-12",   category: "legs" },
  B3:  { name: "Beinpresse",                       sets: 3, reps: "10-12",   category: "legs" },
  B4:  { name: "Ausfallschritte (Kurzhantel)",     sets: 3, reps: "10/Seite",category: "legs" },
  B5:  { name: "Beinstrecker",                     sets: 3, reps: "12-15",   category: "legs" },
  B6:  { name: "Beinbeuger",                       sets: 3, reps: "12-15",   category: "legs" },
  B7:  { name: "Rumänisches Kreuzheben",           sets: 3, reps: "8-10",    category: "legs" },
  B8:  { name: "Hüftschub (Hip Thrust)",           sets: 3, reps: "10-12",   category: "legs" },
  B9:  { name: "Wadenheben (stehend)",             sets: 3, reps: "15-20",   category: "legs" },
  B10: { name: "Wadenheben (sitzend)",             sets: 3, reps: "15-20",   category: "legs" },
  R1:  { name: "Plank",                            sets: 3, reps: "30-45s",  category: "core" },
  R2:  { name: "Cable Crunch",                     sets: 3, reps: "15",      category: "core" },
  R3:  { name: "Hanging Knee Raise",               sets: 3, reps: "10-12",   category: "core" },
  R4:  { name: "Russian Twist",                    sets: 3, reps: "15/Seite",category: "core" },
  R5:  { name: "Ab Wheel",                         sets: 3, reps: "8-10",    category: "core" },
  K1:  { name: "Zone-2-Cardio (Rad/Laufband)",     sets: 1, reps: "10-15 Min",category: "cardio" },
  K2:  { name: "Intervall-Sprints (Rad)",          sets: 8, reps: "30 Sek",  category: "cardio" },
  K3:  { name: "Rudergerät (locker)",              sets: 1, reps: "10 Min",  category: "cardio" },
};

// ── Split-Logik (v2) ───────────────────────────────────────────────────────────
const SPLITS = {
  "3": {
    label: "Ganzkörper A/B/C",
    days: {
      "Tag A": ["P1","L3","B1","R1"],
      "Tag B": ["P5","L6","B3","R2"],
      "Tag C": ["P8","L4","B7","R3"],
    },
    rotation: true,
  },
  "4": {
    label: "Oberkörper / Unterkörper",
    days: {
      "Tag 1 – Oberkörper A": ["P1","L3","P5","L8","R1"],
      "Tag 2 – Unterkörper A": ["B1","B5","B6","B9","R2"],
      "Tag 3 – Oberkörper B": ["P2","L4","P7","L9","R3"],
      "Tag 4 – Unterkörper B": ["B3","B4","B7","B10","R4"],
    },
  },
  "5": {
    label: "Push / Pull / Legs + Hybrid",
    days: {
      "Tag 1 – Push": ["P1","P5","P8","P9","R1"],
      "Tag 2 – Pull": ["L3","L6","L4","L8","R2"],
      "Tag 3 – Legs": ["B1","B5","B6","B9"],
      "Tag 4 – Oberkörper": ["P2","L1","P7","L9","R3"],
      "Tag 5 – Unterkörper": ["B3","B7","B8","B10","R4"],
    },
  },
  "6": {
    label: "PPL × 2",
    days: {
      "Tag 1 – Push A": ["P1","P5","P8","P9"],
      "Tag 2 – Pull A": ["L3","L6","L4","L8","R1"],
      "Tag 3 – Legs A": ["B1","B5","B6","B9"],
      "Tag 4 – Push B": ["P2","P6","P7","P10","R2"],
      "Tag 5 – Pull B": ["L1","L5","L7","L9","R3"],
      "Tag 6 – Legs B": ["B2","B3","B7","B10","R4"],
    },
  },
};

// ── Ton-Varianten ─────────────────────────────────────────────────────────────
const TONE = {
  standard: {
    intro: "Das ist dein Plan. Er wird mit dir wachsen. Zeig auf, halt dich dran, der Rest kommt von selbst.",
    setInstruction: "Sauber ausführen – lieber weniger Gewicht als schlechte Technik.",
    completion: "Geschafft. Ein Tag mehr, an dem du dranbleibst.",
    missedDay: "Ein verpasster Tag ist kein Weltuntergang. Morgen geht's weiter.",
  },
  hardcore: {
    intro: "Niemand rettet dich. Der Plan ist da. Du entscheidest, ob du ihn benutzt oder wieder eine Ausrede findest.",
    setInstruction: "Keine halben Sachen. Wenn die letzte Wiederholung nicht wehtut, hast du nicht genug gegeben.",
    completion: "Fertig. Die meisten hätten heute aufgehört, nach Ausreden zu suchen. Du nicht.",
    missedDay: "Verpasst ist verpasst. Erklärungen ändern nichts. Morgen zählt, nicht heute.",
  },
};

// ── Kategorie-Labels & Farben ─────────────────────────────────────────────────
const CAT_STYLE = {
  push:   { label: "PUSH",   color: "#C9A227" },
  pull:   { label: "PULL",   color: "#8FA06B" },
  legs:   { label: "LEGS",   color: "#7A9BB5" },
  core:   { label: "CORE",   color: "#B57A7A" },
  cardio: { label: "CARDIO", color: "#A9AD9C" },
};

// ── Hilfs-Komponenten ─────────────────────────────────────────────────────────
function ExerciseCard({ id, checked, onToggle, toneKey }) {
  const ex = EXERCISES[id];
  if (!ex) return null;
  const cat = CAT_STYLE[ex.category] || CAT_STYLE.core;
  const tone = TONE[toneKey] || TONE.standard;

  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "12px 14px", borderRadius: 4, cursor: "pointer",
        border: `1px solid ${checked ? P.accent : P.border}`,
        background: checked ? "rgba(201,162,39,0.06)" : "transparent",
        marginBottom: 8, transition: "border-color 0.2s",
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? P.accent : P.border}`,
        background: checked ? P.accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1B1E15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontFamily: "Oswald, sans-serif", color: cat.color, letterSpacing: "0.06em" }}>{cat.label}</span>
          <span style={{ fontSize: 11, color: P.dim }}>{id}</span>
        </div>
        <div style={{ fontSize: 14, color: checked ? P.dim : P.text, textDecoration: checked ? "line-through" : "none", fontWeight: 500 }}>
          {ex.name}
        </div>
        <div style={{ fontSize: 12, color: P.dim, marginTop: 2 }}>
          {ex.sets} Sätze · {ex.reps}
        </div>
        <div style={{ fontSize: 11, color: P.dim, marginTop: 4, fontStyle: "italic" }}>
          {tone.setInstruction}
        </div>
      </div>
    </div>
  );
}

function DayPanel({ dayName, exerciseIds, toneKey, lang }) {
  const [checked, setChecked] = useState({});
  const [done, setDone] = useState(false);
  const total = exerciseIds.length;
  const completedCount = Object.values(checked).filter(Boolean).length;

  const toggleAll = () => {
    if (completedCount === total) {
      setChecked({});
      setDone(false);
    } else {
      const all = {};
      exerciseIds.forEach(id => { all[id] = true; });
      setChecked(all);
      setDone(true);
    }
  };

  return (
    <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
      {/* Day header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 600, color: P.text }}>{dayName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: P.dim }}>{completedCount}/{total}</div>
          <div style={{ width: 60, height: 4, background: P.border, borderRadius: 2 }}>
            <div style={{ width: `${(completedCount / total) * 100}%`, height: 4, background: P.accent, borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      {/* Exercises */}
      {exerciseIds.map(id => (
        <ExerciseCard
          key={id} id={id} toneKey={toneKey}
          checked={!!checked[id]}
          onToggle={() => {
            const next = { ...checked, [id]: !checked[id] };
            setChecked(next);
            setDone(Object.values(next).filter(Boolean).length === total);
          }}
        />
      ))}

      {/* Complete button */}
      {!done ? (
        <button onClick={toggleAll} style={{
          marginTop: 8, width: "100%", background: "transparent",
          border: `1px solid ${P.border}`, color: P.dim,
          padding: "10px 0", borderRadius: 4, fontSize: 13,
          fontFamily: "Inter, sans-serif", cursor: "pointer",
        }}>
          {lang === "de" ? "Alle abhaken" : "Check all"}
        </button>
      ) : (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(143,160,107,0.12)", border: `1px solid ${P.bar}`, borderRadius: 4 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 14, color: P.bar }}>
            {lang === "de" ? "✓ WORKOUT ABGESCHLOSSEN" : "✓ WORKOUT COMPLETE"}
          </div>
          <div style={{ fontSize: 12, color: P.dim, marginTop: 4 }}>
            {TONE[toneKey]?.completion || TONE.standard.completion}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main PlanView ─────────────────────────────────────────────────────────────
export default function PlanView({ profile, lang }) {
  const days_key = String(profile?.days_per_week || 3);
  const split = SPLITS[days_key] || SPLITS["3"];
  const toneKey = profile?.tone === "hardcore" ? "hardcore" : "standard";
  const tone = TONE[toneKey];

  const [activeDay, setActiveDay] = useState(Object.keys(split.days)[0]);
  const [toneOverride, setToneOverride] = useState(toneKey);

  return (
    <div>
      {/* Plan Header */}
      <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, color: P.accent, letterSpacing: "0.1em", marginBottom: 4 }}>
          {lang === "de" ? "DEIN PLAN" : "YOUR PLAN"}
        </div>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, fontWeight: 700, color: P.text, marginBottom: 4 }}>
          {split.label}
        </div>
        <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.5 }}>{tone.intro}</div>

        {/* Ton-Umschalter */}
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {["standard", "hardcore"].map(t => (
            <button key={t} onClick={() => setToneOverride(t)} style={{
              background: toneOverride === t ? "rgba(201,162,39,0.15)" : "transparent",
              color: toneOverride === t ? P.accent : P.dim,
              border: `1px solid ${toneOverride === t ? P.accent : P.border}`,
              borderRadius: 4, padding: "5px 12px", fontSize: 11,
              fontFamily: "Oswald, sans-serif", letterSpacing: "0.06em", cursor: "pointer",
            }}>
              {t === "standard" ? (lang === "de" ? "STANDARD" : "STANDARD") : (lang === "de" ? "KNALLHART" : "HARDCORE")}
            </button>
          ))}
        </div>
      </div>

      {/* Tag-Auswahl */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.keys(split.days).map((dayName, i) => (
          <button key={dayName} onClick={() => setActiveDay(dayName)} style={{
            background: activeDay === dayName ? "rgba(201,162,39,0.15)" : "transparent",
            color: activeDay === dayName ? P.accent : P.dim,
            border: `1px solid ${activeDay === dayName ? P.accent : P.border}`,
            borderRadius: 4, padding: "6px 12px", fontSize: 11,
            fontFamily: "Oswald, sans-serif", letterSpacing: "0.04em", cursor: "pointer",
          }}>
            {lang === "de" ? `TAG ${i + 1}` : `DAY ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Aktiver Tag */}
      <DayPanel
        key={activeDay}
        dayName={activeDay}
        exerciseIds={split.days[activeDay]}
        toneKey={toneOverride}
        lang={lang}
      />

      {/* Progressions-Info */}
      <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 16, marginTop: 8 }}>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, color: P.accent, letterSpacing: "0.08em", marginBottom: 8 }}>
          {lang === "de" ? "PROGRESSION" : "PROGRESSION"}
        </div>
        <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.7 }}>
          {lang === "de"
            ? "Alle 2 Wochen: +1 Wiederholung pro Satz. Sobald du das obere Ende der Range erreichst: Gewicht +2,5–5 kg, Wdh. zurück auf den Anfang. Alle 6–8 Wochen: automatische Deload-Woche (–20% Volumen)."
            : "Every 2 weeks: +1 rep per set. Once you reach the top of the rep range: weight +2.5–5 kg, reps back to the start. Every 6–8 weeks: automatic deload week (–20% volume)."}
        </div>
      </div>
    </div>
  );
}
