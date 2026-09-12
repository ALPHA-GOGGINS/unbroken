import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import CalendarView from "./CalendarView";

const P = {
  bg:"#20241C", panel:"#2A2F22", border:"#3D4530",
  text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", bar:"#8FA06B",
};

function getLocalDate() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}
function getWeekStart() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() + (d.getDay()===0 ? -6 : 1-d.getDay()));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const EXERCISES = {
  P1:  { de:"Bankdrücken (Langhantel)",        en:"Barbell Bench Press",            sets:3, reps:"8-10",    cat:"push" },
  P2:  { de:"Schrägbankdrücken (Kurzhantel)",  en:"Incline Dumbbell Press",         sets:3, reps:"8-10",    cat:"push" },
  P3:  { de:"Bankdrücken (Kurzhantel, flach)", en:"Flat Dumbbell Press",            sets:3, reps:"10-12",   cat:"push" },
  P4:  { de:"Butterfly / Chest Press",         en:"Chest Fly / Machine Press",      sets:3, reps:"10-12",   cat:"push" },
  P5:  { de:"Schulterdrücken (Kurzhantel)",    en:"Dumbbell Shoulder Press",        sets:3, reps:"10",      cat:"push" },
  P6:  { de:"Schulterdrücken Maschine",        en:"Machine Shoulder Press",         sets:3, reps:"10-12",   cat:"push" },
  P7:  { de:"Seitheben",                       en:"Lateral Raises",                 sets:3, reps:"12-15",   cat:"push" },
  P8:  { de:"Dips (assistiert)",               en:"Assisted Dips",                  sets:3, reps:"8-10",    cat:"push" },
  P9:  { de:"Trizepsdrücken Kabel",            en:"Cable Tricep Pushdown",          sets:3, reps:"12-15",   cat:"push" },
  P10: { de:"French Press (Kurzhantel)",       en:"Dumbbell French Press",          sets:3, reps:"10-12",   cat:"push" },
  L1:  { de:"Latzug (weiter Griff)",           en:"Lat Pulldown (Wide Grip)",       sets:3, reps:"10-12",   cat:"pull" },
  L2:  { de:"Latzug (enger Griff)",            en:"Lat Pulldown (Close Grip)",      sets:3, reps:"10-12",   cat:"pull" },
  L3:  { de:"Rudern (Kabel, sitzend)",         en:"Seated Cable Row",               sets:3, reps:"10-12",   cat:"pull" },
  L4:  { de:"Rudern (Langhantel)",             en:"Barbell Row",                    sets:3, reps:"8-10",    cat:"pull" },
  L5:  { de:"Rudern (Maschine)",               en:"Machine Row",                    sets:3, reps:"10-12",   cat:"pull" },
  L6:  { de:"Klimmzüge (assistiert)",          en:"Assisted Pull-Ups",              sets:3, reps:"6-8",     cat:"pull" },
  L7:  { de:"Face Pulls",                      en:"Face Pulls",                     sets:3, reps:"15",      cat:"pull" },
  L8:  { de:"Bizeps-Curls (Langhantel/EZ)",    en:"Barbell / EZ-Bar Curl",          sets:3, reps:"10-12",   cat:"pull" },
  L9:  { de:"Bizeps-Curls (Kurzhantel)",       en:"Dumbbell Curl",                  sets:3, reps:"10-12",   cat:"pull" },
  L10: { de:"Hammer-Curls",                    en:"Hammer Curls",                   sets:3, reps:"12",      cat:"pull" },
  B1:  { de:"Kniebeuge (Langhantel)",          en:"Barbell Squat",                  sets:3, reps:"8-10",    cat:"legs" },
  B2:  { de:"Kniebeuge (Smith Machine)",       en:"Smith Machine Squat",            sets:3, reps:"10-12",   cat:"legs" },
  B3:  { de:"Beinpresse",                      en:"Leg Press",                      sets:3, reps:"10-12",   cat:"legs" },
  B4:  { de:"Ausfallschritte (Kurzhantel)",    en:"Dumbbell Lunges",                sets:3, reps:"10/side", cat:"legs" },
  B5:  { de:"Beinstrecker",                    en:"Leg Extension",                  sets:3, reps:"12-15",   cat:"legs" },
  B6:  { de:"Beinbeuger",                      en:"Leg Curl",                       sets:3, reps:"12-15",   cat:"legs" },
  B7:  { de:"Rumänisches Kreuzheben",          en:"Romanian Deadlift",              sets:3, reps:"8-10",    cat:"legs" },
  B8:  { de:"Hüftschub (Hip Thrust)",          en:"Hip Thrust",                     sets:3, reps:"10-12",   cat:"legs" },
  B9:  { de:"Wadenheben (stehend)",            en:"Standing Calf Raise",            sets:3, reps:"15-20",   cat:"legs" },
  B10: { de:"Wadenheben (sitzend)",            en:"Seated Calf Raise",              sets:3, reps:"15-20",   cat:"legs" },
  R1:  { de:"Plank",                           en:"Plank",                          sets:3, reps:"30-45s",  cat:"core" },
  R2:  { de:"Cable Crunch",                    en:"Cable Crunch",                   sets:3, reps:"15",      cat:"core" },
  R3:  { de:"Hanging Knee Raise",              en:"Hanging Knee Raise",             sets:3, reps:"10-12",   cat:"core" },
  R4:  { de:"Russian Twist",                   en:"Russian Twist",                  sets:3, reps:"15/side", cat:"core" },
  R5:  { de:"Ab Wheel",                        en:"Ab Wheel",                       sets:3, reps:"8-10",    cat:"core" },
  K1:  { de:"Zone-2-Cardio (Rad/Laufband)",    en:"Zone 2 Cardio (Bike/Treadmill)", sets:1, reps:"10-15 min", cat:"cardio" },
  K2:  { de:"Intervall-Sprints (Rad)",         en:"Interval Sprints (Bike)",        sets:8, reps:"30 sec",  cat:"cardio" },
  K3:  { de:"Rudergerät (locker)",             en:"Rowing Machine (easy)",          sets:1, reps:"10 min",  cat:"cardio" },
};

