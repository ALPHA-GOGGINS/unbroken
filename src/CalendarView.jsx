import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const P = {
  bg: "#20241C", panel: "#2A2F22", border: "#3D4530",
  text: "#EEEAE0", dim: "#A9AD9C", accent: "#C9A227", bar: "#8FA06B",
};

const WEEKDAYS_DE  = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const WEEKDAYS_EN  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const WEEKDAYS_FULL_DE = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const WEEKDAYS_FULL_EN = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const WEEKDAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function getWeekStart(date) {
  const d = date ? new Date(date) : new Date();
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = local.getDay();
  local.setDate(local.getDate() + (day===0?-6:1-day));
  return formatDate(local);
}

// ── Trainingstag-Setup ────────────────────────────────────────────────────────
function TrainingDaySetup({ lang, onSave, maxDays }) {
  const [selected, setSelected] = useState([]);
  const days = lang==="de" ? WEEKDAYS_FULL_DE : WEEKDAYS_FULL_EN;

  const toggle = (key) => {
    setSelected(s => {
      if (s.includes(key)) return s.filter(k => k!==key);
      if (s.length >= maxDays) return s;
      return [...s, key];
    });
  };

  return (
    <div style={{ background:P.panel, border:`1px solid ${P.accent}`, borderRadius:6, padding:20, marginBottom:16 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:16, fontWeight:600, color:P.text, marginBottom:4 }}>
        {lang==="de"?"An welchen Tagen trainierst du?":"Which days do you train?"}
      </div>
      <div style={{ fontSize:13, color:P.dim, marginBottom:8 }}>
        {lang==="de"?`Wähle genau ${maxDays} Trainingstage.`:`Select exactly ${maxDays} training days.`}
      </div>
      <div style={{ fontSize:12, color:P.accent, marginBottom:16 }}>
        {selected.length}/{maxDays} {lang==="de"?"ausgewählt":"selected"}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
        {WEEKDAY_KEYS.map((key, i) => (
          <button key={key} onClick={() => toggle(key)} style={{
            padding:"8px 14px", borderRadius:4,
            cursor: selected.length>=maxDays && !selected.includes(key) ? "default" : "pointer",
            border:`1px solid ${selected.includes(key)?P.accent:P.border}`,
            background: selected.includes(key)?"rgba(201,162,39,0.15)":"transparent",
            color: selected.includes(key)?P.accent:selected.length>=maxDays?P.dim:P.text,
            fontFamily:"Inter, sans-serif", fontSize:13,
            fontWeight: selected.includes(key)?600:400,
            opacity: selected.length>=maxDays && !selected.includes(key) ? 0.4 : 1,
          }}>{days[i]}</button>
        ))}
      </div>
      <button
        onClick={() => selected.length===maxDays && onSave(selected)}
        disabled={selected.length!==maxDays}
        style={{ width:"100%", background:P.accent, border:"none", color:"#1B1E15", padding:"12px 0", borderRadius:4, fontSize:14, fontWeight:700, fontFamily:"Inter, sans-serif", cursor:selected.length===maxDays?"pointer":"default", opacity:selected.length===maxDays?1:0.4 }}
      >
        {lang==="de"?"Speichern":"Save"}
      </button>
    </div>
  );
}

