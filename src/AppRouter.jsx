import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import CinematicIntro from "./CinematicIntro";
import PageStart     from "./pages/PageStart";
import PageConcept   from "./pages/PageConcept";
import PageSurvey    from "./pages/PageSurvey";
import PageResults   from "./pages/PageResults";
import PageManifesto from "./pages/PageManifesto";
import PagePlan      from "./pages/PagePlan";
import PageLogin     from "./pages/PageLogin";
import PageWaitlist  from "./pages/PageWaitlist";
import PagePricing   from "./pages/PagePricing";
import PageSettings  from "./pages/PageSettings";

const P = {
  bg:"#20241C", panel:"#2A2F22", border:"#3D4530",
  text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227",
};

// Hier die echten Links eintragen
const SOCIAL = {
  youtube: "https://www.youtube.com/",
  discord: "https://discord.gg/",
};

function SocialLinks() {
  const icon = { width:18, height:18, display:"block" };
  const wrap = {
    display:"flex", alignItems:"center", justifyContent:"center",
    width:34, height:34, borderRadius:4,
    border:`1px solid ${P.border}`, background:"transparent",
    transition:"border-color 0.2s",
  };
  return (
    <div style={{ display:"flex", gap:8 }}>
      <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" style={wrap} aria-label="YouTube">
        <svg viewBox="0 0 24 24" style={icon} fill={P.dim}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/>
        </svg>
      </a>
      <a href={SOCIAL.discord} target="_blank" rel="noopener noreferrer" style={wrap} aria-label="Discord">
        <svg viewBox="0 0 24 24" style={icon} fill={P.dim}>
          <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.5c1.6.4 3 1 4.3 1.9a16.6 16.6 0 0 0-15 0A15.4 15.4 0 0 1 8.8 3.5L8.6 3a19.8 19.8 0 0 0-4.9 1.4C.6 9 0 13.5.3 17.9a19.9 19.9 0 0 0 6 3l1.2-1.7c-1-.4-1.9-.8-2.7-1.4l.7-.5a14.2 14.2 0 0 0 12.2 0l.7.5c-.9.6-1.8 1-2.8 1.4l1.3 1.7a19.8 19.8 0 0 0 6-3c.4-5.1-.6-9.5-2.6-13.5zM8.1 15.3c-1.2 0-2.1-1.1-2.1-2.4S6.9 10.5 8 10.5s2.2 1.1 2.1 2.4c0 1.3-.9 2.4-2.1 2.4zm7.8 0c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.2 1.1 2.1 2.4c0 1.3-.9 2.4-2.1 2.4z"/>
        </svg>
      </a>
    </div>
  );
}

function PageNotFound({ lang }) {
  const de = lang === "de";
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth:520 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.06em",
                    fontSize:"clamp(40px,8vw,64px)", lineHeight:1, color:P.accent }}>404</div>
      <div style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.06em",
                    fontSize:"clamp(24px,5vw,36px)", lineHeight:1, color:P.text, marginBottom:20 }}>
        {de ? "SEITE NICHT GEFUNDEN." : "PAGE NOT FOUND."}
      </div>
      <div style={{ width:48, height:3, background:P.accent, marginBottom:24 }}/>
      <p style={{ fontSize:15, color:P.dim, lineHeight:1.7, marginBottom:28 }}>
        {de ? "Diese Adresse gibt es nicht. Zurück zum Anfang."
            : "This address doesn't exist. Back to the start."}
      </p>
      <button className="ub-btn-primary" onClick={() => navigate("/")}>
        {de ? "ZUR STARTSEITE" : "GO TO HOMEPAGE"}
      </button>
    </div>
  );
}