const CAT_STYLE = {
  push:   { label:"PUSH",   color:"#C9A227" },
  pull:   { label:"PULL",   color:"#8FA06B" },
  legs:   { label:"LEGS",   color:"#7A9BB5" },
  core:   { label:"CORE",   color:"#B57A7A" },
  cardio: { label:"CARDIO", color:"#A9AD9C" },
};

const SPLITS = {
  "3": {
    de:"Ganzkörper A/B/C", en:"Full Body A/B/C",
    days:{ "Full Body A":["P1","L3","B1","R1"], "Full Body B":["P5","L6","B3","R2"], "Full Body C":["P8","L4","B7","R3"] },
  },
  "4": {
    de:"Oberkörper / Unterkörper", en:"Upper / Lower",
    days:{ "Upper A":["P1","L3","P5","L8","R1"], "Lower A":["B1","B5","B6","B9","R2"], "Upper B":["P2","L4","P7","L9","R3"], "Lower B":["B3","B4","B7","B10","R4"] },
  },
  "5": {
    de:"Push / Pull / Legs + Hybrid", en:"Push / Pull / Legs + Hybrid",
    days:{ "Push":["P1","P5","P8","P9","R1"], "Pull":["L3","L6","L4","L8","R2"], "Legs":["B1","B5","B6","B9"], "Upper Mix":["P2","L1","P7","L9","R3"], "Lower Mix":["B3","B7","B8","B10","R4"] },
  },
  "6": {
    de:"PPL × 2", en:"PPL × 2",
    days:{ "Push A":["P1","P5","P8","P9"], "Pull A":["L3","L6","L4","L8","R1"], "Legs A":["B1","B5","B6","B9"], "Push B":["P2","P6","P7","P10","R2"], "Pull B":["L1","L5","L7","L9","R3"], "Legs B":["B2","B3","B7","B10","R4"] },
  },
};