// ── Monatskalender ────────────────────────────────────────────────────────────
function MonthCalendar({ lang, userId, trainingDays, year, month, livedoneDates }) {
  const [dbDoneDates, setDbDoneDates] = useState(new Set());

  useEffect(() => {
    if (!userId) return;
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month+1, 0);
    supabase.from("workout_logs")
      .select("log_date, day_done")
      .eq("user_id", userId)
      .eq("day_done", true)
      .gte("log_date", formatDate(firstDay))
      .lte("log_date", formatDate(lastDay))
      .then(({ data }) => {
        setDbDoneDates(new Set((data||[]).map(r => r.log_date)));
      });
  }, [userId, year, month]);

  // Kombiniere DB-Daten mit Live-Daten aus PlanView
  const allDone = new Set([...dbDoneDates, ...(livedoneDates||[])]);

  const firstDay   = new Date(year, month, 1);
  const totalDays  = new Date(year, month+1, 0).getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const today      = getLocalDate();

  const labels = lang==="de" ? WEEKDAYS_DE : WEEKDAYS_EN;
  const monthNames_de = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const monthNames_en = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthName = lang==="de" ? monthNames_de[month] : monthNames_en[month];

  const cells = [];
  for (let i=0; i<startWeekday; i++) cells.push(null);
  for (let d=1; d<=totalDays; d++) cells.push(d);

  const isTrainingDay = (dayNum) => {
    const date = new Date(year, month, dayNum);
    const idx  = (date.getDay()+6)%7;
    return trainingDays.includes(WEEKDAY_KEYS[idx]);
  };

  const isDone = (dayNum) => allDone.has(formatDate(new Date(year, month, dayNum)));
  const isToday = (dayNum) => formatDate(new Date(year, month, dayNum))===today;

  return (
    <div>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:14, color:P.text, marginBottom:12, textAlign:"center" }}>{monthName} {year}</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
        {labels.map(l => <div key={l} style={{ fontSize:10, color:P.dim, textAlign:"center", fontFamily:"Oswald, sans-serif" }}>{l}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const training = isTrainingDay(d);
          const done     = isDone(d);
          const tod      = isToday(d);
          return (
            <div key={d} style={{ aspectRatio:"1", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:tod?700:400, background:done?"rgba(143,160,107,0.35)":training?"rgba(201,162,39,0.08)":"transparent", border:tod?`1px solid ${P.accent}`:training&&!done?`1px solid ${P.border}`:"none", color:done?P.bar:tod?P.accent:training?P.text:P.dim }}>{d}</div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:12, marginTop:10, fontSize:11, color:P.dim }}>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ width:10, height:10, borderRadius:2, background:"rgba(143,160,107,0.35)", border:`1px solid ${P.bar}` }} />
          {lang==="de"?"Abgeschlossen":"Done"}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ width:10, height:10, borderRadius:2, background:"rgba(201,162,39,0.08)", border:`1px solid ${P.border}` }} />
          {lang==="de"?"Geplant":"Planned"}
        </div>
      </div>
    </div>
  );
}

