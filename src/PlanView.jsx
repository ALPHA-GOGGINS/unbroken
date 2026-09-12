import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import CalendarView from "./CalendarView";

function getLocalDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekStart() {
  const now = new Date();
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = local.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + diff);
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const d = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const P = {
  bg: "#20241C", panel: "#2A2F22", border: "#3D4530",
  text: "#EEEAE0", dim: "#A9AD9C", accent: "#C9A227", bar: "#8FA06B",
};

// ── Übungspool (v2) ───────────────────────────────────────────────────────────
const EXERCISES = {
  P1:  { de: "Bankdrücken (Langhantel)",         en: "Barbell Bench Press",          sets: 3, reps: "8-10",     category: "push" },
  P2:  { de: "Schrägbankdrücken (Kurzhantel)",   en: "Incline Dumbbell Press",       sets: 3, reps: "8-10",     category: "push" },
  P3:  { de: "Bankdrücken (Kurzhantel, flach)",  en: "Flat Dumbbell Press",          sets: 3, reps: "10-12",    category: "push" },
  P4:  { de: "Butterfly / Chest Press Maschine", en: "Chest Fly / Machine Press",    sets: 3, reps: "10-12",    category: "push" },
  P5:  { de: "Schulterdrücken (Kurzhantel)",     en: "Dumbbell Shoulder Press",      sets: 3, reps: "10",       category: "push" },
  P6:  { de: "Schulterdrücken Maschine",         en: "Machine Shoulder Press",       sets: 3, reps: "10-12",    category: "push" },
  P7:  { de: "Seitheben",                        en: "Lateral Raises",               sets: 3, reps: "12-15",    category: "push" },
  P8:  { de: "Dips (assistiert)",                en: "Assisted Dips",                sets: 3, reps: "8-10",     category: "push" },
  P9:  { de: "Trizepsdrücken Kabel",             en: "Cable Tricep Pushdown",        sets: 3, reps: "12-15",    category: "push" },
  P10: { de: "French Press (Kurzhantel)",        en: "Dumbbell French Press",        sets: 3, reps: "10-12",    category: "push" },
  L1:  { de: "Latzug (weiter Griff)",            en: "Lat Pulldown (Wide Grip)",     sets: 3, reps: "10-12",    category: "pull" },
  L2:  { de: "Latzug (enger Griff)",             en: "Lat Pulldown (Close Grip)",    sets: 3, reps: "10-12",    category: "pull" },
  L3:  { de: "Rudern (Kabel, sitzend)",          en: "Seated Cable Row",             sets: 3, reps: "10-12",    category: "pull" },
  L4:  { de: "Rudern (Langhantel, vorgebeugt)",  en: "Barbell Row",                  sets: 3, reps: "8-10",     category: "pull" },
  L5:  { de: "Rudern (Maschine)",                en: "Machine Row",                  sets: 3, reps: "10-12",    category: "pull" },
  L6:  { de: "Klimmzüge (assistiert)",           en: "Assisted Pull-Ups",            sets: 3, reps: "6-8",      category: "pull" },
  L7:  { de: "Face Pulls",                       en: "Face Pulls",                   sets: 3, reps: "15",       category: "pull" },
  L8:  { de: "Bizeps-Curls (Langhantel/EZ-Bar)", en: "Barbell / EZ-Bar Curl",        sets: 3, reps: "10-12",    category: "pull" },
  L9:  { de: "Bizeps-Curls (Kurzhantel)",        en: "Dumbbell Curl",                sets: 3, reps: "10-12",    category: "pull" },
  L10: { de: "Hammer-Curls",                     en: "Hammer Curls",                 sets: 3, reps: "12",       category: "pull" },
  B1:  { de: "Kniebeuge (Langhantel)",           en: "Barbell Squat",                sets: 3, reps: "8-10",     category: "legs" },
  B2:  { de: "Kniebeuge (Smith Machine)",        en: "Smith Machine Squat",          sets: 3, reps: "10-12",    category: "legs" },
  B3:  { de: "Beinpresse",                       en: "Leg Press",                    sets: 3, reps: "10-12",    category: "legs" },
  B4:  { de: "Ausfallschritte (Kurzhantel)",     en: "Dumbbell Lunges",              sets: 3, reps: "10/side",  category: "legs" },
  B5:  { de: "Beinstrecker",                     en: "Leg Extension",                sets: 3, reps: "12-15",    category: "legs" },
  B6:  { de: "Beinbeuger",                       en: "Leg Curl",                     sets: 3, reps: "12-15",    category: "legs" },
  B7:  { de: "Rumänisches Kreuzheben",           en: "Romanian Deadlift",            sets: 3, reps: "8-10",     category: "legs" },
  B8:  { de: "Hüftschub (Hip Thrust)",           en: "Hip Thrust",                   sets: 3, reps: "10-12",    category: "legs" },
  B9:  { de: "Wadenheben (stehend)",             en: "Standing Calf Raise",          sets: 3, reps: "15-20",    category: "legs" },
  B10: { de: "Wadenheben (sitzend)",             en: "Seated Calf Raise",            sets: 3, reps: "15-20",    category: "legs" },
  R1:  { de: "Plank",                            en: "Plank",                        sets: 3, reps: "30-45s",   category: "core" },
  R2:  { de: "Cable Crunch",                     en: "Cable Crunch",                 sets: 3, reps: "15",       category: "core" },
  R3:  { de: "Hanging Knee Raise",               en: "Hanging Knee Raise",           sets: 3, reps: "10-12",    category: "core" },
  R4:  { de: "Russian Twist",                    en: "Russian Twist",                sets: 3, reps: "15/side",  category: "core" },
  R5:  { de: "Ab Wheel",                         en: "Ab Wheel",                     sets: 3, reps: "8-10",     category: "core" },
  K1:  { de: "Zone-2-Cardio (Rad/Laufband)",     en: "Zone 2 Cardio (Bike/Treadmill)",sets: 1, reps: "10-15 Min",category: "cardio" },
  K2:  { de: "Intervall-Sprints (Rad)",          en: "Interval Sprints (Bike)",      sets: 8, reps: "30 sec",   category: "cardio" },
  K3:  { de: "Rudergerät (locker)",              en: "Rowing Machine (easy)",        sets: 1, reps: "10 Min",   category: "cardio" },
};

