import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const FONT_IMPORT_ID = "unbroken-fonts";

function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_IMPORT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

const PALETTE = {
  bg: "#20241C",
  panel: "#2A2F22",
  panelBorder: "#3D4530",
  text: "#EEEAE0",
  textDim: "#A9AD9C",
  accent: "#C9A227",
  accentDim: "#8F7620",
  bar: "#8FA06B",
};

const Q1_OPTIONS = [
  { id: "motivation", label: "Motivation fehlt" },
  { id: "zeit", label: "Zu wenig Zeit" },
  { id: "umfeld", label: "Umfeld / Freunde bremsen mich" },
  { id: "rueckschlaege", label: "Rückschläge nach guten Phasen" },
  { id: "impulskontrolle", label: "Impulskontrolle / schädliche Gewohnheiten" },
  { id: "orientierung", label: "Ich weiß nicht, wo ich anfangen soll" },
  { id: "sonstiges", label: "Etwas anderes …" },
];

const Q2_OPTIONS = [
  { id: "fast_nie", label: "Fast nie" },
  { id: "gelegentlich", label: "Gelegentlich" },
  { id: "meistens", label: "Meistens" },
  { id: "fast_immer", label: "Fast immer" },
];

const AGE_OPTIONS = [
  { id: "u16", label: "Unter 16" },
  { id: "16_20", label: "16–20" },
  { id: "21_30", label: "21–30" },
  { id: "ueber_30", label: "Über 30" },
];

const KNOWN_CATEGORIES = [
  "Motivation fehlt",
  "Zu wenig Zeit",
  "Umfeld / Freunde bremsen mich",
  "Rückschläge nach guten Phasen",
  "Impulskontrolle / schädliche Gewohnheiten",
  "Ich weiß nicht, wo ich anfangen soll",
  "Struktur / kein fester Plan",
  "Schlaf / Energielevel",
  "Selbstzweifel",
];

const CATEGORY_RULES = [
  { keywords: ["zeit", "schule", "job", "arbeit", "stress"], category: "Zu wenig Zeit" },
  { keywords: ["motiv", "lust"], category: "Motivation fehlt" },
  { keywords: ["freund", "umfeld", "familie", "eltern"], category: "Umfeld / Freunde bremsen mich" },
  { keywords: ["rückschlag", "wieder aufgehört", "abgebrochen", "aufgegeben"], category: "Rückschläge nach guten Phasen" },
  { keywords: ["plan", "struktur", "system", "routine"], category: "Struktur / kein fester Plan" },
  { keywords: ["schlaf", "müde", "energie"], category: "Schlaf / Energielevel" },
  { keywords: ["zweifel", "selbstvertrauen", "unsicher", "angst"], category: "Selbstzweifel" },
];

// Läuft komplett lokal im Browser, ohne Internet-Aufruf - schneller, kostenlos,
// kein CORS-Problem. Weniger präzise als eine echte KI, reicht für die Alpha.
function categorizeFreeText(text) {
  const lower = text.toLowerCase();
  const match = CATEGORY_RULES.find((rule) => rule.keywords.some((k) => lower.includes(k)));
  return match ? match.category : "Sonstiges (unsortiert)";
}

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwjNHBJN0rwqb3mjLvfHEUp58B9vNO0-B7Y1GyFNIImbc8uVeu2PI0tuXT60PhbXJe75Q/exec";

async function recordEvent(key) {
  try {
    // GET statt POST: zuverlässiger mit Google Apps Script im Browser.
    // no-cors: wir lesen die Antwort nicht, die Anfrage kommt trotzdem an.
    await fetch(`${SHEET_URL}?key=${encodeURIComponent(key)}`, {
      method: "GET",
      mode: "no-cors",
    });
  } catch (e) {
    // best-effort: ein Netzwerkfehler soll die Umfrage nicht blockieren
  }
}

async function fetchCounts() {
  try {
    const response = await fetch(SHEET_URL, { method: "GET" });
    const data = await response.json();
    return data || {};
  } catch (e) {
    return {};
  }
}

