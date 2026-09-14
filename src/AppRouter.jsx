import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase";

// Pages
import PageStart      from "./pages/PageStart";
import PageConcept    from "./pages/PageConcept";
import PageSurvey     from "./pages/PageSurvey";
import PageResults    from "./pages/PageResults";
import PageManifesto  from "./pages/PageManifesto";
import PagePlan       from "./pages/PagePlan";
import PageLogin      from "./pages/PageLogin";
import CinematicIntro from "./CinematicIntro";

const P = {
  bg:"#20241C", panel:"#2A2F22", border:"#3D4530",
  text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227",
};

const NAV_ITEMS_DE = [
  { path:"/",          label:"Start" },
  { path:"/konzept",   label:"Konzept" },
  { path:"/umfrage",   label:"Umfrage" },
  { path:"/ergebnisse",label:"Ergebnisse" },
  { path:"/manifest",  label:"Manifest" },
  { path:"/plan",      label:"Mein Plan", highlight:true },
];
const NAV_ITEMS_EN = [
  { path:"/",          label:"Start" },
  { path:"/concept",   label:"Concept" },
  { path:"/survey",    label:"Survey" },
  { path:"/results",   label:"Results" },
  { path:"/manifesto", label:"Manifesto" },
  { path:"/plan",      label:"My Plan", highlight:true },
];

export default function AppRouter({ session, profile, showIntro, onIntroDone }) {
  const [lang, setLang]       = useState("de");
  const [menuOpen, setMenu]   = useState(false);
  const [introVisible, setIntroVisible] = useState(showIntro);
  const navigate              = useNavigate();
  const location              = useLocation();
  const isDesktop             = typeof window !== "undefined" && window.innerWidth >= 900;
  const [desktop, setDesktop] = useState(window.innerWidth >= 900);

  useEffect(() => {
    const handler = () => setDesktop(window.innerWidth >= 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenu(false); }, [location.pathname]);

  const navItems = lang === "de" ? NAV_ITEMS_DE : NAV_ITEMS_EN;

  const handleIntroDone = () => { setIntroVisible(false); onIntroDone(); };

  const NavContent = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"32px 24px" }}>
      {/* Logo */}
      <div
        onClick={() => { navigate("/"); setMenu(false); }}
        style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, fontSize:26, color:P.text, letterSpacing:"0.05em", cursor:"pointer", marginBottom:8 }}
      >
        UNBROKEN
      </div>
      <div style={{ fontSize:12, color:P.dim, marginBottom:40 }}>Early Alpha · {lang==="de"?"Disziplin. Kein Puder.":"Discipline. No Sugarcoat."}</div>

      {/* Nav links */}
      <nav style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              display:"block", padding:"10px 14px", borderRadius:4,
              fontFamily:"Oswald, sans-serif", fontSize:15, letterSpacing:"0.04em",
              textDecoration:"none",
              background: isActive ? "rgba(201,162,39,0.15)" : "transparent",
              color: item.highlight ? P.accent : isActive ? P.accent : P.dim,
              border: item.highlight ? `1px solid ${P.accent}` : "1px solid transparent",
              fontWeight: item.highlight ? 700 : 400,
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Lang + Sign out */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {/* Lang switch */}
        <div style={{ display:"flex", gap:6 }}>
          {["de","en"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              flex:1, padding:"8px 0", borderRadius:4, fontSize:12, fontWeight:600,
              fontFamily:"Inter, sans-serif", cursor:"pointer",
              background: lang===l ? P.accent : "transparent",
              color: lang===l ? "#1B1E15" : P.dim,
              border: `1px solid ${lang===l ? P.accent : P.border}`,
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
        {session && (
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ width:"100%", background:"transparent", border:`1px solid ${P.border}`, color:P.dim, padding:"8px 0", borderRadius:4, fontSize:12, fontFamily:"Inter, sans-serif", cursor:"pointer" }}
          >
            {lang==="de"?"Abmelden":"Sign out"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {introVisible && <CinematicIntro onDone={handleIntroDone} />}

      <div style={{ display:"flex", minHeight:"100vh", background:P.bg, color:P.text, fontFamily:"Inter, system-ui, sans-serif" }}>

        {/* Overlay für alle Bildschirmgrößen */}
        {menuOpen && (
          <>
            <div
              onClick={() => setMenu(false)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, cursor:"pointer" }}
            />
            <div style={{
              position:"fixed", top:0, left:0, bottom:0, width: desktop ? 280 : 280,
              background:P.panel, borderRight:`1px solid ${P.border}`,
              zIndex:101, overflowY:"auto",
              animation:"slideIn 0.28s cubic-bezier(0.4,0,0.2,1) both",
            }}>
              <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}} @keyframes arrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}`}</style>
              <NavContent />
            </div>
          </>
        )}

        {/* Main content – volle Breite immer */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
          {/* Header mit Hamburger – immer sichtbar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: desktop ? "20px 48px" : "16px 20px", borderBottom:`1px solid ${P.border}`, position:"sticky", top:0, background:P.bg, zIndex:50 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <button
                onClick={() => setMenu(m => !m)}
                style={{ background:"transparent", border:`1px solid ${menuOpen?P.accent:P.border}`, borderRadius:4, padding:"8px 10px", cursor:"pointer", display:"flex", flexDirection:"column", gap:4 }}
              >
                <div style={{ width:18, height:2, background:menuOpen?P.accent:P.text, borderRadius:1, transition:"all 0.2s" }}/>
                <div style={{ width:18, height:2, background:menuOpen?P.accent:P.text, borderRadius:1, transition:"all 0.2s" }}/>
                <div style={{ width:18, height:2, background:menuOpen?P.accent:P.text, borderRadius:1, transition:"all 0.2s" }}/>
              </button>
              <div
                onClick={() => { navigate("/"); setMenu(false); }}
                style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, fontSize: desktop ? 22 : 18, color:P.text, letterSpacing:"0.05em", cursor:"pointer" }}
              >
                UNBROKEN
              </div>
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex:1, padding: desktop ? "48px 48px" : "24px 20px", maxWidth: desktop ? 960 : "100%", width:"100%", boxSizing:"border-box" }}>
            <Routes>
              <Route path="/"           element={<PageStart    lang={lang} session={session} />} />
              <Route path="/konzept"    element={<PageConcept  lang={lang} />} />
              <Route path="/concept"    element={<PageConcept  lang={lang} />} />
              <Route path="/umfrage"    element={<PageSurvey   lang={lang} session={session} />} />
              <Route path="/survey"     element={<PageSurvey   lang={lang} session={session} />} />
              <Route path="/ergebnisse" element={<PageResults  lang={lang} />} />
              <Route path="/results"    element={<PageResults  lang={lang} />} />
              <Route path="/manifest"   element={<PageManifesto lang={lang} />} />
              <Route path="/manifesto"  element={<PageManifesto lang={lang} />} />
              <Route path="/plan"       element={<PagePlan     lang={lang} session={session} profile={profile} />} />
              <Route path="/login"      element={<PageLogin    lang={lang} />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}
