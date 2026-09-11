import { useState } from "react";
import { supabase } from "./supabase";

const P = {
  bg: "#20241C", panel: "#2A2F22", border: "#3D4530",
  text: "#EEEAE0", dim: "#A9AD9C", accent: "#C9A227",
};

const STEPS = {
  de: [
    {
      key: "training_level",
      question: "Wie würdest du dein aktuelles Trainingsniveau einschätzen?",
      options: [
        { id: "beginner",     label: "Anfänger",       sub: "Weniger als 6 Monate konsequentes Training" },
        { id: "intermediate", label: "Fortgeschritten", sub: "6 Monate bis 2 Jahre" },
        { id: "experienced",  label: "Erfahren",        sub: "2+ Jahre, ich weiß was ich tue" },
      ],
    },
    {
      key: "equipment",
      question: "Wo trainierst du?",
      options: [
        { id: "gym",        label: "Fitnessstudio",    sub: "Langhantel, Maschinen, volles Equipment" },
        { id: "home_gym",   label: "Heimstudio",       sub: "Einige Gewichte, begrenztes Equipment" },
        { id: "bodyweight", label: "Nur Körpergewicht", sub: "Kein Equipment nötig" },
      ],
    },
    {
      key: "days_per_week",
      question: "Wie viele Tage pro Woche kannst du trainieren?",
      options: [
        { id: "3", label: "3 Tage" },
        { id: "4", label: "4 Tage" },
        { id: "5", label: "5 Tage" },
        { id: "6", label: "6 Tage" },
      ],
    },
    {
      key: "goal",
      question: "Was ist dein Hauptziel?",
      options: [
        { id: "strength",        label: "Kraft",             sub: "So stark wie möglich werden" },
        { id: "endurance",       label: "Ausdauer",          sub: "Kardiokapazität aufbauen" },
        { id: "body_comp",       label: "Körperkomposition", sub: "Muskelaufbau, Fettabbau" },
        { id: "mental_toughness",label: "Mentale Stärke",    sub: "Disziplin über alles" },
      ],
    },
  ],
  en: [
    {
      key: "training_level",
      question: "What's your current training level?",
      options: [
        { id: "beginner",     label: "Beginner",      sub: "Less than 6 months consistent training" },
        { id: "intermediate", label: "Intermediate",  sub: "6 months to 2 years" },
        { id: "experienced",  label: "Experienced",   sub: "2+ years, know what I'm doing" },
      ],
    },
    {
      key: "equipment",
      question: "Where do you train?",
      options: [
        { id: "gym",        label: "Full Gym",       sub: "Barbells, machines, full equipment" },
        { id: "home_gym",   label: "Home Gym",       sub: "Some weights, limited equipment" },
        { id: "bodyweight", label: "Bodyweight only", sub: "No equipment needed" },
      ],
    },
    {
      key: "days_per_week",
      question: "How many days per week can you train?",
      options: [
        { id: "3", label: "3 days" },
        { id: "4", label: "4 days" },
        { id: "5", label: "5 days" },
        { id: "6", label: "6 days" },
      ],
    },
    {
      key: "goal",
      question: "What's your primary goal?",
      options: [
        { id: "strength",        label: "Strength",         sub: "Get as strong as possible" },
        { id: "endurance",       label: "Endurance",        sub: "Build cardiovascular capacity" },
        { id: "body_comp",       label: "Body composition", sub: "Build muscle, lose fat" },
        { id: "mental_toughness",label: "Mental toughness", sub: "Discipline over everything" },
      ],
    },
  ],
};

function OptionButton({ label, sub, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign: "left", padding: "12px 14px", borderRadius: 4, width: "100%",
      border: `1px solid ${selected ? P.accent : P.border}`,
      background: selected ? "rgba(201,162,39,0.12)" : "transparent",
      color: P.text, fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer",
    }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: P.dim, marginTop: 2 }}>{sub}</div>}
    </button>
  );
}

export default function Onboarding({ user, onDone }) {
  const [lang, setLang] = useState("de");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const steps = STEPS[lang];
  const current = steps[step];
  const selected = answers[current.key];

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else finish();
  };

  const finish = async () => {
    setSaving(true);
    await supabase.from("profiles").upsert({
      id: user.id,
      training_level: answers.training_level,
      equipment: answers.equipment,
      days_per_week: parseInt(answers.days_per_week),
      goal: answers.goal,
      tone: "standard",
    });
    setSaving(false);
    onDone();
  };

  return (
    <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 24, color: P.text, letterSpacing: "0.04em" }}>
            UNBROKEN
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["de", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? P.accent : "transparent",
                color: lang === l ? "#1B1E15" : P.dim,
                border: `1px solid ${P.border}`,
                borderRadius: 4, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div style={{ color: P.dim, fontSize: 13, marginBottom: 20 }}>
          {lang === "de" ? `Schritt ${step + 1} von ${steps.length} — Lass uns dein Profil erstellen.` : `Step ${step + 1} of ${steps.length} — Let's build your profile.`}
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? P.accent : P.border }} />
          ))}
        </div>

        <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 24 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 16, lineHeight: 1.3 }}>
            {current.question}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {current.options.map(opt => (
              <OptionButton
                key={opt.id} label={opt.label} sub={opt.sub}
                selected={selected === opt.id}
                onClick={() => setAnswers(a => ({ ...a, [current.key]: opt.id }))}
              />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ background: "transparent", border: `1px solid ${P.border}`, color: P.dim, padding: "10px 18px", borderRadius: 4, fontSize: 14, fontFamily: "Inter, sans-serif", cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.3 : 1 }}
            >
              {lang === "de" ? "Zurück" : "Back"}
            </button>
            <button
              onClick={next}
              disabled={!selected || saving}
              style={{ background: P.accent, border: "none", color: "#1B1E15", padding: "10px 22px", borderRadius: 4, fontSize: 14, fontWeight: 700, fontFamily: "Inter, sans-serif", cursor: selected ? "pointer" : "default", opacity: selected && !saving ? 1 : 0.4 }}
            >
              {saving ? "…" : step < steps.length - 1 ? (lang === "de" ? "Weiter" : "Next") : (lang === "de" ? "Los geht's" : "Let's go")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
