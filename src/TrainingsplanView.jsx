import { useState, useEffect } from "react";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530", bg:"#20241C" };

const EQUIPMENT_OPTIONS = [
  { id: "gym", de: "Gym", en: "Gym" },
  { id: "homegym", de: "Home-Gym", en: "Home Gym" },
  { id: "bodyweight", de: "Körpergewicht", en: "Bodyweight" },
];
const LEVEL_OPTIONS = [
  { id: "anfaenger", de: "Anfänger", en: "Beginner" },
  { id: "fortgeschritten", de: "Fortgeschritten", en: "Advanced" },
];
const TAGE_OPTIONS = [3, 4, 5, 6, 7];

function Segmented({ options, value, onChange, getLabel }) {
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
      {options.map((opt) => {
        const id = typeof opt === "object" ? opt.id : opt;
        const active = value === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            padding:"7px 13px", borderRadius:4, fontSize:12, fontWeight:600,
            fontFamily:"Inter, sans-serif", cursor:"pointer",
            background: active ? P.accent : "transparent",
            color: active ? "#1B1E15" : P.dim,
            border:`1px solid ${active ? P.accent : P.border}`,
          }}>
            {getLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}

function ExerciseRow({ ex, lang }) {
  const de = lang === "de";
  // Bodyweight-Übungen mit Progressionsstufen: die Startstufe anzeigen
  const stufe = ex.stufen?.find((s) => s.stufe === ex.start_stufe);
  const name = stufe ? stufe.name : ex.uebung;
  const hinweis = stufe ? stufe.hinweis : ex.hinweis;

  return (
    <div style={{
      display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap",
      padding:"12px 0", borderBottom:`1px solid ${P.border}`,
    }}>
      <div style={{ flex:"1 1 240px" }}>
        <div style={{ fontSize:14, color:P.text, fontWeight:600, marginBottom:2 }}>
          {name}
        </div>
        <div style={{ fontSize:11, color:P.dim }}>
          {ex.slot_name}
          {ex.stufen && (
            <span style={{ color:P.accent }}> · {de ? `Stufe ${ex.start_stufe}/${ex.stufen.length}` : `Level ${ex.start_stufe}/${ex.stufen.length}`}</span>
          )}
        </div>
        {hinweis && (
          <div style={{ fontSize:11, color:P.dim, opacity:0.75, marginTop:4, maxWidth:420 }}>
            {hinweis}
          </div>
        )}
      </div>
      <div style={{ display:"flex", gap:16, alignItems:"center", flexShrink:0 }}>
        <div style={{ textAlign:"center", minWidth:48 }}>
          <div style={{ fontSize:15, color:P.accent, fontWeight:700 }}>{ex.saetze}</div>
          <div style={{ fontSize:9, color:P.dim, letterSpacing:"0.06em" }}>{de ? "SÄTZE" : "SETS"}</div>
        </div>
        <div style={{ textAlign:"center", minWidth:60 }}>
          <div style={{ fontSize:15, color:P.text, fontWeight:700 }}>
            {ex.wdh}{ex.einheit === "sek" ? (de ? "s" : "s") : ""}{ex.pro_seite ? (de ? "/Seite" : "/side") : ""}
          </div>
          <div style={{ fontSize:9, color:P.dim, letterSpacing:"0.06em" }}>
            {ex.einheit === "sek" ? (de ? "DAUER" : "TIME") : "WDH"}
          </div>
        </div>
        <div style={{ textAlign:"center", minWidth:64 }}>
          <div style={{ fontSize:13, color:P.dim }}>{ex.pause}</div>
          <div style={{ fontSize:9, color:P.dim, letterSpacing:"0.06em" }}>{de ? "PAUSE" : "REST"}</div>
        </div>
      </div>
    </div>
  );
}

function TrainingstagCard({ tag, lang }) {
  const de = lang === "de";
  return (
    <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8, flexWrap:"wrap", gap:8 }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:16, color:P.text, letterSpacing:"0.03em" }}>
          {tag.name}
        </div>
        {tag.dauer_min_geschaetzt && (
          <div style={{ fontSize:11, color:P.dim }}>
            ~{tag.dauer_min_geschaetzt} {de ? "Min." : "min"}
          </div>
        )}
      </div>
      <div>
        {tag.uebungen.map((ex) => <ExerciseRow key={ex.nr} ex={ex} lang={lang} />)}
      </div>
    </div>
  );
}

export default function TrainingsplanView({ lang, profile }) {
  const de = lang === "de";
  const [equipment, setEquipment] = useState("gym");
  const [level, setLevel] = useState(
    profile?.training_level === "beginner" ? "anfaenger" : "fortgeschritten"
  );
  const [tage, setTage] = useState(profile?.days_per_week || 3);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/content/plaene/${equipment}/${level}_${tage}tage.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => { if (!cancelled) setPlan(data); })
      .catch(() => { if (!cancelled) { setPlan(null); setError(de ? "Für diese Kombination gibt es noch keinen Plan." : "No plan exists for this combination yet."); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [equipment, level, tage, de]);

  return (
    <div>
      <div style={{
        display:"flex", flexDirection:"column", gap:12, marginBottom:24,
        background:"rgba(0,0,0,0.15)", border:`1px solid ${P.border}`, borderRadius:6, padding:16,
      }}>
        <div>
          <div style={{ fontSize:10, color:P.dim, letterSpacing:"0.1em", marginBottom:6 }}>EQUIPMENT</div>
          <Segmented options={EQUIPMENT_OPTIONS} value={equipment} onChange={setEquipment} getLabel={(o) => de ? o.de : o.en} />
        </div>
        <div>
          <div style={{ fontSize:10, color:P.dim, letterSpacing:"0.1em", marginBottom:6 }}>LEVEL</div>
          <Segmented options={LEVEL_OPTIONS} value={level} onChange={setLevel} getLabel={(o) => de ? o.de : o.en} />
        </div>
        <div>
          <div style={{ fontSize:10, color:P.dim, letterSpacing:"0.1em", marginBottom:6 }}>
            {de ? "TAGE PRO WOCHE" : "DAYS PER WEEK"}
          </div>
          <Segmented options={TAGE_OPTIONS} value={tage} onChange={setTage} getLabel={(o) => o} />
        </div>
      </div>

      {loading && (
        <div style={{ fontSize:13, color:P.dim, padding:20 }}>{de ? "Lädt…" : "Loading…"}</div>
      )}

      {error && !loading && (
        <div style={{ fontSize:13, color:"#E05252", padding:20 }}>{error}</div>
      )}

      {plan && !loading && !error && (
        <div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"Oswald, sans-serif", fontSize:20, color:P.text, marginBottom:4 }}>
              {plan.split_name}
            </div>
            <div style={{ fontSize:12, color:P.dim, lineHeight:1.6, maxWidth:640 }}>
              {plan.begruendung}
            </div>
            <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
              <div style={{ fontSize:11, color:P.accent }}>
                {de ? `${plan.block.wochen} Wochen-Block` : `${plan.block.wochen}-week block`}
              </div>
              <div style={{ fontSize:11, color:P.dim }}>
                {de ? `Deload in Woche ${plan.block.deload_woche}` : `Deload in week ${plan.block.deload_woche}`}
              </div>
              <div style={{ fontSize:11, color:P.dim }}>
                {de ? "Rhythmus:" : "Pattern:"} {plan.wochenmuster.join(" · ")}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {Object.values(plan.trainingstage).map((tag) => (
              <TrainingstagCard key={tag.id} tag={tag} lang={lang} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
