import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Nur für Admins sichtbar: wird ausschließlich aus PagePlan.jsx im AdminModule eingebunden.
// Die Daten kommen aus Supabase (RLS: Admin hat Tier 3 und darf alles lesen).

const P = {
  text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22",
  border:"#3D4530", bg:"#1B1E15", ok:"#8FA06B", bad:"#E05252",
};

// Soll-Werte laut Content-Paket v3 (README)
const SOLL = { plaene: 30, module: 15, regeln: 28, bausteine: 28, ton: 11, challenge: 40 };

const TABS = [
  { id:"status",    de:"Status",         en:"Status" },
  { id:"module",    de:"Mental-Module",  en:"Mental modules" },
  { id:"regeln",    de:"Regeln",         en:"Rules" },
  { id:"bausteine", de:"Textbausteine",  en:"Text blocks" },
  { id:"ton",       de:"Ton",            en:"Tone" },
  { id:"challenge", de:"Challenge",      en:"Challenge" },
];

const label = { fontFamily:"Oswald, sans-serif", fontSize:11, color:P.accent, letterSpacing:"0.08em" };
const meta  = { fontSize:12, color:P.dim, lineHeight:1.6 };
const card  = { background:P.bg, border:`1px solid ${P.border}`, borderRadius:4, padding:"12px 14px", marginBottom:8 };
const pre   = { whiteSpace:"pre-wrap", fontSize:13, color:P.text, lineHeight:1.7, marginTop:10 };

function Row({ children }) {
  return <div style={{ ...card, display:"flex", flexDirection:"column", gap:6 }}>{children}</div>;
}

function Details({ summary, children }) {
  return (
    <details>
      <summary style={{ cursor:"pointer", color:P.text, fontSize:14, listStyle:"none" }}>{summary}</summary>
      <div style={{ marginTop:8 }}>{children}</div>
    </details>
  );
}

