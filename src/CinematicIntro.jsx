import { useState, useEffect } from "react";

export default function CinematicIntro({ onDone }) {
  const [phase,   setPhase]   = useState(0);
  const [ready,   setReady]   = useState(false);
  const [leaving, setLeaving] = useState(false);
  const lines = ["NO EXCUSES.", "NO SHORTCUTS.", "UNBROKEN."];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setReady(true), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleClick = () => { setLeaving(true); setTimeout(onDone, 600); };

  return (
    <div style={{
      position:"fixed", inset:0, background:"#0D0F0A", zIndex:999,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:16,
      transform: leaving ? "translateY(-100vh)" : "translateY(0)",
      transition: leaving ? "transform 0.6s cubic-bezier(0.7,0,0.3,1)" : "none",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"rgba(201,162,39,0.25)", animation:"scanline 1.5s linear infinite", pointerEvents:"none" }}/>
      <style>{`@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}} @keyframes arrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}`}</style>
      {lines.map((line, i) => (
        <div key={i} style={{
          fontFamily:"Oswald, sans-serif", fontSize:i===2?42:22, fontWeight:700, letterSpacing:"0.12em",
          color: i===2 ? "#C9A227" : "#EEEAE0",
          opacity: phase>i ? 1 : 0,
          transform: phase>i ? "translateY(0)" : "translateY(12px)",
          transition:"opacity 0.5s ease, transform 0.5s ease",
        }}>{line}</div>
      ))}
      <button onClick={handleClick} style={{
        marginTop:32, background:"transparent", border:"1px solid #C9A227",
        borderRadius:"50%", width:48, height:48,
        display:"flex", alignItems:"center", justifyContent:"center",
        cursor: ready ? "pointer" : "default",
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(10px)",
        transition:"opacity 0.5s ease, transform 0.5s ease",
        animation: ready ? "arrowBounce 1s ease-in-out infinite" : "none",
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3 L10 17 M4 11 L10 17 L16 11" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