// ── Fortschritts-Diagramm ─────────────────────────────────────────────────────
function ProgressChart({ lang, userId, trainingDays }) {
  const [stats, setStats] = useState({ week: null, month: null, year: null });

  useEffect(() => {
    if (!userId || trainingDays.length === 0) return;
    const now = new Date();
    const weekStart = getWeekStart();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
    const yearStart  = `${now.getFullYear()}-01-01`;

    supabase.from("workout_logs")
      .select("log_date, week_start, day_done")
      .eq("user_id", userId)
      .eq("day_done", true)
      .gte("log_date", yearStart)
      .then(({ data: rows }) => {
        const r = rows || [];
        const weekDone  = r.filter(x => x.week_start === weekStart).length;
        const monthDone = r.filter(x => x.log_date >= monthStart).length;
        const yearDone  = r.length;

        const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
        const weekOfMonth = Math.ceil(now.getDate() / 7);
        const weekOfYear  = Math.ceil((now - new Date(now.getFullYear(),0,1)) / (7*24*60*60*1000));

        setStats({
          week:  { done: weekDone,  planned: trainingDays.length },
          month: { done: monthDone, planned: trainingDays.length * weekOfMonth },
          year:  { done: yearDone,  planned: trainingDays.length * weekOfYear  },
        });
      });
  }, [userId, trainingDays]);

  if (!stats.week) return null;

  const blocks = [
    { key: "week",  label: lang==="de" ? "DIESE WOCHE"  : "THIS WEEK"  },
    { key: "month", label: lang==="de" ? "DIESER MONAT" : "THIS MONTH" },
    { key: "year",  label: lang==="de" ? "DIESES JAHR"  : "THIS YEAR"  },
  ];

  return (
    <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:16, marginTop:16 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:12, color:P.accent, letterSpacing:"0.08em", marginBottom:16 }}>
        {lang==="de" ? "FORTSCHRITT" : "PROGRESS"}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {blocks.map(({ key, label }) => {
          const { done, planned } = stats[key];
          const pct = planned > 0 ? Math.min(Math.round((done/planned)*100), 100) : 0;
          const color = pct >= 80 ? P.bar : pct >= 50 ? P.accent : "#B57A7A";
          return (
            <div key={key}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                <div style={{ fontFamily:"Oswald, sans-serif", fontSize:11, color:P.dim, letterSpacing:"0.08em" }}>{label}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                  <span style={{ fontFamily:"Oswald, sans-serif", fontSize:26, fontWeight:700, color, lineHeight:1 }}>{pct}%</span>
                  <span style={{ fontSize:11, color:P.dim }}>{done}/{planned}</span>
                </div>
              </div>
              <div style={{ height:6, background:P.border, borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CalendarView ──────────────────────────────────────────────────────────────
export default function CalendarView({ profile, lang, weekStart, allDayDone, activeDayNames }) {
  const userId  = profile?.id;
  const maxDays = profile?.days_per_week || 3;
  const [trainingDays, setTrainingDays] = useState(profile?.training_days || []);
  const [setupDone, setSetupDone] = useState((profile?.training_days||[]).length>0);
  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Live-Done-Dates: wenn ein Tag diese Woche als done markiert,
  // mapppe ihn auf den zugehörigen Wochentag (basierend auf trainingDays-Reihenfolge)
  const liveDoneDates = [];
  if (trainingDays.length > 0 && activeDayNames && weekStart) {
    activeDayNames.forEach((dayName, i) => {
      if (allDayDone?.[dayName]) {
        const weekdayKey = trainingDays[i];
        if (weekdayKey) {
          const weekdayIdx = WEEKDAY_KEYS.indexOf(weekdayKey);
          if (weekdayIdx >= 0) {
            const monday = new Date(weekStart);
            monday.setDate(monday.getDate() + weekdayIdx);
            liveDoneDates.push(formatDate(monday));
          }
        }
      }
    });
  }

  const saveTrainingDays = async (days) => {
    await supabase.from("profiles").update({ training_days:days }).eq("id", userId);
    setTrainingDays(days);
    setSetupDone(true);
  };

  const prevMonth = () => { if(viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { if(viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1); };

  return (
    <div>
      {!setupDone ? (
        <TrainingDaySetup lang={lang} onSave={saveTrainingDays} maxDays={maxDays} />
      ) : (
        <>
          <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:16, marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <button onClick={prevMonth} style={{ background:"transparent", border:`1px solid ${P.border}`, color:P.dim, borderRadius:4, padding:"4px 10px", cursor:"pointer", fontSize:14 }}>←</button>
              <div style={{ fontFamily:"Oswald, sans-serif", fontSize:12, color:P.accent, letterSpacing:"0.08em" }}>{lang==="de"?"KALENDER":"CALENDAR"}</div>
              <button onClick={nextMonth} style={{ background:"transparent", border:`1px solid ${P.border}`, color:P.dim, borderRadius:4, padding:"4px 10px", cursor:"pointer", fontSize:14 }}>→</button>
            </div>
            <MonthCalendar lang={lang} userId={userId} trainingDays={trainingDays} year={viewYear} month={viewMonth} livedoneDates={liveDoneDates} />
          </div>

          <button onClick={() => setSetupDone(false)} style={{ background:"transparent", border:`1px solid ${P.border}`, color:P.dim, padding:"8px 14px", borderRadius:4, fontSize:12, fontFamily:"Inter, sans-serif", cursor:"pointer", marginBottom:16, width:"100%" }}>
            {lang==="de"?"Trainingstage ändern":"Change training days"}
          </button>

          <ProgressChart lang={lang} userId={userId} trainingDays={trainingDays} />
        </>
      )}
    </div>
  );
}