// Ton-Texte mit korrekten Hinweisen je Kategorie
const SET_INSTRUCTION = {
  standard: {
    push:   { de:"Sauber ausführen – lieber weniger Gewicht als schlechte Technik.",      en:"Execute clean – less weight with good form beats more weight with bad form." },
    pull:   { de:"Kontrollierte Bewegung, Schulterblätter aktiv einsetzen.",              en:"Controlled movement, actively engage your shoulder blades." },
    legs:   { de:"Knie stabil halten, Gewicht gleichmäßig verteilen.",                   en:"Keep knees stable, distribute weight evenly." },
    core:   { de:"Körperspannung halten, keine Ausweichbewegungen.",                     en:"Maintain full body tension, no compensating movements." },
    cardio: { de:"Konstantes Tempo, Atmung kontrollieren.",                               en:"Steady pace, control your breathing." },
  },
  hardcore: {
    push:   { de:"Keine halben Sachen. Wenn die letzte Wdh. nicht wehtut – zu leicht.",  en:"No half reps. If the last one didn't hurt, it was too light." },
    pull:   { de:"Jede Wiederholung mit voller Amplitude. Kein Schummeln.",               en:"Full range every rep. No cheating." },
    legs:   { de:"Tief runter, hart raus. Beine wackeln ist kein Grund aufzuhören.",     en:"Go deep, push hard. Shaking legs are not a reason to stop." },
    core:   { de:"Maximale Anspannung. Dein Körpergewicht IST das Gewicht.",              en:"Maximum tension. Your bodyweight IS the weight." },
    cardio: { de:"Kein Tempo das sich angenehm anfühlt. Unangenehm ist das Ziel.",       en:"No pace that feels comfortable. Uncomfortable is the goal." },
  },
};

const TONE_TEXTS = {
  standard: {
    de:{ intro:"Das ist dein Plan. Er wird mit dir wachsen. Zeig auf, halt dich dran, der Rest kommt von selbst.", completion:"Geschafft. Ein Tag mehr, an dem du dranbleibst.", missedDay:"Ein verpasster Tag ist kein Weltuntergang. Morgen geht's weiter." },
    en:{ intro:"This is your plan. It grows with you. Show up, stick with it, the rest takes care of itself.", completion:"Done. One more day you showed up.", missedDay:"A missed day isn't the end. Get back at it tomorrow." },
  },
  hardcore: {
    de:{ intro:"Niemand rettet dich. Der Plan ist da. Du entscheidest, ob du ihn benutzt oder wieder eine Ausrede findest.", completion:"Fertig. Die meisten hätten heute aufgehört. Du nicht.", missedDay:"Verpasst ist verpasst. Morgen zählt, nicht heute." },
    en:{ intro:"Nobody is coming to save you. The plan is there. You decide whether you use it or find another excuse.", completion:"Done. Most people would have quit today. Not you.", missedDay:"Missed is missed. Tomorrow counts, not today." },
  },
};

function getToneText(toneKey, lang) {
  return TONE_TEXTS[toneKey]?.[lang==="en"?"en":"de"] || TONE_TEXTS.standard.de;
}
function getSetInstruction(toneKey, cat, lang) {
  return SET_INSTRUCTION[toneKey]?.[cat]?.[lang==="en"?"en":"de"] || SET_INSTRUCTION.standard.core.de;
}

