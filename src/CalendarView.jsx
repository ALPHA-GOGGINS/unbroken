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

function getLocalDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekStart(date) {
  const d = date ? new Date(date) : new Date();
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = local.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + diff);
  const y = local.getFullYear();
  const mo = String(local.getMonth() + 1).padStart(2, "0");
  const dd = String(local.getDate()).padStart(2, "0");
  return `${y}-${mo}-${dd}`;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Trainingstag-Setup ────────────────────────────────────────────────────────
function TrainingDaySetup({ lang, onSave, maxDays }) {
  const [selected, setSelected] = useState([]);
  const days = lang === "de" ? WEEKDAYS_FULL_DE : WEEKDAYS_FULL_EN;

  const toggle = (key) => {
    setSelected(s => {
      if (s.includes(key)) return s.filter(k => k !== key);
      if (s.length >= maxDays) return s;
      return [...s, key];
    });
  };

  return (
    <div style={{ background: P.panel, border: `1px solid ${P.accent}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, fontWeight: 600, color: P.text, marginBottom: 4 }}>
        {lang === "de" ? "An welchen Tagen trainierst du?" : "Which days do you train?"}
      </div>
      <div style={{ fontSize: 13, color: P.dim, marginBottom: 8 }}>
        {lang === "de" ? `Wähle genau ${maxDays} Trainingstage.` : `Select exactly ${maxDays} training days.`}
      </div>
      <div style={{ fontSize: 12, color: P.accent, marginBottom: 16 }}>
        {selected.length}/{maxDays} {lang === "de" ? "ausgewählt" : "selected"}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {WEEKDAY_KEYS.map((key, i) => (
          <button key={key} onClick={() => toggle(key)} style={{
            padding: "8px 14px", borderRadius: 4,
            cursor: selected.length >= maxDays && !selected.includes(key) ? "default" : "pointer",
            border: `1px solid ${selected.includes(key) ? P.accent : P.border}`,
            background: selected.includes(key) ? "rgba(201,162,39,0.15)" : "transparent",
            color: selected.includes(key) ? P.accent : selected.length >= maxDays ? P.dim : P.text,
            fontFamily: "Inter, sans-serif", fontSize: 13,
            fontWeight: selected.includes(key) ? 600 : 400,
            opacity: selected.length >= maxDays && !selected.includes(key) ? 0.4 : 1,
          }}>{days[i]}</button>
        ))}
      </div>
      <button
        onClick={() => selected.length === maxDays && onSave(selected)}
        disabled={selected.length !== maxDays}
        style={{
          width: "100%", background: P.accent, border: "none", color: "#1B1E15",
          padding: "12px 0", borderRadius: 4, fontSize: 14, fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          cursor: selected.length === maxDays ? "pointer" : "default",
          opacity: selected.length === maxDays ? 1 : 0.4,
        }}
      >
        {lang === "de" ? "Speichern" : "Save"}
      </button>
    </div>
  );
}

// ── Monatskalender ────────────────────────────────────────────────────────────
function MonthCalendar({ lang, userId, trainingDays, year, month }) {
  const [doneDates, setDoneDates] = useState(new Set());

  useEffect(() => {
    if (!userId) return;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    supabase.from("workout_logs")
      .select("log_date, day_done")
      .eq("user_id", userId)
      .eq("day_done", true)
      .gte("log_date", formatDate(firstDay))
      .lte("log_date", formatDate(lastDay))
      .then(({ data }) => {
        const dates = new Set((data || []).map(r => r.log_date));
        setDoneDates(dates);
      });
  }, [userId, year, month]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const today = getLocalDate();

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
    return doneDates.has(dateStr);
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
          const tod = isToday(d);
          return (
            <div key={d} style={{
              aspectRatio: "1", borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: tod ? 700 : 400,
              background: done ? "rgba(143,160,107,0.35)" : training ? "rgba(201,162,39,0.08)" : "transparent",
              border: tod ? `1px solid ${P.accent}` : training && !done ? `1px solid ${P.border}` : "none",
              color: done ? P.bar : tod ? P.accent : training ? P.text : P.dim,
            }}>{d}</div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: P.dim }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(143,160,107,0.35)", border: `1px solid ${P.bar}` }} />
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
      const weeks = [];
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        weeks.push(getWeekStart(d));
      }
      supabase.from("workout_logs")
        .select("log_date, day_done")
        .eq("user_id", userId)
        .eq("day_done", true)
        .in("log_date", weeks)
        .then(({ data: rows }) => {
          const map = {};
          weeks.forEach(w => { map[w] = 0; });
          (rows || []).forEach(r => { if (map[r.log_date] !== undefined) map[r.log_date]++; });
          setData(weeks.map(w => ({
            label: w.slice(5),
            done: map[w] || 0,
            planned: trainingDays.length,
          })));
        });
    } else if (mode === "month") {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
      }
      const from = formatDate(new Date(months[0].year, months[0].month, 1));
      supabase.from("workout_logs")
        .select("log_date, day_done")
        .eq("user_id", userId)
        .eq("day_done", true)
        .gte("log_date", from)
        .then(({ data: rows }) => {
          const map = {};
          months.forEach(({ year, month }) => {
            map[`${year}-${String(month + 1).padStart(2, "0")}`] = 0;
          });
          (rows || []).forEach(r => {
            if (r.log_date) {
              const key = r.log_date.slice(0, 7);
              if (map[key] !== undefined) map[key]++;
            }
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
    } else if (mode === "year") {
      const years = [];
      for (let i = 2; i >= 0; i--) years.push(now.getFullYear() - i);
      const from = `${years[0]}-01-01`;
      supabase.from("workout_logs")
        .select("log_date, day_done")
        .eq("user_id", userId)
        .eq("day_done", true)
        .gte("log_date", from)
        .then(({ data: rows }) => {
          const map = {};
          years.forEach(y => { map[String(y)] = 0; });
          (rows || []).forEach(r => {
            if (r.log_date) {
              const key = r.log_date.slice(0, 4);
              if (map[key] !== undefined) map[key]++;
            }
          });
          setData(years.map(y => ({
            label: String(y),
            done: map[String(y)] || 0,
            planned: trainingDays.length * 52,
          })));
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
          {["week","month","year"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? "rgba(201,162,39,0.15)" : "transparent",
              color: mode === m ? P.accent : P.dim,
              border: `1px solid ${mode === m ? P.accent : P.border}`,
              borderRadius: 4, padding: "3px 8px", fontSize: 10,
              fontFamily: "Oswald, sans-serif", cursor: "pointer",
            }}>
              {m === "week" ? (lang === "de" ? "WOCHE" : "WEEK") : m === "month" ? (lang === "de" ? "MONAT" : "MONTH") : (lang === "de" ? "JAHR" : "YEAR")}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ fontSize: 12, color: P.dim }}>{lang === "de" ? "Noch keine Daten." : "No data yet."}</div>
      ) : (
        <div>
          <svg width="100%" height={chartH} style={{ overflow: "visible" }}>
            {data.map((d, i) => {
              if (data.length < 2) return null;
              const x = (i / (data.length - 1)) * 100;
              const y = chartH - (d.done / maxVal) * chartH;
              const xp = (i / (data.length - 1)) * 100;
              const yp = chartH - (d.planned / maxVal) * chartH;
              return (
                <g key={i}>
                  {i > 0 && (() => {
                    const px = ((i-1) / (data.length-1)) * 100;
                    const py = chartH - (data[i-1].done / maxVal) * chartH;
                    const ppx = ((i-1) / (data.length-1)) * 100;
                    const ppy = chartH - (data[i-1].planned / maxVal) * chartH;
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
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {data.map((d, i) => (
              <div key={i} style={{ fontSize: 10, color: P.dim, textAlign: "center" }}>{d.label}</div>
            ))}
          </div>
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

// ── CalendarView ──────────────────────────────────────────────────────────────
export default function CalendarView({ profile, lang }) {
  const userId = profile?.id;
  const maxDays = profile?.days_per_week || 3;
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
      {!setupDone ? (
        <TrainingDaySetup lang={lang} onSave={saveTrainingDays} maxDays={maxDays} />
      ) : (
        <>
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

          <button onClick={() => setSetupDone(false)} style={{
            background: "transparent", border: `1px solid ${P.border}`,
            color: P.dim, padding: "8px 14px", borderRadius: 4,
            fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer",
            marginBottom: 16, width: "100%",
          }}>
            {lang === "de" ? "Trainingstage ändern" : "Change training days"}
          </button>

          <ProgressChart lang={lang} userId={userId} trainingDays={trainingDays} />
        </>
      )}
    </div>
  );
}
