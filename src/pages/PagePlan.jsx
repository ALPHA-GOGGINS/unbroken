import WaitlistForm from "../WaitlistForm";
import TrainingsplanView from "../TrainingsplanView";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

function CountdownBox({ value, label }) {
  return (
    <div style={{
      background:P.panel, border:`1px solid ${P.border}`, borderRadius:6,
      padding:"18px 12px", textAlign:"center", minWidth:78, flex:"1 1 78px", maxWidth:120,
    }}>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontWeight:700,
        fontSize:"clamp(26px, 5vw, 38px)", lineHeight:1,
        color:P.dim, opacity:0.45, marginBottom:6,
      }}>{value}</div>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontSize:10, letterSpacing:"0.12em",
        color:P.dim, opacity:0.6,
      }}>{label}</div>
    </div>
  );
}

// COMING SOON – für alle außer Admin
function ComingSoonPage({ lang }) {
  const de = lang === "de";
  const units = de
    ? [["--","TAGE"],["--","STUNDEN"],["--","MINUTEN"]]
    : [["--","DAYS"],["--","HOURS"],["--","MINUTES"]];

  return (
    <div style={{ maxWidth:600, width:"100%" }}>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.06em",
        fontSize:"clamp(40px, 8vw, 64px)", lineHeight:1, color:P.accent,
      }}>COMING</div>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.06em",
        fontSize:"clamp(40px, 8vw, 64px)", lineHeight:1, color:P.text, marginBottom:24,
      }}>SOON.</div>

      <div style={{ width:56, height:3, background:P.accent, marginBottom:28 }}/>

      <div style={{ fontSize:15, color:P.dim, lineHeight:1.7, marginBottom:32, maxWidth:460 }}>
        {de
          ? "Der Trainingsplan wird gerade fertiggestellt. Sobald das Startdatum feststeht, läuft hier der Countdown bis zum Launch."
          : "The training plan is being finalised. Once the launch date is set, the countdown will run right here."}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {units.map(([v,l]) => <CountdownBox key={l} value={v} label={l} />)}
      </div>

      <div style={{
        display:"inline-block", padding:"8px 16px", borderRadius:4,
        border:`1px solid ${P.border}`, background:"rgba(201,162,39,0.06)",
        fontFamily:"Oswald, sans-serif", fontSize:11, letterSpacing:"0.1em", color:P.accent,
        marginBottom:32,
      }}>
        {de ? "COUNTDOWN GEHT BALD LIVE" : "COUNTDOWN GOES LIVE SOON"}
      </div>

      <div style={{ borderTop:`1px solid ${P.border}`, paddingTop:32, marginTop:8 }}>
        <WaitlistForm lang={lang} compact />
      </div>
    </div>
  );
}

// ADMIN-MODUL – nur für Admin sichtbar
function AdminModule({ lang, profile }) {
  const de = lang === "de";

  return (
    <div style={{ width:"100%" }}>
      <div style={{
        background:"rgba(201,162,39,0.08)", border:`1px solid #C9A227`,
        borderRadius:6, padding:"12px 16px", marginBottom:24,
      }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:11, color:"#C9A227", letterSpacing:"0.12em", marginBottom:4 }}>
          ADMIN – BAUKASTEN
        </div>
        <div style={{ fontSize:12, color:P.dim, lineHeight:1.6 }}>
          {de
            ? "Testbereich für die App-Struktur. Normale Nutzer sehen nur die Coming-Soon-Seite mit Warteliste."
            : "Testing area for app structure. Regular users see only the Coming Soon page with waitlist."}
        </div>
      </div>

      <div style={{
        fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.05em",
        fontSize:"clamp(28px,5vw,40px)", color:P.text, marginBottom:20,
      }}>
        {de ? "STRUKTURPLANUNG" : "STRUCTURE PLANNING"}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20 }}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:13, color:P.accent, marginBottom:16, letterSpacing:"0.06em" }}>
            📋 TRAININGSPLAN — CONTENT-PAKET V3
          </div>
          <TrainingsplanView lang={lang} profile={profile} />
        </div>

        <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20 }}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:13, color:P.accent, marginBottom:8, letterSpacing:"0.06em" }}>
            🧠 MENTAL MODULE (TIER 2+)
          </div>
          <div style={{ fontSize:12, color:P.dim, lineHeight:1.7 }}>
            {de
              ? "15 fertige Texte sind da (Content-Paket v3). Anzeige + Freischalt-Logik kommt als nächster Schritt."
              : "15 finished texts are ready (Content package v3). Display + unlock logic is the next step."}
          </div>
        </div>

        <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20 }}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:13, color:P.accent, marginBottom:8, letterSpacing:"0.06em" }}>
            📊 MEIN RÜCKBLICK (TIER 2+)
          </div>
          <div style={{ fontSize:12, color:P.dim, lineHeight:1.7 }}>
            {de
              ? "Statistiken: Compliance (% Sessions gemacht), Streak (aktuelle Tage), Trends (Leistung über Zeit)."
              : "Stats: compliance (% sessions completed), streak (current days), trends (performance over time)."}
          </div>
        </div>

        <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20 }}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:13, color:P.accent, marginBottom:8, letterSpacing:"0.06em" }}>
            ⚙️ EINSTELLUNGEN
          </div>
          <div style={{ fontSize:12, color:P.dim, lineHeight:1.7 }}>
            {de
              ? "Sprache, Benachrichtigungen, Account-Settings. (Sprache ist schon im separaten /settings-Bereich.)"
              : "Language, notifications, account settings. (Language is already in the separate /settings area.)"}
          </div>
        </div>
      </div>

      <div style={{ marginTop:32, padding:20, background:"rgba(201,162,39,0.06)", borderRadius:6, border:`1px solid ${P.border}` }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:12, color:P.accent, marginBottom:8, letterSpacing:"0.06em" }}>
          HINWEIS
        </div>
        <div style={{ fontSize:12, color:P.dim, lineHeight:1.7 }}>
          {de
            ? "Trainingspläne (30x), Mental-Module (15x), Wenn-Dann-Regeln (28x) und Textbausteine sind als Content-Paket v3 eingebaut. Tag-für-Tag-Freischaltung, Logging und Regel-Engine folgen als nächste Schritte."
            : "Training plans (30x), mental modules (15x), if-then rules (28x) and text blocks are built in as Content Package v3. Day-by-day unlocking, logging and the rules engine are the next steps."}
        </div>
      </div>
    </div>
  );
}

export default function PagePlan({ lang, session, profile }) {
  const de = lang === "de";
  const isAdmin = profile?.is_admin;

  // Admin sieht Baukasten, alle anderen sehen Coming Soon
  if (isAdmin) {
    return <AdminModule lang={lang} profile={profile} />;
  }

  return <ComingSoonPage lang={lang} />;
}