// ── ExerciseCard ──────────────────────────────────────────────────────────────
function ExerciseCard({ id, checked, onToggle, toneKey, lang }) {
  const ex = EXERCISES[id];
  if (!ex) return null;
  const cat   = CAT_STYLE[ex.cat] || CAT_STYLE.core;
  const name  = lang==="en" ? ex.en : ex.de;
  const instr = getSetInstruction(toneKey, ex.cat, lang);
  return (
    <div onClick={onToggle} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",borderRadius:4,cursor:"pointer",border:`1px solid ${checked?P.accent:P.border}`,background:checked?"rgba(201,162,39,0.06)":"transparent",marginBottom:8}}>
      <div style={{width:20,height:20,borderRadius:4,flexShrink:0,marginTop:1,border:`2px solid ${checked?P.accent:P.border}`,background:checked?P.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1B1E15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{flex:1}}>
        <div style={{display:"flex",gap:8,marginBottom:2}}>
          <span style={{fontSize:11,fontFamily:"Oswald, sans-serif",color:cat.color,letterSpacing:"0.06em"}}>{cat.label}</span>
          <span style={{fontSize:11,color:P.dim}}>{id}</span>
        </div>
        <div style={{fontSize:14,color:checked?P.dim:P.text,textDecoration:checked?"line-through":"none",fontWeight:500}}>{name}</div>
        <div style={{fontSize:12,color:P.dim,marginTop:2}}>{ex.sets} {lang==="de"?"Sätze":"sets"} · {ex.reps}</div>
        <div style={{fontSize:11,color:P.dim,marginTop:4,fontStyle:"italic"}}>{instr}</div>
      </div>
    </div>
  );
}

// ── DayPanel ──────────────────────────────────────────────────────────────────
function DayPanel({ dayKey, exerciseIds, toneKey, lang, checked, dayDone, onToggle, onCheckAll, saving }) {
  const total = exerciseIds.length;
  const done  = Object.values(checked).filter(Boolean).length;
  const allChecked = done === total && total > 0;
  const tone  = getToneText(toneKey, lang);
  return (
    <div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:6,padding:20,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontFamily:"Oswald, sans-serif",fontSize:16,fontWeight:600,color:P.text}}>{dayKey}</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:12,color:P.dim}}>{done}/{total}</div>
          <div style={{width:60,height:4,background:P.border,borderRadius:2}}>
            <div style={{width:`${total>0?(done/total)*100:0}%`,height:4,background:P.accent,borderRadius:2,transition:"width 0.3s"}}/>
          </div>
        </div>
      </div>
      {exerciseIds.map(id => (
        <ExerciseCard key={id} id={id} toneKey={toneKey} lang={lang} checked={!!checked[id]} onToggle={() => onToggle(id)}/>
      ))}
      <button onClick={onCheckAll} style={{marginTop:8,width:"100%",background:"transparent",border:`1px solid ${allChecked?P.accent:P.border}`,color:allChecked?P.accent:P.dim,padding:"10px 0",borderRadius:4,fontSize:13,fontFamily:"Inter, sans-serif",cursor:"pointer"}}>
        {saving ? "…" : allChecked ? (lang==="de"?"Alle rückgängig":"Uncheck all") : (lang==="de"?"Alle abhaken":"Check all")}
      </button>
      {dayDone && (
        <div style={{marginTop:12,padding:"12px 14px",background:"rgba(143,160,107,0.12)",border:`1px solid ${P.bar}`,borderRadius:4}}>
          <div style={{fontFamily:"Oswald, sans-serif",fontSize:14,color:P.bar}}>{lang==="de"?"✓ WORKOUT ABGESCHLOSSEN":"✓ WORKOUT COMPLETE"}</div>
          <div style={{fontSize:12,color:P.dim,marginTop:4}}>{tone.completion}</div>
        </div>
      )}
    </div>
  );
}

