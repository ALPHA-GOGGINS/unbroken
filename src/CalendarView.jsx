import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const P = {
  bg:"#20241C", panel:"#2A2F22", border:"#3D4530",
  text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", bar:"#8FA06B",
};

const WEEKDAYS_DE      = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const WEEKDAYS_EN      = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const WEEKDAYS_FULL_DE = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const WEEKDAYS_FULL_EN = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const WEEKDAY_KEYS     = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function getLocalDate() { return fmt(new Date()); }
function getWeekStart(date) {
  const d = date ? new Date(date) : new Date();
  const loc = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  loc.setDate(loc.getDate() + (loc.getDay()===0 ? -6 : 1-loc.getDay()));
  return fmt(loc);
}

// ── Trainingstag-Setup ────────────────────────────────────────────────────────
function TrainingDaySetup({ lang, onSave, daysPerWeek }) {
  const [selected, setSelected] = useState([]);
  const labels = lang==="de" ? WEEKDAYS_FULL_DE : WEEKDAYS_FULL_EN;

  const toggle = k => setSelected(s => {
    if (s.includes(k)) return s.filter(x => x!==k);
    if (s.length >= daysPerWeek) return s;
    return [...s, k];
  });

  return (
    <div style={{background:P.panel,border:`1px solid ${P.accent}`,borderRadius:6,padding:20,marginBottom:16}}>
      <div style={{fontFamily:"Oswald, sans-serif",fontSize:16,fontWeight:600,color:P.text,marginBottom:4}}>
        {lang==="de"?`An welchen ${daysPerWeek} Tagen trainierst du?`:`Which ${daysPerWeek} days do you train?`}
      </div>
      <div style={{fontSize:12,color:P.accent,marginBottom:16}}>{selected.length}/{daysPerWeek} {lang==="de"?"ausgewählt":"selected"}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
        {WEEKDAY_KEYS.map((k,i) => (
          <button key={k} onClick={() => toggle(k)} style={{
            padding:"8px 14px", borderRadius:4,
            cursor: selected.length>=daysPerWeek && !selected.includes(k) ? "default" : "pointer",
            border:`1px solid ${selected.includes(k)?P.accent:P.border}`,
            background: selected.includes(k)?"rgba(201,162,39,0.15)":"transparent",
            color: selected.includes(k)?P.accent:selected.length>=daysPerWeek?P.dim:P.text,
            fontFamily:"Inter, sans-serif",fontSize:13,
            opacity: selected.length>=daysPerWeek && !selected.includes(k) ? 0.4 : 1,
          }}>{labels[i]}</button>
        ))}
      </div>
      <button
        onClick={() => selected.length===daysPerWeek && onSave(selected)}
        disabled={selected.length!==daysPerWeek}
        style={{width:"100%",background:P.accent,border:"none",color:"#1B1E15",padding:"12px 0",borderRadius:4,fontSize:14,fontWeight:700,fontFamily:"Inter, sans-serif",cursor:selected.length===daysPerWeek?"pointer":"default",opacity:selected.length===daysPerWeek?1:0.4}}
      >
        {lang==="de"?"Speichern":"Save"}
      </button>
    </div>
  );
}

