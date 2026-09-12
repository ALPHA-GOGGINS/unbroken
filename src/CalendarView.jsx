import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const P = {
  bg: "#20241C", panel: "#2A2F22", border: "#3D4530",
  text: "#EEEAE0", dim: "#A9AD9C", accent: "#C9A227", bar: "#8FA06B",
};

const WEEKDAYS_DE = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const WEEKDAYS_EN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const WEEKDAYS_FULL_DE = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const WEEKDAYS_FULL_EN = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const WEEKDAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

// ── Trainingstag-Setup ────────────────────────────────────────────────────────
function TrainingDaySetup({ lang, onSave }) {
  const [selected, setSelected] = useState([]);
  const days = lang === "de" ? WEEKDAYS_FULL_DE : WEEKDAYS_FULL_EN;

  const toggle = (key) => {
    setSelected(s => s.includes(key) ? s.filter(k => k !== key) : [...s, key]);
  };

  return (
    <div style={{ background: P.panel, border: `1px solid ${P.accent}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 600, color: P.text, marginBottom: 4 }}>
        {lang === "de" ? "An welchen Tagen trainierst du?" : "Which days do you train?"}
      </div>
      <div style={{ fontSize: 13, color: P.dim, marginBottom: 16 }}>
        {lang === "de" ? "Wähle deine Trainingstage – so können wir deinen Fortschritt tracken." : "Select your training days — this lets us track your progress accurately."}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {WEEKDAY_KEYS.map((key, i) => (
          <button key={key} onClick={() => toggle(key)} style={{
            padding: "8px 14px", borderRadius: 4, cursor: "pointer",
            border: `1px solid ${selected.includes(key) ? P.accent : P.border}`,
            background: selected.includes(key) ? "rgba(201,162,39,0.15)" : "transparent",
            color: selected.includes(key) ? P.accent : P.dim,
            fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: selected.includes(key) ? 600 : 400,
          }}>{days[i]}</button>
        ))}
      </div>
      <button
        onClick={() => selected.length > 0 && onSave(selected)}
        disabled={selected.length === 0}
        style={{
          width: "100%", background: P.accent, border: "none", color: "#1B1E15",
          padding: "12px 0", borderRadius: 4, fontSize: 14, fontWeight: 700,
          fontFamily: "Inter, sans-serif", cursor: selected.length > 0 ? "pointer" : "default",
          opacity: selected.length > 0 ? 1 : 0.4,
        }}
      >
        {lang === "de" ? "Speichern" : "Save"}
      </button>
    </div>
  );
}

// ── Mini-Kalender (Monatsansicht) ─────────────────────────────────────────────
function MonthCalendar({ lang, userId, trainingDays, year, month }) {
  const [logs, setLogs] = useState({});

  useEffect(() => {
    if (!userId) return;
    // Alle Logs für diesen Monat laden
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const from = formatDate(firstDay);
    const to = formatDate(lastDay);

    supabase.from("workout_logs")
      .select("week_start, day_done")
      .eq("user_id", userId)
      .gte("week_start", from)
      .lte("week_start", to)
      .then(({ data }) => {
        const map = {};
        if (data) data.forEach(row => { if (row.day_done) map[row.week_start] = true; });
        setLogs(map);
      });
  }, [userId, year, month]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mo=0
  const totalDays = lastDay.getDate();
  const today = formatDate(new Date());

  const labels = lang === "de" ? WEEKDAYS_DE : WEEKDAYS_EN;
  const monthNames_de = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const monthNames_en = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthName = lang === "de" ? monthNames_de[month] : monthNames_en[month];

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const isTrainingDay = (dayNum) => {
    const date = new Date(year, month, dayNum);
    const weekdayIdx = (date.getDay() + 6) % 7;
    return trainingDays.includes(WEEKDAY_KEYS[weekdayIdx]);
  };

  const isDone = (dayNum) => {
    const dateStr = formatDate(new Date(year, month, dayNum));
    return logs[dateStr] || false;
  };

  const isToday = (dayNum) => formatDate(new Date(year, month, dayNum)) === today;

  return (
    <div>
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 14, color: P.text, marginBottom: 12, textAlign: "center" }}>
        {monthName} {year}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {labels.map(l => (
          <div key={l} style={{ fontSize: 10, color: P.dim, textAlign: "center", fontFamily: "Oswald, sans-serif" }}>{l}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const training = isTrainingDay(d);
          const done = isDone(d);
          const today_ = isToday(d);
          return (
            <div key={d} style={{
              aspectRatio: "1", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: today_ ? 700 : 400,
              background: done ? "rgba(143,160,107,0.3)" : training ? "rgba(201,162,39,0.08)" : "transparent",
              border: today_ ? `1px solid ${P.accent}` : training && !done ? `1px solid ${P.border}` : "none",
              color: done ? P.bar : today_ ? P.accent : training ? P.text : P.dim,
            }}>{d}</div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: P.dim }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(143,160,107,0.3)", border: `1px solid ${P.bar}` }} />
          {lang === "de" ? "Abgeschlossen" : "Done"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(201,162,39,0.08)", border: `1px solid ${P.border}` }} />
          {lang === "de" ? "Geplant" : "Planned"}
        </div>
      </div>
    </div>
  );
}

// ── Fortschritts-Diagramm ─────────────────────────────────────────────────────
function ProgressChart({ lang, userId, trainingDays }) {
  const [mode, setMode] = useState("month");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!userId || trainingDays.length === 0) return;
    const now = new Date();

    if (mode === "week") {
      // Letzte 8 Wochen
      const weeks = [];
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        weeks.push(getWeekStart(d));
      }
      supabase.from("workout_logs")
        .select("week_start, day_done")
        .eq("user_id", userId)
        .in("week_start", weeks)
        .then(({ data: rows }) => {
          const map = {};
          (rows || []).forEach(r => {
            if (!map[r.week_start]) map[r.week_start] = 0;
            if (r.day_done) map[r.week_start]++;
          });
          setData(weeks.map(w => ({
            label: w.slice(5),
            done: map[w] || 0,
            planned: trainingDays.length,
          })));
        });
    } else if (mode === "month") {
      // Letzte 6 Monate
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
      }
      supabase.from("workout_logs")
        .select("week_start, day_done")
        .eq("user_id", userId)
        .gte("week_start", formatDate(new Date(months[0].year, months[0].month, 1)))
        .then(({ data: rows }) => {
          const map = {};
          (rows || []).forEach(r => {
            const key = r.week_start.slice(0, 7);
            if (!map[key]) map[key] = 0;
            if (r.day_done) map[key]++;
          });
          const monthNames = lang === "de"
            ? ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"]
            : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          setData(months.map(({ year, month }) => {
            const key = `${year}-${String(month + 1).padStart(2, "0")}`;
            const weeksInMonth = Math.ceil(new Date(year, month + 1, 0).getDate() / 7);
            return {
              label: monthNames[month],
              done: map[key] || 0,
              planned: trainingDays.length * weeksInMonth,
            };
          }));
        });
    }
  }, [mode, userId, trainingDays, lang]);

  const maxVal = Math.max(...data.map(d => d.planned), 1);
  const chartH = 80;

  return (
    <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 16, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, color: P.accent, letterSpacing: "0.08em" }}>
          {lang === "de" ? "FORTSCHRITT" : "PROGRESS"}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["week","month"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? "rgba(201,162,39,0.15)" : "transparent",
              color: mode === m ? P.accent : P.dim,
              border: `1px solid ${mode === m ? P.accent : P.border}`,
              borderRadius: 4, padding: "3px 8px", fontSize: 10,
              fontFamily: "Oswald, sans-serif", cursor: "pointer",
            }}>
              {m === "week" ? (lang === "de" ? "WOCHE" : "WEEK") : (lang === "de" ? "MONAT" : "MONTH")}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ fontSize: 12, color: P.dim }}>{lang === "de" ? "Noch keine Daten." : "No data yet."}</div>
      ) : (
        <div>
          {/* Linie */}
          <svg width="100%" height={chartH} style={{ overflow: "visible" }}>
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = chartH - (d.done / maxVal) * chartH;
              const xp = (i / (data.length - 1)) * 100;
              const yp = chartH - (d.planned / maxVal) * chartH;
              return (
                <g key={i}>
                  {i > 0 && (() => {
                    const px = ((i - 1) / (data.length - 1)) * 100;
                    const py = chartH - (data[i - 1].done / maxVal) * chartH;
                    const ppx = ((i - 1) / (data.length - 1)) * 100;
                    const ppy = chartH - (data[i - 1].planned / maxVal) * chartH;
                    return (
                      <>
                        <line x1={`${px}%`} y1={py} x2={`${x}%`} y2={y} stroke={P.bar} strokeWidth="2" strokeLinecap="round" />
                        <line x1={`${ppx}%`} y1={ppy} x2={`${xp}%`} y2={yp} stroke={P.border} strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" />
                      </>
                    );
                  })()}
                  <circle cx={`${x}%`} cy={y} r="3" fill={P.bar} />
                </g>
              );
            })}
          </svg>

          {/* Labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {data.map((d, i) => (
              <div key={i} style={{ fontSize: 10, color: P.dim, textAlign: "center" }}>{d.label}</div>
            ))}
          </div>

          {/* Legende */}
          <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 10, color: P.dim }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 16, height: 2, background: P.bar, borderRadius: 1 }} />
              {lang === "de" ? "Abgeschlossen" : "Completed"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 16, height: 0, borderTop: `1.5px dashed ${P.border}` }} />
              {lang === "de" ? "Geplant" : "Planned"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CalendarView (Haupt-Export) ───────────────────────────────────────────────
export default function CalendarView({ profile, lang }) {
  const userId = profile?.id;
  const [trainingDays, setTrainingDays] = useState(profile?.training_days || []);
  const [setupDone, setSetupDone] = useState((profile?.training_days || []).length > 0);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const saveTrainingDays = async (days) => {
    await supabase.from("profiles").update({ training_days: days }).eq("id", userId);
    setTrainingDays(days);
    setSetupDone(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div>
      {!setupDone && (
        <TrainingDaySetup lang={lang} onSave={saveTrainingDays} />
      )}

      {setupDone && (
        <>
          {/* Monat-Navigation */}
          <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button onClick={prevMonth} style={{ background: "transparent", border: `1px solid ${P.border}`, color: P.dim, borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>←</button>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, color: P.accent, letterSpacing: "0.08em" }}>
                {lang === "de" ? "KALENDER" : "CALENDAR"}
              </div>
              <button onClick={nextMonth} style={{ background: "transparent", border: `1px solid ${P.border}`, color: P.dim, borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>→</button>
            </div>
            <MonthCalendar
              lang={lang} userId={userId}
              trainingDays={trainingDays}
              year={viewYear} month={viewMonth}
            />
          </div>

          {/* Trainingstage ändern */}
          <button onClick={() => setSetupDone(false)} style={{
            background: "transparent", border: `1px solid ${P.border}`,
            color: P.dim, padding: "8px 14px", borderRadius: 4,
            fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer",
            marginBottom: 16, width: "100%",
          }}>
            {lang === "de" ? "Trainingstage ändern" : "Change training days"}
          </button>

          {/* Fortschritts-Diagramm */}
          <ProgressChart lang={lang} userId={userId} trainingDays={trainingDays} />
        </>
      )}
    </div>
  );
}
