import { useState, useEffect } from "react";

const P = { bg:"#20241C", panel:"#2A2F22", border:"#3D4530",
            text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227" };

const SEEN_KEY = "ub_install_seen";

// ── Geräteerkennung ──────────────────────────────────────────────────────────
function detect() {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
              (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  // Auf iOS ist jeder Browser intern Safari – nur Safari selbst kann installieren
  const iOSChrome = iOS && /CriOS|FxiOS|EdgiOS/.test(ua);
  return { iOS, android, iOSChrome };
}

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.navigator.standalone === true;
}

// ── Mockup: iPhone mit Teilen-Leiste ─────────────────────────────────────────
function PhoneShare() {
  return (
    <svg viewBox="0 0 150 250" style={{ width:"100%", maxWidth:130, display:"block" }}>
      <rect x="6" y="4" width="138" height="242" rx="20" fill="#14160F" stroke={P.border} strokeWidth="2"/>
      <rect x="12" y="10" width="126" height="230" rx="16" fill={P.bg}/>
      <rect x="58" y="14" width="34" height="6" rx="3" fill="#14160F"/>
      {/* Inhalt angedeutet */}
      <rect x="26" y="40" width="60" height="7" rx="3" fill={P.dim} opacity="0.35"/>
      <rect x="26" y="54" width="90" height="5" rx="2" fill={P.dim} opacity="0.2"/>
      <rect x="26" y="66" width="76" height="5" rx="2" fill={P.dim} opacity="0.2"/>
      {/* Browser-Leiste unten */}
      <rect x="12" y="196" width="126" height="44" rx="0" fill="#2A2D24"/>
      <rect x="24" y="210" width="40" height="8" rx="4" fill={P.dim} opacity="0.3"/>
      {/* Teilen-Symbol hervorgehoben */}
      <circle cx="104" cy="216" r="15" fill="rgba(201,162,39,0.18)" stroke={P.accent} strokeWidth="2"/>
      <path d="M104 209 L104 221 M100 212 L104 208 L108 212" stroke={P.accent} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect x="99" y="219" width="10" height="7" rx="1.5" stroke={P.accent} strokeWidth="1.6" fill="none"/>
    </svg>
  );
}

// ── Mockup: Menü mit "Zum Home-Bildschirm" ───────────────────────────────────
function PhoneAdd() {
  return (
    <svg viewBox="0 0 150 250" style={{ width:"100%", maxWidth:130, display:"block" }}>
      <rect x="6" y="4" width="138" height="242" rx="20" fill="#14160F" stroke={P.border} strokeWidth="2"/>
      <rect x="12" y="10" width="126" height="230" rx="16" fill={P.bg}/>
      <rect x="58" y="14" width="34" height="6" rx="3" fill="#14160F"/>
      {/* Aufgeklapptes Menü */}
      <rect x="20" y="96" width="110" height="140" rx="12" fill="#2A2D24"/>
      <rect x="32" y="110" width="56" height="6" rx="3" fill={P.dim} opacity="0.3"/>
      <rect x="32" y="130" width="70" height="6" rx="3" fill={P.dim} opacity="0.25"/>
      {/* Hervorgehobene Zeile */}
      <rect x="26" y="148" width="98" height="30" rx="7"
            fill="rgba(201,162,39,0.15)" stroke={P.accent} strokeWidth="1.6"/>
      <rect x="34" y="158" width="52" height="6" rx="3" fill={P.accent}/>
      <rect x="34" y="168" width="34" height="4" rx="2" fill={P.accent} opacity="0.5"/>
      <rect x="100" y="156" width="14" height="14" rx="3" stroke={P.accent} strokeWidth="1.6" fill="none"/>
      <path d="M107 159.5 L107 166.5 M103.5 163 L110.5 163" stroke={P.accent} strokeWidth="1.6" strokeLinecap="round"/>
      <rect x="32" y="192" width="62" height="6" rx="3" fill={P.dim} opacity="0.25"/>
      <rect x="32" y="210" width="48" height="6" rx="3" fill={P.dim} opacity="0.25"/>
    </svg>
  );
}

// ── Hauptkomponente ──────────────────────────────────────────────────────────
export default function InstallPrompt({ lang, onClose }) {
  const de = lang === "de";
  const { iOS, android, iOSChrome } = detect();
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const close = () => {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
    onClose();
  };

  const installNative = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    close();
  };

  const Step = ({ n, children }) => (
    <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
      <span style={{ fontFamily:"Oswald,sans-serif", fontSize:12, color:P.accent,
                     border:`1px solid ${P.accent}`, borderRadius:"50%",
                     width:22, height:22, display:"flex", alignItems:"center",
                     justifyContent:"center", flexShrink:0 }}>{n}</span>
      <span style={{ fontSize:14, color:P.text, lineHeight:1.55 }}>{children}</span>
    </div>
  );

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:900, background:P.bg,
      overflowY:"auto", padding:"32px 20px",
      display:"flex", flexDirection:"column", alignItems:"center",
    }}>
      <div style={{ width:"100%", maxWidth:420 }}>

        <div style={{ fontFamily:"Oswald,sans-serif", fontWeight:700, letterSpacing:"0.04em",
                      fontSize:"clamp(26px,6vw,36px)", color:P.text, lineHeight:1.15, marginBottom:12 }}>
          {de ? "HOL DIR UNBROKEN AUF DEN STARTBILDSCHIRM" : "PUT UNBROKEN ON YOUR HOME SCREEN"}
        </div>

        <div style={{ width:48, height:3, background:P.accent, marginBottom:20 }}/>

        <p style={{ fontSize:15, color:P.dim, lineHeight:1.7, marginBottom:32 }}>
          {de
            ? "Ein Tap statt Browser öffnen und Adresse eintippen. Genau die Hürde, an der Disziplin sonst scheitert."
            : "One tap instead of opening a browser and typing an address. Exactly the friction that breaks routines."}
        </p>

        {/* Android / Desktop mit nativem Prompt */}
        {deferred && (
          <button onClick={installNative} style={{
            width:"100%", background:P.accent, border:"none", color:"#1B1E15",
            padding:"15px 0", borderRadius:4, fontSize:15, fontWeight:700,
            fontFamily:"Inter,sans-serif", letterSpacing:"0.04em",
            cursor:"pointer", marginBottom:16,
          }}>
            {de ? "JETZT INSTALLIEREN" : "INSTALL NOW"}
          </button>
        )}

        {/* iOS in fremdem Browser */}
        {iOSChrome && (
          <div style={{ background:"rgba(201,162,39,0.08)", border:`1px solid ${P.accent}`,
                        borderRadius:6, padding:"14px 16px", marginBottom:24 }}>
            <div style={{ fontSize:14, color:P.text, lineHeight:1.6 }}>
              {de
                ? "Öffne diese Seite in Safari – nur dort lässt sie sich auf dem iPhone installieren."
                : "Open this page in Safari — installing on iPhone only works there."}
            </div>
          </div>
        )}

        {/* iOS-Anleitung */}
        {iOS && !iOSChrome && (
          <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20, marginBottom:20 }}>
            <div style={{ display:"flex", gap:16, marginBottom:20 }}>
              <PhoneShare /><PhoneAdd />
            </div>
            <Step n="1">{de ? "Unten auf das Teilen-Symbol tippen" : "Tap the share icon at the bottom"}</Step>
            <Step n="2">{de ? "Nach unten scrollen zu „Zum Home-Bildschirm“" : 'Scroll down to "Add to Home Screen"'}</Step>
            <Step n="3">{de ? "Oben rechts auf „Hinzufügen“ tippen" : 'Tap "Add" in the top right'}</Step>
          </div>
        )}

        {/* Android ohne nativen Prompt */}
        {android && !deferred && (
          <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20, marginBottom:20 }}>
            <Step n="1">{de ? "Oben rechts auf die drei Punkte tippen" : "Tap the three dots in the top right"}</Step>
            <Step n="2">{de ? "„App installieren“ oder „Zum Startbildschirm zufügen“ wählen" : 'Choose "Install app" or "Add to Home screen"'}</Step>
            <Step n="3">{de ? "Bestätigen" : "Confirm"}</Step>
          </div>
        )}

        {/* Desktop-Fallback */}
        {!iOS && !android && !deferred && (
          <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20, marginBottom:20 }}>
            <div style={{ fontSize:14, color:P.dim, lineHeight:1.7 }}>
              {de
                ? "Auf dem Handy kannst du Unbroken wie eine App auf den Startbildschirm legen. Öffne dazu unbroken40.com auf deinem Smartphone."
                : "On your phone you can add Unbroken to your home screen like an app. Open unbroken40.com on your smartphone."}
            </div>
          </div>
        )}

        <button onClick={close} style={{
          width:"100%", background:"transparent", border:`1px solid ${P.border}`,
          color:P.dim, padding:"13px 0", borderRadius:4, fontSize:14,
          fontFamily:"Inter,sans-serif", cursor:"pointer",
        }}>
          {de ? "Später" : "Later"}
        </button>
      </div>
    </div>
  );
}

// Hilfsfunktionen für den Trigger
export function shouldShowInstall() {
  if (isInstalled()) return false;
  try { if (localStorage.getItem(SEEN_KEY) === "1") return false; } catch (e) {}
  return true;
}