// ── PlanView ──────────────────────────────────────────────────────────────────
export default function PlanView({ profile, lang, isAdmin }) {
  const userId     = profile?.id;
  const weekStart  = getWeekStart();
  const daysPerWeek = profile?.days_per_week || 3;
  const daysKey    = String(daysPerWeek);
  const split      = SPLITS[daysKey] || SPLITS["3"];
  const dayNames   = Object.keys(split.days);

  const [adminDays,    setAdminDays]    = useState(daysKey);
  // Ton aus Profil laden und beim Ändern in Supabase speichern
  const [toneOverride, setToneOverride] = useState(profile?.tone==="hardcore"?"hardcore":"standard");
  const [activeDay,    setActiveDay]    = useState(dayNames[0]);
  const [allChecked,   setAllChecked]   = useState({});
  const [allDayDone,   setAllDayDone]   = useState({});
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  const activeSplit    = SPLITS[isAdmin ? adminDays : daysKey] || SPLITS["3"];
  const activeDayNames = Object.keys(activeSplit.days);

  // Ton speichern wenn geändert
  const handleToneChange = async (t) => {
    setToneOverride(t);
    if (userId) await supabase.from("profiles").update({ tone: t }).eq("id", userId);
  };

  // Logs laden
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase.from("workout_logs")
      .select("day_key, completed_exercises, day_done")
      .eq("user_id", userId)
      .eq("week_start", weekStart)
      .then(({ data, error }) => {
        if (error) console.error("Load error:", error);
        const checked = {};
        const done    = {};
        activeDayNames.forEach(d => { checked[d]={}; done[d]=false; });
        (data||[]).forEach(row => {
          const map = {};
          (row.completed_exercises||[]).forEach(id => { map[id]=true; });
          checked[row.day_key] = map;
          done[row.day_key]    = row.day_done||false;
        });
        setAllChecked(checked);
        setAllDayDone(done);
        setLoading(false);
      });
  }, [userId, weekStart, adminDays, daysKey]);

  const save = async (dayKey, newChecked, newDone) => {
    if (!userId) return;
    const completed = Object.entries(newChecked).filter(([,v])=>v).map(([k])=>k);
    setSaving(true);
    const today = getLocalDate();
    // Erst upsert ohne log_date
    const { error } = await supabase.from("workout_logs").upsert({
      user_id:             userId,
      week_start:          weekStart,
      day_key:             dayKey,
      completed_exercises: completed,
      day_done:            newDone,
    }, { onConflict: "user_id,week_start,day_key" });
    // Dann log_date separat updaten (kein Konflikt möglich)
    if (!error) {
      await supabase.from("workout_logs")
        .update({ log_date: today })
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .eq("day_key", dayKey);
    }
    if (error) console.error("Save error:", error);
    setSaving(false);
  };

  const handleToggle = async (dayKey, exId) => {
    const current     = allChecked[dayKey]||{};
    const next        = { ...current, [exId]: !current[exId] };
    const exerciseIds = activeSplit.days[dayKey]||[];
    const done        = exerciseIds.every(id => next[id]);
    setAllChecked(prev => ({ ...prev, [dayKey]:next }));
    setAllDayDone(prev => ({ ...prev, [dayKey]:done }));
    await save(dayKey, next, done);
  };

  const handleCheckAll = async (dayKey) => {
    const exerciseIds = activeSplit.days[dayKey]||[];
    const current     = allChecked[dayKey]||{};
    const allDone     = exerciseIds.every(id => current[id]);
    const next        = {};
    if (!allDone) exerciseIds.forEach(id => { next[id]=true; });
    setAllChecked(prev => ({ ...prev, [dayKey]:next }));
    setAllDayDone(prev => ({ ...prev, [dayKey]:!allDone }));
    await save(dayKey, next, !allDone);
  };

  if (loading) return <div style={{color:P.dim,fontSize:13,padding:16}}>…</div>;

  return (
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr)"}} className="plan-grid">
      <style>{`@media(min-width:900px){.plan-grid{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)!important;gap:24px!important;align-items:start;}}`}</style>

      {/* Linke Spalte – Plan */}
      <div>
        {isAdmin && (
          <div style={{background:"rgba(201,162,39,0.08)",border:`1px solid ${P.accent}`,borderRadius:6,padding:14,marginBottom:16}}>
            <div style={{fontFamily:"Oswald, sans-serif",fontSize:11,color:P.accent,letterSpacing:"0.1em",marginBottom:10}}>ADMIN – ALLE PLÄNE</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["3","4","5","6"].map(d => (
                <button key={d} onClick={() => { setAdminDays(d); setActiveDay(Object.keys(SPLITS[d].days)[0]); }} style={{background:adminDays===d?P.accent:"transparent",color:adminDays===d?"#1B1E15":P.dim,border:`1px solid ${adminDays===d?P.accent:P.border}`,borderRadius:4,padding:"5px 12px",fontSize:11,fontFamily:"Oswald, sans-serif",cursor:"pointer"}}>
                  {d} {lang==="de"?"Tage":"days"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:6,padding:20,marginBottom:16}}>
          <div style={{fontFamily:"Oswald, sans-serif",fontSize:11,color:P.accent,letterSpacing:"0.1em",marginBottom:4}}>{lang==="de"?"DEIN PLAN":"YOUR PLAN"}</div>
          <div style={{fontFamily:"Oswald, sans-serif",fontSize:20,fontWeight:700,color:P.text,marginBottom:4}}>{lang==="en"?activeSplit.en:activeSplit.de}</div>
          <div style={{fontSize:13,color:P.dim,lineHeight:1.5,marginBottom:14}}>{getToneText(toneOverride,lang).intro}</div>
          <div style={{display:"flex",gap:6}}>
            {["standard","hardcore"].map(t => (
              <button key={t} onClick={() => handleToneChange(t)} style={{background:toneOverride===t?"rgba(201,162,39,0.15)":"transparent",color:toneOverride===t?P.accent:P.dim,border:`1px solid ${toneOverride===t?P.accent:P.border}`,borderRadius:4,padding:"5px 12px",fontSize:11,fontFamily:"Oswald, sans-serif",cursor:"pointer"}}>
                {t==="standard"?"STANDARD":(lang==="de"?"KNALLHART":"HARDCORE")}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {activeDayNames.map((dayName,i) => (
            <button key={dayName} onClick={() => setActiveDay(dayName)} style={{background:activeDay===dayName?"rgba(201,162,39,0.15)":"transparent",color:activeDay===dayName?P.accent:P.dim,border:`1px solid ${activeDay===dayName?P.accent:P.border}`,borderRadius:4,padding:"6px 12px",fontSize:11,fontFamily:"Oswald, sans-serif",cursor:"pointer",position:"relative"}}>
              {lang==="de"?`TAG ${i+1}`:`DAY ${i+1}`}
              {allDayDone[dayName] && <span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:P.bar}}/>}
            </button>
          ))}
        </div>

        <DayPanel
          dayKey={activeDay}
          exerciseIds={activeSplit.days[activeDay]||[]}
          toneKey={toneOverride}
          lang={lang}
          checked={allChecked[activeDay]||{}}
          dayDone={allDayDone[activeDay]||false}
          onToggle={exId => handleToggle(activeDay, exId)}
          onCheckAll={() => handleCheckAll(activeDay)}
          saving={saving}
        />

        <div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:6,padding:16}}>
          <div style={{fontFamily:"Oswald, sans-serif",fontSize:12,color:P.accent,letterSpacing:"0.08em",marginBottom:8}}>PROGRESSION</div>
          <div style={{fontSize:12,color:P.dim,lineHeight:1.7}}>
            {lang==="de"
              ?"Alle 2 Wochen: +1 Wdh. pro Satz. Oberes Ende erreicht: +2,5–5 kg, Wdh. zurück. Alle 6–8 Wochen: Deload-Woche (–20% Volumen)."
              :"Every 2 weeks: +1 rep per set. Top of range: +2.5–5 kg, reps reset. Every 6–8 weeks: deload week (–20% volume)."}
          </div>
        </div>
      </div>

      {/* Rechte Spalte – Kalender */}
      <div>
        <CalendarView
          profile={profile}
          lang={lang}
          weekStart={weekStart}
          allDayDone={allDayDone}
          activeDayNames={activeDayNames}
          daysPerWeek={isAdmin ? parseInt(adminDays) : (profile?.days_per_week || 3)}
        />
      </div>
    </div>
  );
}