// ── Monatskalender ────────────────────────────────────────────────────────────
function MonthCalendar({ lang, userId, trainingDays, year, month, liveDoneDates }) {
  const [dbDone, setDbDone] = useState(new Set());

  useEffect(() => {
    if (!userId) return;
    const first = new Date(year, month, 1);
    const last  = new Date(year, month+1, 0);
    supabase.from("workout_logs")
      .select("log_date")
      .eq("user_id", userId)
      .eq("day_done", true)
      .gte("log_date", fmt(first))
      .lte("log_date", fmt(last))
      .then(({ data }) => setDbDone(new Set((data||[]).map(r => r.log_date))));
  }, [userId, year, month]);

  const allDone   = new Set([...dbDone, ...(liveDoneDates||[])]);
  const startWday = (new Date(year, month, 1).getDay()+6) % 7;
  const totalDays = new Date(year, month+1, 0).getDate();
  const today     = getLocalDate();
  const labels    = lang==="de" ? WEEKDAYS_DE : WEEKDAYS_EN;
  const mNames_de = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const mNames_en = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const cells     = [...Array(startWday).fill(null), ...Array.from({length:totalDays},(_,i)=>i+1)];

  return (
    <div>
      <div style={{fontFamily:"Oswald, sans-serif",fontSize:14,color:P.text,marginBottom:12,textAlign:"center"}}>
        {(lang==="de"?mNames_de:mNames_en)[month]} {year}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {labels.map(l=><div key={l} style={{fontSize:10,color:P.dim,textAlign:"center",fontFamily:"Oswald, sans-serif"}}>{l}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {cells.map((d,i) => {
          if (!d) return <div key={`e${i}`}/>;
          const ds  = fmt(new Date(year,month,d));
          const wdi = (new Date(year,month,d).getDay()+6)%7;
          const isTr  = trainingDays.includes(WEEKDAY_KEYS[wdi]);
          const isDone= allDone.has(ds);
          const isTod = ds===today;
          return (
            <div key={d} style={{aspectRatio:"1",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:isTod?700:400,
              background:isDone?"rgba(143,160,107,0.35)":isTr?"rgba(201,162,39,0.08)":"transparent",
              border:isTod?`1px solid ${P.accent}`:isTr&&!isDone?`1px solid ${P.border}`:"none",
              color:isDone?P.bar:isTod?P.accent:isTr?P.text:P.dim}}>
              {d}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:12,marginTop:10,fontSize:11,color:P.dim}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:10,height:10,borderRadius:2,background:"rgba(143,160,107,0.35)",border:`1px solid ${P.bar}`}}/>
          {lang==="de"?"Abgeschlossen":"Done"}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:10,height:10,borderRadius:2,background:"rgba(201,162,39,0.08)",border:`1px solid ${P.border}`}}/>
          {lang==="de"?"Geplant":"Planned"}
        </div>
      </div>
    </div>
  );
}

// ── Fortschritts-Anzeige ─────────────────────────────────────────────────────
function ProgressChart({ lang, daysPerWeek, allDayDone, activeDayNames, dbProgress }) {
  const weekDone  = (activeDayNames||[]).filter(d => allDayDone?.[d]).length;
  const weekTotal = daysPerWeek;

  const now          = new Date();
  const year         = now.getFullYear();
  const month        = now.getMonth();

  // Wochen im aktuellen Monat (vergangen + laufende)
  const firstOfMonth  = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  // Anzahl Wochen die im Monat begonnen haben (Montage die in diesem Monat liegen)
  let weeksInMonth = 0;
  for (let d = 1; d <= Math.min(now.getDate(), lastDayOfMonth); d++) {
    if (new Date(year, month, d).getDay() === 1) weeksInMonth++; // Montag
  }
  if (weeksInMonth === 0) weeksInMonth = 1; // mindestens 1 Woche
  const monthTotal = weeksInMonth;

  // Monate im Jahr bis heute (Jan = 1, Sep = 9)
  const yearTotal = month + 1; // Anzahl Monate die begonnen haben

  const blocks = [
    { label: lang==="de"?"DIESE WOCHE":"THIS WEEK",   done:weekDone,              total:weekTotal  },
    { label: lang==="de"?"DIESER MONAT":"THIS MONTH", done:dbProgress?.month||0,  total:monthTotal },
    { label: lang==="de"?"DIESES JAHR":"THIS YEAR",   done:dbProgress?.year||0,   total:yearTotal  },
  ];

  return (
    <div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:6,padding:16,marginTop:16}}>
      <div style={{fontFamily:"Oswald, sans-serif",fontSize:12,color:P.accent,letterSpacing:"0.08em",marginBottom:16}}>
        {lang==="de"?"FORTSCHRITT":"PROGRESS"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {blocks.map(({ label, done, total }) => {
          const pct   = total>0 ? Math.min(Math.round((done/total)*100),100) : 0;
          const color = pct>=80 ? P.bar : pct>=50 ? P.accent : "#B57A7A";
          return (
            <div key={label}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                <div style={{fontFamily:"Oswald, sans-serif",fontSize:11,color:P.dim,letterSpacing:"0.08em"}}>{label}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                  <span style={{fontFamily:"Oswald, sans-serif",fontSize:26,fontWeight:700,color,lineHeight:1}}>{pct}%</span>
                  <span style={{fontSize:11,color:P.dim}}>{done}/{total}</span>
                </div>
              </div>
              <div style={{height:6,background:P.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)"}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CalendarView (Haupt-Export) ───────────────────────────────────────────────
export default function CalendarView({ profile, lang, weekStart, allDayDone, activeDayNames, daysPerWeek, dbProgress }) {
  const userId      = profile?.id;
  const dpw         = daysPerWeek || profile?.days_per_week || 3;
  const [trainingDays, setTrainingDays] = useState(profile?.training_days||[]);
  const [setupDone, setSetupDone]       = useState((profile?.training_days||[]).length > 0);
  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Live-Datum-Mapping: abgeschlossene Plan-Tage → Kalender-Daten
  const liveDoneDates = [];
  if (trainingDays.length>0 && activeDayNames && weekStart) {
    activeDayNames.forEach((dayName, i) => {
      if (allDayDone?.[dayName]) {
        const wdKey = trainingDays[i];
        if (wdKey) {
          const wdIdx = WEEKDAY_KEYS.indexOf(wdKey);
          if (wdIdx>=0) {
            const monday = new Date(weekStart);
            monday.setDate(monday.getDate()+wdIdx);
            liveDoneDates.push(fmt(monday));
          }
        }
      }
    });
  }

  const saveDays = async (days) => {
    await supabase.from("profiles").update({training_days:days}).eq("id",userId);
    setTrainingDays(days);
    setSetupDone(true);
  };

  const prev = () => { if(viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1); };
  const next = () => { if(viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1); };

  return (
    <div>
      {!setupDone ? (
        <TrainingDaySetup lang={lang} onSave={saveDays} daysPerWeek={dpw} />
      ) : (
        <>
          <div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:6,padding:16,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <button onClick={prev} style={{background:"transparent",border:`1px solid ${P.border}`,color:P.dim,borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:14}}>←</button>
              <div style={{fontFamily:"Oswald, sans-serif",fontSize:12,color:P.accent,letterSpacing:"0.08em"}}>
                {lang==="de"?"KALENDER":"CALENDAR"}
              </div>
              <button onClick={next} style={{background:"transparent",border:`1px solid ${P.border}`,color:P.dim,borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:14}}>→</button>
            </div>
            <MonthCalendar lang={lang} userId={userId} trainingDays={trainingDays} year={viewYear} month={viewMonth} liveDoneDates={liveDoneDates}/>
          </div>

          <button onClick={() => setSetupDone(false)} style={{background:"transparent",border:`1px solid ${P.border}`,color:P.dim,padding:"8px 14px",borderRadius:4,fontSize:12,fontFamily:"Inter, sans-serif",cursor:"pointer",marginBottom:16,width:"100%"}}>
            {lang==="de"?"Trainingstage ändern":"Change training days"}
          </button>

          <ProgressChart lang={lang} daysPerWeek={dpw} allDayDone={allDayDone} activeDayNames={activeDayNames} dbProgress={dbProgress}/>
        </>
      )}
    </div>
  );
}