export default function AdminContent({ lang }) {
  const de = lang === "de";
  const [tab, setTab] = useState("status");
  const [docs, setDocs] = useState(null);
  const [planCount, setPlanCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("content_docs").select("doc_id, daten"),
      supabase.from("training_plans").select("plan_id", { count:"exact", head:true }),
    ]).then(([d, p]) => {
      if (cancelled) return;
      const err = d.error || p.error;
      if (err) { setError(err.message); return; }
      setDocs(Object.fromEntries((d.data || []).map((r) => [r.doc_id, r.daten])));
      setPlanCount(p.count ?? 0);
    });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return <div style={{ ...meta, color:P.bad }}>{de ? "Fehler beim Laden: " : "Load error: "}{error}</div>;
  }
  if (!docs || planCount === null) {
    return <div style={meta}>{de ? "Lade Inhalte …" : "Loading content …"}</div>;
  }

  const mods      = docs.mental_module?.module ?? [];
  const regeln    = docs.regeln?.regeln ?? [];
  const bausteine = docs.textbausteine?.bausteine ?? [];
  const ton       = docs.ton_varianten?.texte ?? {};
  const tage      = docs.challenge_40_tage?.tage ?? [];

  const bausteinIds = new Set(bausteine.map((b) => b.id));
  const modIds      = new Set(mods.map((m) => m.id));
  const defekteVerweise = [];
  regeln.forEach((r) => {
    (r.textbausteine ?? []).forEach((t) => { if (!bausteinIds.has(t)) defekteVerweise.push(`${r.id} → ${t}`); });
    if (r.mental_modul && !modIds.has(r.mental_modul)) defekteVerweise.push(`${r.id} → ${r.mental_modul}`);
  });
  const nichtGenutzt = bausteine
    .filter((b) => !regeln.some((r) => (r.textbausteine ?? []).includes(b.id)))
    .map((b) => b.id);

  const checks = [
    { name: de ? "Trainingspläne" : "Training plans", ist: planCount, soll: SOLL.plaene },
    { name: de ? "Mental-Module" : "Mental modules", ist: mods.length, soll: SOLL.module },
    { name: de ? "Regeln" : "Rules", ist: regeln.length, soll: SOLL.regeln },
    { name: de ? "Textbausteine" : "Text blocks", ist: bausteine.length, soll: SOLL.bausteine },
    { name: de ? "Ton-Texte" : "Tone texts", ist: Object.keys(ton).length, soll: SOLL.ton },
    { name: de ? "Challenge-Tage" : "Challenge days", ist: tage.length, soll: SOLL.challenge },
  ];
  const alleOk = checks.every((c) => c.ist === c.soll) && defekteVerweise.length === 0;

  return (
    <div>
      <div style={{ ...label, marginBottom:12 }}>
        {de ? "INHALTE — CONTENT-PAKET V3 (LIVE AUS SUPABASE)" : "CONTENT — PACKAGE V3 (LIVE FROM SUPABASE)"}
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"7px 12px", borderRadius:4, cursor:"pointer", fontSize:12,
              fontFamily:"Inter, sans-serif", border:`1px solid ${on ? P.accent : P.border}`,
              background: on ? "rgba(201,162,39,0.14)" : "transparent", color: on ? P.accent : P.dim,
            }}>{de ? t.de : t.en}</button>
          );
        })}
      </div>

      {tab === "status" && (
        <div>
          <div style={{ ...card, borderColor: alleOk ? P.ok : P.bad }}>
            <div style={{ fontFamily:"Oswald, sans-serif", fontSize:16, color: alleOk ? P.ok : P.bad, letterSpacing:"0.05em" }}>
              {alleOk
                ? (de ? "ALLES VORHANDEN" : "EVERYTHING PRESENT")
                : (de ? "UNVOLLSTÄNDIG – SIEHE UNTEN" : "INCOMPLETE – SEE BELOW")}
            </div>
          </div>

          {checks.map((c) => {
            const ok = c.ist === c.soll;
            return (
              <div key={c.name} style={{ ...card, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:14, color:P.text }}>{c.name}</span>
                <span style={{ fontSize:14, color: ok ? P.ok : P.bad, fontFamily:"Oswald, sans-serif" }}>
                  {c.ist} / {c.soll} {ok ? "✓" : "✗"}
                </span>
              </div>
            );
          })}

          <div style={{ ...card, borderColor: defekteVerweise.length ? P.bad : P.border }}>
            <div style={label}>{de ? "QUERVERWEISE" : "CROSS-REFERENCES"}</div>
            <div style={{ ...meta, marginTop:6 }}>
              {defekteVerweise.length === 0
                ? (de ? "Alle Regeln verweisen auf existierende Textbausteine und Module."
                      : "All rules point to existing text blocks and modules.")
                : defekteVerweise.join(", ")}
            </div>
          </div>

          {nichtGenutzt.length > 0 && (
            <div style={card}>
              <div style={label}>{de ? "HINWEIS: NIRGENDS VERWENDET" : "NOTE: NOT USED ANYWHERE"}</div>
              <div style={{ ...meta, marginTop:6 }}>
                {nichtGenutzt.join(", ")} – {de
                  ? "kein Regel-Verweis. Entscheidung nötig: einbauen oder streichen."
                  : "no rule refers to it. Decision needed: add or remove."}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "module" && (
        <div>
          {[...mods].sort((a, b) => a.reihenfolge - b.reihenfolge).map((m) => (
            <Row key={m.id}>
              <Details summary={`${m.reihenfolge}. ${m.titel}`}>
                <div style={meta}>{m.untertitel} · {m.woerter} {de ? "Wörter" : "words"} · {m.lesezeit_min} min · {de ? "Trigger" : "trigger"}: {m.freischalt_trigger}</div>
                <div style={pre}>{m.text}</div>
              </Details>
            </Row>
          ))}
        </div>
      )}

      {tab === "regeln" && (
        <div>
          {regeln.map((r) => (
            <Row key={r.id}>
              <Details summary={`${r.id} · ${r.name}`}>
                <div style={meta}>
                  {de ? "Priorität" : "Priority"} {r.prioritaet} · {r.kategorie} · {de ? "Auslöser" : "trigger"}: {r.ausloeser}
                </div>
                <div style={{ ...meta, marginTop:6 }}><span style={label}>{de ? "BEDINGUNG" : "CONDITION"}</span><br />{r.bedingung_text}</div>
                <div style={{ ...meta, marginTop:6 }}><span style={label}>{de ? "AKTION" : "ACTION"}</span><br />{r.aktion_text}</div>
                {r.begruendung && <div style={{ ...meta, marginTop:6 }}><span style={label}>{de ? "BEGRÜNDUNG" : "RATIONALE"}</span><br />{r.begruendung}</div>}
                <div style={{ ...meta, marginTop:6 }}>
                  {de ? "Textbausteine" : "Text blocks"}: {(r.textbausteine ?? []).join(", ") || "–"} · {de ? "Modul" : "module"}: {r.mental_modul ?? "–"}
                </div>
              </Details>
            </Row>
          ))}
        </div>
      )}

      {tab === "bausteine" && (
        <div>
          {bausteine.map((b) => (
            <Row key={b.id}>
              <Details summary={`${b.id} · ${b.anlass}`}>
                <div style={meta}>{b.kategorie}</div>
                <div style={{ ...pre, marginTop:6 }}><span style={label}>STANDARD</span>{"\n"}{b.standard}</div>
                <div style={{ ...pre, marginTop:6 }}><span style={label}>KNALLHART</span>{"\n"}{b.knallhart}</div>
              </Details>
            </Row>
          ))}
        </div>
      )}

      {tab === "ton" && (
        <div>
          {Object.entries(ton).map(([key, v]) => (
            <Row key={key}>
              <div style={label}>{key}</div>
              <div style={{ ...meta, color:P.text }}>Standard: {v.standard}</div>
              <div style={{ ...meta, color:P.text }}>Knallhart: {v.knallhart}</div>
            </Row>
          ))}
        </div>
      )}

      {tab === "challenge" && (
        <div>
          {[1, 2, 3, 4, 5, 6].map((woche) => {
            const wt = tage.filter((t) => t.woche === woche);
            if (!wt.length) return null;
            return (
              <div key={woche} style={{ marginBottom:14 }}>
                <div style={{ ...label, marginBottom:6 }}>{de ? `WOCHE ${woche}` : `WEEK ${woche}`}</div>
                {wt.map((t) => (
                  <Row key={t.tag}>
                    <Details summary={`${de ? "Tag" : "Day"} ${t.tag} · ${t.typ}${t.vorlage ? " · " + t.vorlage : ""}${t.meilenstein ? " · ★" : ""}`}>
                      <div style={{ ...meta, color:P.text }}>{t.mental_aufgabe?.text}</div>
                      <div style={{ ...meta, marginTop:4 }}>{t.mental_aufgabe?.kategorie}</div>
                      {t.meilenstein && (
                        <div style={{ ...meta, marginTop:6, color:P.accent }}>
                          Standard: {t.meilenstein.standard}<br />Knallhart: {t.meilenstein.knallhart}
                        </div>
                      )}
                    </Details>
                  </Row>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