export default function UnbrokenSurvey() {
  useEffect(ensureFonts, []);

  const [step, setStep] = useState(0);
  const [q1, setQ1] = useState(null);
  const [q1Other, setQ1Other] = useState("");
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState("");
  const [age, setAge] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [counts, setCounts] = useState({});
  const [showResults, setShowResults] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    fetchCounts().then(setCounts);
  }, []);

  const canAdvance = () => {
    if (step === 0) return q1 && (q1 !== "sonstiges" || q1Other.trim().length > 0);
    if (step === 1) return !!q2;
    if (step === 2) return true; // optional free text
    if (step === 3) return !!age;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    if (q1 === "sonstiges") {
      const category = await categorizeFreeText(q1Other);
      await recordEvent(`hindernis:${category}`);
    } else {
      const label = Q1_OPTIONS.find((o) => o.id === q1)?.label || q1;
      await recordEvent(`hindernis:${label}`);
    }

    await recordEvent(`konsistenz:${Q2_OPTIONS.find((o) => o.id === q2)?.label}`);

    if (q3.trim().length > 0) {
      const helpCategory = await categorizeFreeText(q3);
      await recordEvent(`hilft:${helpCategory}`);
    }

    await recordEvent(`alter:${AGE_OPTIONS.find((o) => o.id === age)?.label}`);

    const updated = await fetchCounts();
    setCounts(updated);
    setSubmitting(false);
    setDone(true);
  };

  const hindernisData = Object.entries(counts)
    .filter(([k]) => k.startsWith("hindernis:"))
    .map(([k, v]) => ({ name: k.replace("hindernis:", ""), value: v }))
    .sort((a, b) => b.value - a.value);

  const totalResponses = Object.entries(counts)
    .filter(([k]) => k.startsWith("alter:"))
    .reduce((sum, [, v]) => sum + v, 0);

  return (
    <div
      style={{
        minHeight: "100%",
        background: PALETTE.bg,
        color: PALETTE.text,
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: "0.02em",
              color: PALETTE.text,
            }}
          >
            UNBROKEN
          </div>
          <div style={{ color: PALETTE.textDim, fontSize: 14, marginTop: 2 }}>
            Anonyme Kurzumfrage · Alpha-Test
          </div>
        </div>

        {!done && (
          <>
            <ProgressTicks step={step} total={totalSteps} />
            <div
              style={{
                background: PALETTE.panel,
                border: `1px solid ${PALETTE.panelBorder}`,
                borderRadius: 6,
                padding: 24,
                marginTop: 16,
              }}
            >
              {step === 0 && (
                <Question title="Was bremst dich am meisten, an deinem Ziel dranzubleiben?">
                  {Q1_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.id}
                      selected={q1 === opt.id}
                      onClick={() => setQ1(opt.id)}
                      label={opt.label}
                    />
                  ))}
                  {q1 === "sonstiges" && (
                    <textarea
                      value={q1Other}
                      onChange={(e) => setQ1Other(e.target.value)}
                      placeholder="Kurz in eigenen Worten – bitte keine persönlichen oder gesundheitsbezogenen Details."
                      style={textareaStyle}
                      rows={2}
                    />
                  )}
                </Question>
              )}

              {step === 1 && (
                <Question title="Wie oft schaffst du es, an deinem Ziel dranzubleiben?">
                  {Q2_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.id}
                      selected={q2 === opt.id}
                      onClick={() => setQ2(opt.id)}
                      label={opt.label}
                    />
                  ))}
                </Question>
              )}

              {step === 2 && (
                <Question title="Was hat dir bisher am meisten geholfen, wenn überhaupt etwas? (optional)">
                  <textarea
                    value={q3}
                    onChange={(e) => setQ3(e.target.value)}
                    placeholder="Freiwillig – bitte keine persönlichen oder gesundheitsbezogenen Details."
                    style={textareaStyle}
                    rows={3}
                  />
                </Question>
              )}

              {step === 3 && (
                <Question title="Wie alt bist du ungefähr?">
                  {AGE_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.id}
                      selected={age === opt.id}
                      onClick={() => setAge(opt.id)}
                      label={opt.label}
                    />
                  ))}
                </Question>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  style={{
                    ...navButtonStyle,
                    opacity: step === 0 ? 0.3 : 1,
                    cursor: step === 0 ? "default" : "pointer",
                  }}
                >
                  Zurück
                </button>
                {step < totalSteps - 1 ? (
                  <button
                    onClick={() => canAdvance() && setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    style={{
                      ...primaryButtonStyle,
                      opacity: canAdvance() ? 1 : 0.4,
                      cursor: canAdvance() ? "pointer" : "default",
                    }}
                  >
                    Weiter
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canAdvance() || submitting}
                    style={{
                      ...primaryButtonStyle,
                      opacity: canAdvance() && !submitting ? 1 : 0.4,
                      cursor: canAdvance() && !submitting ? "pointer" : "default",
                    }}
                  >
                    {submitting ? "Wird gesendet…" : "Absenden"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {done && (
          <div
            style={{
              background: PALETTE.panel,
              border: `1px solid ${PALETTE.panelBorder}`,
              borderRadius: 6,
              padding: 24,
              marginTop: 16,
            }}
          >
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, marginBottom: 8 }}>
              Danke.
            </div>
            <div style={{ color: PALETTE.textDim, fontSize: 14, marginBottom: 16 }}>
              Deine Antwort ist anonym in der Auswertung gelandet. Keine Rohtexte werden
              gespeichert – nur Kategorien und Zähler.
            </div>
            <div style={{ color: PALETTE.textDim, fontSize: 13 }}>
              Die Auswertung siehst du für den Moment direkt in deiner Google-Tabelle
              (Tabellenblatt "Responses") – der Browser blockiert es aus Sicherheitsgründen,
              Zahlen direkt in diese Seite zurückzuholen. Das lösen wir, sobald die Seite auf
              Vercel läuft.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressTicks({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 3,
            flex: 1,
            borderRadius: 2,
            background: i <= step ? PALETTE.accent : PALETTE.panelBorder,
          }}
        />
      ))}
    </div>
  );
}

function Question({ title, children }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "Oswald, sans-serif",
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 16,
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function OptionButton({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "12px 14px",
        borderRadius: 4,
        border: `1px solid ${selected ? PALETTE.accent : PALETTE.panelBorder}`,
        background: selected ? "rgba(201,162,39,0.12)" : "transparent",
        color: PALETTE.text,
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

const textareaStyle = {
  marginTop: 4,
  width: "100%",
  background: "#1B1E15",
  border: `1px solid ${PALETTE.panelBorder}`,
  borderRadius: 4,
  padding: 10,
  color: PALETTE.text,
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  resize: "vertical",
};

const navButtonStyle = {
  background: "transparent",
  border: `1px solid ${PALETTE.panelBorder}`,
  color: PALETTE.textDim,
  padding: "10px 18px",
  borderRadius: 4,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
};

const primaryButtonStyle = {
  background: PALETTE.accent,
  border: "none",
  color: "#1B1E15",
  padding: "10px 22px",
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
};
