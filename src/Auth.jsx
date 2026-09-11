import { useState } from "react";
import { supabase } from "./supabase";

const P = {
  bg: "#20241C", panel: "#2A2F22", border: "#3D4530",
  text: "#EEEAE0", dim: "#A9AD9C", accent: "#C9A227",
};

const inputStyle = {
  width: "100%", background: "#1B1E15", border: `1px solid ${P.border}`,
  borderRadius: 4, padding: "10px 12px", color: P.text,
  fontFamily: "Inter, sans-serif", fontSize: 14, boxSizing: "border-box",
};

const btnPrimary = {
  width: "100%", background: P.accent, border: "none", color: "#1B1E15",
  padding: "12px 0", borderRadius: 4, fontSize: 15, fontWeight: 700,
  fontFamily: "Inter, sans-serif", cursor: "pointer", marginTop: 8,
};

const btnSecondary = {
  width: "100%", background: "transparent", border: `1px solid ${P.border}`,
  color: P.dim, padding: "10px 0", borderRadius: 4, fontSize: 14,
  fontFamily: "Inter, sans-serif", cursor: "pointer", marginTop: 8,
};

export default function Auth() {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage("Password reset email sent.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 28, color: P.text, letterSpacing: "0.04em", marginBottom: 4 }}>
          UNBROKEN
        </div>
        <div style={{ color: P.dim, fontSize: 13, marginBottom: 28 }}>
          {mode === "login" ? "Welcome back." : mode === "register" ? "Create your account." : "Reset your password."}
        </div>

        <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: P.dim, marginBottom: 4 }}>Email</div>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>

          {mode !== "forgot" && (
            <div>
              <div style={{ fontSize: 12, color: P.dim, marginBottom: 4 }}>Password</div>
              <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          )}

          {error && <div style={{ fontSize: 13, color: "#E05252", padding: "8px 10px", background: "rgba(224,82,82,0.1)", borderRadius: 4 }}>{error}</div>}
          {message && <div style={{ fontSize: 13, color: P.accent, padding: "8px 10px", background: "rgba(201,162,39,0.1)", borderRadius: 4 }}>{message}</div>}

          <button onClick={handle} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
            {loading ? "..." : mode === "login" ? "Log in" : mode === "register" ? "Create account" : "Send reset email"}
          </button>

          {mode === "login" && (
            <>
              <button onClick={() => setMode("register")} style={btnSecondary}>No account yet? Register</button>
              <button onClick={() => setMode("forgot")} style={{ ...btnSecondary, marginTop: 0, border: "none", fontSize: 12 }}>Forgot password?</button>
            </>
          )}
          {mode === "register" && (
            <button onClick={() => setMode("login")} style={btnSecondary}>Already have an account? Log in</button>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} style={btnSecondary}>Back to login</button>
          )}
        </div>
      </div>
    </div>
  );
}
