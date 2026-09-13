import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };
const inputStyle = { width:"100%", background:"#1B1E15", border:`1px solid ${P.border}`, borderRadius:4, padding:"10px 12px", color:P.text, fontFamily:"Inter, sans-serif", fontSize:14, boxSizing:"border-box" };

export default function PageLogin({ lang }) {
  const [mode, setMode]       = useState("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError]     = useState(null);
  const navigate              = useNavigate();
  const de = lang === "de";

  const handle = async () => {
    setLoading(true); setError(null); setMessage(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate("/plan");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage(de?"Bestätigungs-E-Mail gesendet. Schau auch im Spam-Ordner nach (von noreply@mail.app.supabase.io).":"Confirmation email sent. Check your spam folder too (from noreply@mail.app.supabase.io).");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:400 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:28, color:P.text, marginBottom:4 }}>
        {mode==="login"?(de?"Einloggen":"Log in"):(de?"Konto erstellen":"Create account")}
      </div>
      <div style={{ fontSize:13, color:P.dim, marginBottom:24 }}>
        {mode==="login"?(de?"Willkommen zurück.":"Welcome back."):(de?"Werde Teil von Unbroken.":"Become part of Unbroken.")}
      </div>
      <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:24, display:"flex", flexDirection:"column", gap:12 }}>
        <div>
          <div style={{ fontSize:12, color:P.dim, marginBottom:4 }}>Email</div>
          <input style={inputStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/>
        </div>
        <div>
          <div style={{ fontSize:12, color:P.dim, marginBottom:4 }}>Password</div>
          <input style={inputStyle} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
        </div>
        {error && <div style={{ fontSize:13, color:"#E05252", padding:"8px 10px", background:"rgba(224,82,82,0.1)", borderRadius:4 }}>{error}</div>}
        {message && <div style={{ fontSize:13, color:P.accent, padding:"10px 12px", background:"rgba(201,162,39,0.1)", borderRadius:4, lineHeight:1.5 }}>{message}</div>}
        <button onClick={handle} disabled={loading} style={{ background:P.accent, border:"none", color:"#1B1E15", padding:"12px 0", borderRadius:4, fontSize:14, fontWeight:700, fontFamily:"Inter, sans-serif", cursor:"pointer", opacity:loading?0.6:1 }}>
          {loading?"...":(mode==="login"?(de?"Einloggen":"Log in"):(de?"Konto erstellen":"Create account"))}
        </button>
        <button onClick={() => setMode(mode==="login"?"register":"login")} style={{ background:"transparent", border:`1px solid ${P.border}`, color:P.dim, padding:"10px 0", borderRadius:4, fontSize:13, fontFamily:"Inter, sans-serif", cursor:"pointer" }}>
          {mode==="login"?(de?"Noch kein Konto? Registrieren":"No account? Register"):(de?"Bereits ein Konto? Einloggen":"Already have an account? Log in")}
        </button>
      </div>
    </div>
  );
}

