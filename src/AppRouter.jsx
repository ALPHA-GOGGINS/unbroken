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

const P = {
  bg:"#20241C", panel:"#2A2F22", border:"#3D4530",
  text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227",
};

export default function AppRouter({ session, profile, showIntro, onIntroDone }) {
  const [lang, setLang]         = useState("de");
  const [menuOpen, setMenu]     = useState(false);
  const [introVisible, setIntroVisible] = useState(showIntro);
  const [desktop, setDesktop]   = useState(window.innerWidth >= 900);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const fn = () => setDesktop(window.innerWidth >= 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => { setMenu(false); }, [location.pathname]);

  const navItems = lang === "de"
    ? [
        { path:"/",           label:"Start",       exact:true },
        { path:"/konzept",    label:"Konzept" },
        { path:"/umfrage",    label:"Umfrage" },
        { path:"/ergebnisse", label:"Ergebnisse" },
        { path:"/manifest",   label:"Manifest" },
        { path:"/plan",       label:"Mein Plan",   highlight:true },
      ]
    : [
        { path:"/",           label:"Start",       exact:true },
        { path:"/concept",    label:"Concept" },
        { path:"/survey",     label:"Survey" },
        { path:"/results",    label:"Results" },
        { path:"/manifesto",  label:"Manifesto" },
        { path:"/plan",       label:"My Plan",     highlight:true },
      ];

  const Sidebar = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"32px 24px" }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, fontSize:22, color:P.text, letterSpacing:"0.05em", marginBottom:4, cursor:"pointer" }} onClick={() => { navigate("/"); setMenu(false); }}>
        UNBROKEN
      </div>
      <div style={{ fontSize:11, color:P.dim, marginBottom:40, letterSpacing:"0.04em" }}>
        {lang==="de"?"Early Alpha · Disziplin. Kein Puder.":"Early Alpha · Discipline. No Sugarcoat."}
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
      </nav>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
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
          <button onClick={() => supabase.auth.signOut()} style={{
            background:"transparent", border:`1px solid ${P.border}`, color:P.dim,
            padding:"9px 0", borderRadius:4, fontSize:12,
            fontFamily:"Inter, sans-serif", cursor:"pointer",
          }}>
            {lang==="de"?"Abmelden":"Sign out"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {introVisible && <CinematicIntro onDone={() => { setIntroVisible(false); onIntroDone(); }} />}

      <div style={{ minHeight:"100vh", background:P.bg, color:P.text, fontFamily:"Inter, system-ui, sans-serif" }}>

        {/* Overlay */}
        {menuOpen && (
          <div onClick={() => setMenu(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:100 }} />
        )}

        {/* Slide-in Nav */}
        <div style={{
          position:"fixed", top:0, left:0, bottom:0,
          width: desktop ? 260 : 280,
          background:P.panel, borderRight:`1px solid ${P.border}`,
          zIndex:101, overflowY:"auto",
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <Sidebar />
        </div>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", gap:14,
          padding: desktop ? "18px 48px" : "14px 20px",
          borderBottom:`1px solid ${P.border}`,
          position:"sticky", top:0, background:P.bg, zIndex:50,
        }}>
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
          <div onClick={() => navigate("/")} style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, fontSize: desktop?20:18, color:P.text, letterSpacing:"0.05em", cursor:"pointer" }}>
            UNBROKEN
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: desktop ? "48px 48px" : "24px 20px", maxWidth:960, boxSizing:"border-box" }}>
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

        {/* Footer */}
        <div style={{ padding: desktop?"20px 48px":"16px 20px", borderTop:`1px solid ${P.border}`, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div style={{ fontSize:11, color:P.dim, fontFamily:"Oswald, sans-serif", letterSpacing:"0.06em" }}>
            © {new Date().getFullYear()} UNBROKEN · EARLY ALPHA
          </div>
          <div style={{ fontSize:11, color:P.dim }}>
            {lang==="de"?"Alle Rechte vorbehalten.":"All rights reserved."}
          </div>
        </div>
      </div>
    </>
  );
}
