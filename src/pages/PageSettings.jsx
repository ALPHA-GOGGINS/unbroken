import { supabase } from "../supabase";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

export default function PageSettings({ lang, setLang, session }) {
  const de = lang === "de";

  const choose = async (l) => {
    setLang(l);
    if (session) {
      await supabase.from("profiles").update({ language: l }).eq("id", session.user.id);
    }
  };

  return (
    <div style={{ maxWidth:480, width:"100%" }}>
      <div style={{
        fontFamily:"Oswald, sans-serif", fontWeight:700, letterSpacing:"0.05em",
        fontSize:"clamp(28px,5vw,40px)", color:P.text, marginBottom:24,
      }}>
        {de ? "EINSTELLUNGEN" : "SETTINGS"}
      </div>

      <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:20 }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:11, color:P.accent, letterSpacing:"0.12em", marginBottom:4 }}>
          {de ? "SPRACHE" : "LANGUAGE"}
        </div>
        <div style={{ fontSize:12, color:P.dim, lineHeight:1.6, marginBottom:16 }}>
          {session
            ? (de
                ? "Wird für deinen Account gespeichert und beim nächsten Login automatisch geladen."
                : "Saved to your account and loaded automatically the next time you log in.")
            : (de
                ? "Gilt nur für diese Sitzung. Melde dich an, damit deine Sprache dauerhaft gespeichert wird."
                : "Applies to this session only. Sign in to save your language permanently.")}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["de", "en"].map((l) => (
            <button key={l} onClick={() => choose(l)} style={{
              flex:1, padding:"12px 0", borderRadius:4, fontSize:14, fontWeight:600,
              fontFamily:"Inter, sans-serif", cursor:"pointer",
              background: lang === l ? P.accent : "transparent",
              color: lang === l ? "#1B1E15" : P.dim,
              border: `1px solid ${lang === l ? P.accent : P.border}`,
            }}>
              {l === "de" ? "Deutsch" : "English"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