export default function AppRouter({ session, profile, showIntro, onIntroDone }) {
  const [lang, setLang]         = useState(profile?.language || "de");
  const [menuOpen, setMenu]     = useState(false);
  const [introVisible, setIntroVisible] = useState(showIntro);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => { setMenu(false); }, [location.pathname]);

  const navItems = lang === "de"
    ? [
        { path:"/",           label:"Start",       exact:true },
        { path:"/konzept",    label:"Konzept" },
        { path:"/umfrage",    label:"Umfrage" },
        { path:"/ergebnisse", label:"Ergebnisse" },
        { path:"/manifest",   label:"Manifest" },
        { path:"/preise",     label:"Preise" },
        { path:"/plan",       label:"Mein Bereich", highlight:true },
      ]
    : [
        { path:"/",           label:"Start",       exact:true },
        { path:"/concept",    label:"Concept" },
        { path:"/survey",     label:"Survey" },
        { path:"/results",    label:"Results" },
        { path:"/manifesto",  label:"Manifesto" },
        { path:"/pricing",    label:"Pricing" },
        { path:"/plan",       label:"My Area",     highlight:true },
      ];

  const Sidebar = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"32px 24px" }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, fontSize:22, color:P.text, letterSpacing:"0.05em", marginBottom:4, cursor:"pointer" }} onClick={() => { navigate("/"); setMenu(false); }}>
        UNBROKEN
      </div>
      <div style={{ fontSize:11, color:P.dim, marginBottom:40, letterSpacing:"0.04em" }}>
        {lang==="de"?"Disziplin. Kein Puder.":"Discipline. No Sugarcoat."}
      </div>

      <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={!!item.exact}
            style={({ isActive }) => ({
              display:"block", padding:"11px 14px", borderRadius:4,
              fontFamily:"Oswald, sans-serif", fontSize:15, letterSpacing:"0.04em",
              textDecoration:"none",
              background: isActive ? "rgba(201,162,39,0.15)" : "transparent",
              color: item.highlight ? P.accent : isActive ? P.accent : P.dim,
              border: item.highlight ? `1px solid rgba(201,162,39,0.4)` : "1px solid transparent",
              fontWeight: item.highlight ? 700 : 400,
            })}
          >{item.label}</NavLink>
        ))}

        <NavLink to={lang==="de" ? "/einstellungen" : "/settings"} style={({ isActive }) => ({
          display:"block", padding:"11px 14px", borderRadius:4, marginTop:8,
          fontFamily:"Oswald, sans-serif", fontSize:14, letterSpacing:"0.04em",
          textDecoration:"none",
          background: isActive ? "rgba(201,162,39,0.15)" : "transparent",
          color: isActive ? P.accent : P.dim,
          border: "1px solid transparent",
        })}>
          {lang==="de" ? "Einstellungen" : "Settings"}
        </NavLink>
      </nav>

      {profile?.is_admin && (
        <div style={{ marginBottom:16, paddingTop:16, borderTop:`1px solid ${P.border}` }}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:10, color:P.dim, letterSpacing:"0.14em", marginBottom:8, paddingLeft:14 }}>
            ADMIN
          </div>
          <div style={{ padding:"8px 14px", borderRadius:4, border:`1px solid ${P.accent}`, background:"rgba(201,162,39,0.08)", fontFamily:"Oswald, sans-serif", fontSize:11, color:P.accent, letterSpacing:"0.06em" }}>
            {lang==="de" ? "Baukasten unter ›Mein Bereich›" : "Builder in 'My Area'"}
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <SocialLinks />
        {session ? (
          <button onClick={() => supabase.auth.signOut()} style={{
            background:"transparent", border:`1px solid ${P.border}`, color:P.dim,
            padding:"9px 0", borderRadius:4, fontSize:12,
            fontFamily:"Inter, sans-serif", cursor:"pointer",
          }}>
            {lang==="de"?"Abmelden":"Sign out"}
          </button>
        ) : (
          <button onClick={() => { navigate("/login"); setMenu(false); }} style={{
            background:"transparent", border:`1px solid ${P.accent}`, color:P.accent,
            padding:"9px 0", borderRadius:4, fontSize:12, fontWeight:600,
            fontFamily:"Inter, sans-serif", cursor:"pointer",
          }}>
            {lang==="de"?"Anmelden / Registrieren":"Sign in / Register"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

        html, body, #root {
          margin: 0; padding: 0; width: 100%; min-height: 100%;
          background: ${P.bg};
        }
        * { box-sizing: border-box; }

        .ub-shell   { min-height:100dvh; display:flex; flex-direction:column;
                      background:${P.bg}; color:${P.text};
                      font-family: Inter, system-ui, sans-serif; }
        .ub-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:100; }
        .ub-nav     { position:fixed; top:0; left:0; bottom:0; width:280px;
                      background:${P.panel}; border-right:1px solid ${P.border};
                      z-index:101; overflow-y:auto;
                      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1); }
        .ub-header  { display:flex; align-items:center; gap:14px; flex-shrink:0;
                      padding:14px 20px; border-bottom:1px solid ${P.border};
                      background:${P.bg}; }
        .ub-main    { flex:1; display:flex; align-items:center;
                      padding:32px 20px; width:100%; }
        .ub-footer  { flex-shrink:0; padding:16px 20px; border-top:1px solid ${P.border};
                      display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; }
        .ub-logo    { font-family:Oswald,sans-serif; font-weight:700; font-size:18px;
                      color:${P.text}; letter-spacing:0.05em; cursor:pointer; }

        @media (min-width: 900px) {
          .ub-header { padding: 18px 48px; }
          .ub-main   { padding: 48px; }
          .ub-footer { padding: 20px 48px; }
          .ub-logo   { font-size: 20px; }
          .ub-nav    { width: 260px; }
        }

        /* ---- Interaktion: ohne diese States fuehlt sich jede Seite tot an ---- */

        button, a, input, [role="button"] { transition: background-color .15s ease,
                                                        border-color .15s ease,
                                                        color .15s ease,
                                                        transform .08s ease,
                                                        opacity .15s ease; }

        button:not(:disabled):hover   { filter: brightness(1.12); }
        button:not(:disabled):active  { transform: translateY(1px); }
        button:disabled               { cursor: not-allowed; }

        /* Sichtbarer Tastatur-Fokus (Pflicht fuer Barrierefreiheit,
           stoert Maus-Nutzer dank :focus-visible nicht) */
        a:focus-visible,
        button:focus-visible,
        input:focus-visible,
        [tabindex]:focus-visible {
          outline: 2px solid ${P.accent};
          outline-offset: 2px;
          border-radius: 4px;
        }

        input:focus { outline: none; border-color: ${P.accent} !important; }

        /* Navigation */
        .ub-nav a:hover      { background: rgba(201,162,39,0.08); }
        .ub-logo:hover       { color: ${P.accent}; }

        /* Footer-Links */
        .ub-footer-link      { font-size: 11px; color: ${P.dim}; text-decoration: none;
                               font-family: Oswald, sans-serif; letter-spacing: 0.06em; }
        .ub-footer-link:hover{ color: ${P.accent}; }

        /* Wiederverwendbarer Primaerbutton */
        .ub-btn-primary      { background: ${P.accent}; border: none; color: #1B1E15;
                               padding: 13px 26px; border-radius: 4px; cursor: pointer;
                               font-family: Inter, sans-serif; font-size: 14px;
                               font-weight: 700; letter-spacing: 0.04em; }

        /* Respektiert System-Einstellung "weniger Bewegung" */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important;
                                   transition-duration: .01ms !important; }
        }
      `}</style>

      {introVisible && <CinematicIntro onDone={() => { setIntroVisible(false); onIntroDone(); }} />}

      <div className="ub-shell">
        {menuOpen && <div className="ub-overlay" onClick={() => setMenu(false)} />}

        <div className="ub-nav" style={{ transform: menuOpen ? "translateX(0)" : "translateX(-100%)" }}>
          <Sidebar />
        </div>

        <div className="ub-header">
          <button onClick={() => setMenu(m => !m)} style={{
            background:"transparent",
            border:`1px solid ${menuOpen ? P.accent : P.border}`,
            borderRadius:4, padding:"8px 10px", cursor:"pointer",
            display:"flex", flexDirection:"column", gap:4, flexShrink:0,
          }}>
            <div style={{ width:18, height:2, background:menuOpen?P.accent:P.text, borderRadius:1, transition:"background 0.2s" }}/>
            <div style={{ width:18, height:2, background:menuOpen?P.accent:P.text, borderRadius:1, transition:"background 0.2s" }}/>
            <div style={{ width:18, height:2, background:menuOpen?P.accent:P.text, borderRadius:1, transition:"background 0.2s" }}/>
          </button>
          <div className="ub-logo" onClick={() => navigate("/")}>UNBROKEN</div>
        </div>

        <div className="ub-main">
          <Routes>
            <Route path="/"           element={<PageStart    lang={lang} session={session} />} />
            <Route path="/konzept"    element={<PageConcept  lang={lang} />} />
            <Route path="/concept"    element={<PageConcept  lang={lang} />} />
            <Route path="/umfrage"    element={<PageSurvey   lang={lang} session={session} profile={profile} />} />
            <Route path="/survey"     element={<PageSurvey   lang={lang} session={session} profile={profile} />} />
            <Route path="/ergebnisse" element={<PageResults  lang={lang} />} />
            <Route path="/results"    element={<PageResults  lang={lang} />} />
            <Route path="/manifest"   element={<PageManifesto lang={lang} />} />
            <Route path="/manifesto"  element={<PageManifesto lang={lang} />} />
            <Route path="/preise"     element={<PagePricing  lang={lang} />} />
            <Route path="/pricing"    element={<PagePricing  lang={lang} />} />
            <Route path="/plan"       element={<PagePlan     lang={lang} session={session} profile={profile} />} />
            <Route path="/login"      element={<PageLogin    lang={lang} />} />
            <Route path="/warteliste" element={<PageWaitlist lang={lang} session={session} />} />
            <Route path="/waitlist"   element={<PageWaitlist lang={lang} session={session} />} />
            <Route path="/einstellungen" element={<PageSettings lang={lang} setLang={setLang} session={session} />} />
            <Route path="/settings"      element={<PageSettings lang={lang} setLang={setLang} session={session} />} />
            <Route path="*"              element={<PageNotFound    lang={lang} />} />
          </Routes>
        </div>

        <div className="ub-footer">
          <div style={{ fontSize:11, color:P.dim, fontFamily:"Oswald, sans-serif", letterSpacing:"0.06em" }}>
            © {new Date().getFullYear()} UNBROKEN
          </div>
          <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
            <NavLink to={lang==="de" ? "/einstellungen" : "/settings"} className="ub-footer-link">
              {lang==="de" ? "Einstellungen" : "Settings"}
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}