// ── Split-Logik (v2) ──────────────────────────────────────────────────────────
const SPLITS = {
  "3": {
    de: "Ganzkörper A/B/C", en: "Full Body A/B/C",
    days: {
      "Full Body A": ["P1","L3","B1","R1"],
      "Full Body B": ["P5","L6","B3","R2"],
      "Full Body C": ["P8","L4","B7","R3"],
    },
  },
  "4": {
    de: "Oberkörper / Unterkörper", en: "Upper / Lower",
    days: {
      "Upper A": ["P1","L3","P5","L8","R1"],
      "Lower A": ["B1","B5","B6","B9","R2"],
      "Upper B": ["P2","L4","P7","L9","R3"],
      "Lower B": ["B3","B4","B7","B10","R4"],
    },
  },
  "5": {
    de: "Push / Pull / Legs + Hybrid", en: "Push / Pull / Legs + Hybrid",
    days: {
      "Push":       ["P1","P5","P8","P9","R1"],
      "Pull":       ["L3","L6","L4","L8","R2"],
      "Legs":       ["B1","B5","B6","B9"],
      "Upper Mix":  ["P2","L1","P7","L9","R3"],
      "Lower Mix":  ["B3","B7","B8","B10","R4"],
    },
  },
  "6": {
    de: "PPL × 2", en: "PPL × 2",
    days: {
      "Push A":  ["P1","P5","P8","P9"],
      "Pull A":  ["L3","L6","L4","L8","R1"],
      "Legs A":  ["B1","B5","B6","B9"],
      "Push B":  ["P2","P6","P7","P10","R2"],
      "Pull B":  ["L1","L5","L7","L9","R3"],
      "Legs B":  ["B2","B3","B7","B10","R4"],
    },
  },
};

// ── Ton-Varianten ─────────────────────────────────────────────────────────────
const TONE = {
  standard: {
    de: {
      intro: "Das ist dein Plan. Er wird mit dir wachsen. Zeig auf, halt dich dran, der Rest kommt von selbst.",
      setInstruction: "Sauber ausführen – lieber weniger Gewicht als schlechte Technik.",
      completion: "Geschafft. Ein Tag mehr, an dem du dranbleibst.",
      missedDay: "Ein verpasster Tag ist kein Weltuntergang. Morgen geht's weiter.",
    },
    en: {
      intro: "This is your plan. It grows with you. Show up, stick with it, the rest takes care of itself.",
      setInstruction: "Execute clean – less weight with good form beats more weight with bad form.",
      completion: "Done. One more day you showed up.",
      missedDay: "A missed day isn't the end. Get back at it tomorrow.",
    },
  },
  hardcore: {
    de: {
      intro: "Niemand rettet dich. Der Plan ist da. Du entscheidest, ob du ihn benutzt oder wieder eine Ausrede findest.",
      setInstruction: "Keine halben Sachen. Wenn die letzte Wiederholung nicht wehtut, hast du nicht genug gegeben.",
      completion: "Fertig. Die meisten hätten heute aufgehört, nach Ausreden zu suchen. Du nicht.",
      missedDay: "Verpasst ist verpasst. Erklärungen ändern nichts. Morgen zählt, nicht heute.",
    },
    en: {
      intro: "Nobody is coming to save you. The plan is there. You decide whether you use it or find another excuse.",
      setInstruction: "No half reps. If the last one didn't hurt, you didn't push hard enough.",
      completion: "Done. Most people would have quit looking for an easier way today. Not you.",
      missedDay: "Missed is missed. Explanations change nothing. Tomorrow counts, not today.",
    },
  },
};

function getTone(toneKey, lang) {
  return TONE[toneKey]?.[lang === "en" ? "en" : "de"] || TONE.standard.de;
}

function getSplitLabel(split, lang) {
  return lang === "en" ? split.en : split.de;
}
const CAT_STYLE = {
  push:   { label: "PUSH",   color: "#C9A227" },
  pull:   { label: "PULL",   color: "#8FA06B" },
  legs:   { label: "LEGS",   color: "#7A9BB5" },
  core:   { label: "CORE",   color: "#B57A7A" },
  cardio: { label: "CARDIO", color: "#A9AD9C" },
};

// ── ExerciseCard ──────────────────────────────────────────────────────────────
function ExerciseCard({ id, checked, onToggle, toneKey, lang }) {
  const ex = EXERCISES[id];
  if (!ex) return null;
  const cat = CAT_STYLE[ex.category] || CAT_STYLE.core;
  const name = lang === "en" ? ex.en : ex.de;

  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "12px 14px", borderRadius: 4, cursor: "pointer",
      border: `1px solid ${checked ? P.accent : P.border}`,
      background: checked ? "rgba(201,162,39,0.06)" : "transparent",
      marginBottom: 8, transition: "border-color 0.2s",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? P.accent : P.border}`,
        background: checked ? P.accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1B1E15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontFamily: "Oswald, sans-serif", color: cat.color, letterSpacing: "0.06em" }}>{cat.label}</span>
          <span style={{ fontSize: 11, color: P.dim }}>{id}</span>
        </div>
        <div style={{ fontSize: 14, color: checked ? P.dim : P.text, textDecoration: checked ? "line-through" : "none", fontWeight: 500 }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: P.dim, marginTop: 2 }}>{ex.sets} {lang === "de" ? "Sätze" : "sets"} · {ex.reps}</div>
        <div style={{ fontSize: 11, color: P.dim, marginTop: 4, fontStyle: "italic" }}>
          {getTone(toneKey, lang).setInstruction}
        </div>
      </div>
    </div>
  );
}

// ── DayPanel ──────────────────────────────────────────────────────────────────
function DayPanel({ dayKey, exerciseIds, toneKey, lang, userId, weekStart }) {  const [checked, setChecked] = useState({});
  const [dayDone, setDayDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const total = exerciseIds.length;
  const completedCount = Object.values(checked).filter(Boolean).length;

  // Fortschritt aus Supabase laden
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase.from("workout_logs")
      .select("completed_exercises, day_done")
      .eq("user_id", userId)
      .eq("week_start", weekStart)
      .eq("day_key", dayKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const checkedMap = {};
          (data.completed_exercises || []).forEach(id => { checkedMap[id] = true; });
          setChecked(checkedMap);
          setDayDone(data.day_done || false);
        }
        setLoading(false);
      });
  }, [dayKey, userId, weekStart]);

  // Fortschritt in Supabase speichern
  const save = async (newChecked, newDone) => {
    if (!userId) return;
    const completed = Object.entries(newChecked).filter(([,v]) => v).map(([k]) => k);
    const today = getLocalDate();
    await supabase.from("workout_logs").upsert({
      user_id: userId,
      week_start: weekStart,
      day_key: dayKey,
      log_date: today,
      completed_exercises: completed,
      day_done: newDone,
    }, { onConflict: "user_id,week_start,day_key" });
  };

  const toggle = async (id) => {
    const next = { ...checked, [id]: !checked[id] };
    const done = Object.values(next).filter(Boolean).length === total;
    setChecked(next);
    setDayDone(done);
    await save(next, done);
  };

  const checkAll = async () => {
    const allDone = completedCount === total;
    const next = {};
    if (!allDone) exerciseIds.forEach(id => { next[id] = true; });
    setChecked(next);
    setDayDone(!allDone);
    await save(next, !allDone);
  };

  if (loading) return <div style={{ color: P.dim, fontSize: 13, padding: 16 }}>…</div>;

  return (
    <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 600, color: P.text }}>{dayKey}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: P.dim }}>{completedCount}/{total}</div>
          <div style={{ width: 60, height: 4, background: P.border, borderRadius: 2 }}>
            <div style={{ width: `${(completedCount / total) * 100}%`, height: 4, background: P.accent, borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      {exerciseIds.map(id => (
        <ExerciseCard key={id} id={id} toneKey={toneKey} lang={lang} checked={!!checked[id]} onToggle={() => toggle(id)} />
      ))}

      {!dayDone ? (
        <button onClick={checkAll} style={{
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
            {getTone(toneKey, lang).completion}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PlanView ──────────────────────────────────────────────────────────────────
export default function PlanView({ profile, lang, isAdmin }) {
  const weekStart = getWeekStart();
  const userId = profile?.id;

  // Admin kann Tage-Anzahl und Ton manuell wählen
  const [adminDays, setAdminDays] = useState(String(profile?.days_per_week || 3));
  const [toneOverride, setToneOverride] = useState(profile?.tone === "hardcore" ? "hardcore" : "standard");

  const daysKey = isAdmin ? adminDays : String(profile?.days_per_week || 3);
  const split = SPLITS[daysKey] || SPLITS["3"];
  const dayNames = Object.keys(split.days);
  const [activeDay, setActiveDay] = useState(dayNames[0]);

  // Aktiven Tag anpassen wenn Split wechselt
  useEffect(() => {
    setActiveDay(Object.keys(SPLITS[daysKey]?.days || SPLITS["3"].days)[0]);
  }, [daysKey]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 0 }}
      className="plan-grid">
      <style>{`
        @media (min-width: 900px) {
          .plan-grid { grid-template-columns: minmax(0,1.4fr) minmax(0,1fr) !important; gap: 24px !important; align-items: start; }
        }
      `}</style>

      {/* Linke Spalte – Plan */}
      <div>
        {/* Admin-Controls */}
        {isAdmin && (
          <div style={{ background: "rgba(201,162,39,0.08)", border: `1px solid ${P.accent}`, borderRadius: 6, padding: 14, marginBottom: 16 }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, color: P.accent, letterSpacing: "0.1em", marginBottom: 10 }}>ADMIN – ALLE PLÄNE VORSCHAU</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["3","4","5","6"].map(d => (
                <button key={d} onClick={() => setAdminDays(d)} style={{
                  background: adminDays === d ? P.accent : "transparent",
                  color: adminDays === d ? "#1B1E15" : P.dim,
                  border: `1px solid ${adminDays === d ? P.accent : P.border}`,
                  borderRadius: 4, padding: "5px 12px", fontSize: 11,
                  fontFamily: "Oswald, sans-serif", cursor: "pointer",
                }}>{d} Tage</button>
              ))}
            </div>
          </div>
        )}

        {/* Plan Header */}
        <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, color: P.accent, letterSpacing: "0.1em", marginBottom: 4 }}>
            {lang === "de" ? "DEIN PLAN" : "YOUR PLAN"}
          </div>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, fontWeight: 700, color: P.text, marginBottom: 4 }}>
            {getSplitLabel(split, lang)}
          </div>
          <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.5, marginBottom: 14 }}>
            {getTone(toneOverride, lang).intro}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["standard","hardcore"].map(t => (
              <button key={t} onClick={() => setToneOverride(t)} style={{
                background: toneOverride === t ? "rgba(201,162,39,0.15)" : "transparent",
                color: toneOverride === t ? P.accent : P.dim,
                border: `1px solid ${toneOverride === t ? P.accent : P.border}`,
                borderRadius: 4, padding: "5px 12px", fontSize: 11,
                fontFamily: "Oswald, sans-serif", letterSpacing: "0.06em", cursor: "pointer",
              }}>
                {t === "standard" ? "STANDARD" : (lang === "de" ? "KNALLHART" : "HARDCORE")}
              </button>
            ))}
          </div>
        </div>

        {/* Tag-Navigation */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {dayNames.map((dayName, i) => (
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

        <DayPanel
          key={`${daysKey}-${activeDay}-${weekStart}`}
          dayKey={activeDay}
          exerciseIds={split.days[activeDay] || []}
          toneKey={toneOverride}
          lang={lang}
          userId={userId}
          weekStart={weekStart}
        />

        {/* Progressions-Info */}
        <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 16 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, color: P.accent, letterSpacing: "0.08em", marginBottom: 8 }}>
            {lang === "de" ? "PROGRESSION" : "PROGRESSION"}
          </div>
          <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.7 }}>
            {lang === "de"
              ? "Alle 2 Wochen: +1 Wdh. pro Satz. Oberes Ende erreicht: +2,5–5 kg, Wdh. zurück zum Start. Alle 6–8 Wochen: automatische Deload-Woche (–20% Volumen)."
              : "Every 2 weeks: +1 rep per set. Top of range reached: +2.5–5 kg, reps back to start. Every 6–8 weeks: automatic deload week (–20% volume)."}
          </div>
        </div>
      </div>

      {/* Rechte Spalte – Kalender */}
      <div>
        <CalendarView profile={profile} lang={lang} />
      </div>

    </div>
  );
}
