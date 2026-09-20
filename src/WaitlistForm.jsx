import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530", bar:"#8FA06B" };

const COUNTRIES_DE = ["Deutschland","Österreich","Schweiz","Anderes Land"];
const COUNTRIES_EN = ["Germany","Austria","Switzerland","Other country"];

export default function WaitlistForm({ lang, session, compact }) {
  const de = lang === "de";

  const [email, setEmail]       = useState("");
  const [country, setCountry]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [position, setPosition] = useState(null);
  const [total, setTotal]       = useState(null);

  // Position haengt am Konto: abgemeldet gibt es keine gespeicherte Position
  useEffect(() => {
    setPosition(null);
    const mail = session?.user?.email;
    if (mail) {
      setEmail(mail);
      loadPosition(mail);
    }
    supabase.rpc("waitlist_count").then(({ data }) => { if (typeof data === "number") setTotal(data); });
  }, [session]);

  const loadPosition = async (mail) => {
    const { data } = await supabase.rpc("waitlist_position", { p_email: mail });
    if (typeof data === "number" && data > 0) setPosition(data);
    return typeof data === "number" && data > 0 ? data : null;
  };

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true); setError(null);
    const mail = email.trim().toLowerCase();

    const { error: insErr } = await supabase
      .from("waitlist")
      .insert({ email: mail, country: country || null });

    if (insErr && insErr.code !== "23505") {   // 23505 = schon vorhanden
      setError(de ? "Da ist etwas schiefgelaufen. Versuch es gleich nochmal."
                  : "Something went wrong. Please try again in a moment.");
      setLoading(false);
      return;
    }

    const pos = await loadPosition(mail);
    const { data: cnt } = await supabase.rpc("waitlist_count");
    if (typeof cnt === "number") setTotal(cnt);
    setLoading(false);

    // Bestaetigungsmail im Hintergrund ausloesen — Fehler hier duerfen
    // den erfolgreichen Wartelisten-Eintrag nicht kaputt machen.
    if (!insErr) {
      fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail, lang, position: pos }),
      }).catch(() => {});
    }
  };

  // ── Erfolgs-Ansicht ────────────────────────────────────────────────────────
  if (position) return (
    <div style={{ maxWidth:520, width:"100%" }}>
      <div style={{ fontFamily:"Oswald,sans-serif", fontWeight:700, letterSpacing:"0.05em",
                    fontSize: compact ? "clamp(22px,4vw,30px)" : "clamp(30px,6vw,44px)",
                    color:P.text, lineHeight:1.05, marginBottom:20 }}>
        {de ? "DU BIST DRIN." : "YOU'RE IN."}
      </div>

      <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:8 }}>
        <span style={{ fontFamily:"Oswald,sans-serif", fontWeight:700,
                       fontSize:"clamp(52px,12vw,88px)", color:P.accent, lineHeight:1 }}>
          #{position}
        </span>
        {total && (
          <span style={{ fontSize:13, color:P.dim }}>
            {de ? `von ${total} auf der Liste` : `of ${total} on the list`}
          </span>
        )}
      </div>

      <div style={{ width:56, height:3, background:P.accent, margin:"20px 0 24px" }}/>

      <p style={{ fontSize:15, lineHeight:1.8, color:P.dim, margin:0 }}>
        {de
          ? "Wir melden uns, sobald es losgeht. Je früher deine Position, desto früher bekommst du Zugang."
          : "We'll reach out the moment it starts. The earlier your spot, the earlier you get access."}
      </p>
    </div>
  );

  // ── Formular ───────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth:520, width:"100%" }}>
      {!compact && (
        <div style={{ fontFamily:"Oswald,sans-serif", fontWeight:700, letterSpacing:"0.05em",
                      fontSize:"clamp(30px,6vw,44px)", color:P.text, lineHeight:1.05, marginBottom:16 }}>
          {de ? "WARTELISTE" : "WAITLIST"}
        </div>
      )}

      <p style={{ fontSize:15, lineHeight:1.8, color:P.dim, marginBottom:8 }}>
        {de
          ? "Trag dich ein und sichere dir deinen Platz. Kein Spam, keine Weitergabe – nur eine Nachricht, wenn es losgeht."
          : "Sign up and secure your spot. No spam, no sharing — just one message when it launches."}
      </p>

      {total !== null && total > 0 && (
        <p style={{ fontSize:13, color:P.accent, marginBottom:28, fontFamily:"Oswald,sans-serif", letterSpacing:"0.06em" }}>
          {de ? `${total} BEREITS DABEI` : `${total} ALREADY IN`}
        </p>
      )}

      <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:6, padding:24,
                    display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label style={{ display:"block", fontSize:12, color:P.dim, marginBottom:6 }}>
            {de ? "E-Mail" : "Email"}
          </label>
          <input
            type="email" value={email} inputMode="email" autoComplete="email"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="deine@email.com"
            style={{ width:"100%", background:"#1B1E15", border:`1px solid ${P.border}`,
                     borderRadius:4, padding:"12px 14px", color:P.text,
                     fontFamily:"Inter,sans-serif", fontSize:15 }}
          />
        </div>

        <div>
          <label style={{ display:"block", fontSize:12, color:P.dim, marginBottom:6 }}>
            {de ? "Land (optional)" : "Country (optional)"}
          </label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {(de ? COUNTRIES_DE : COUNTRIES_EN).map((c, i) => {
              const val = ["DE","AT","CH","OTHER"][i];
              const on  = country === val;
              return (
                <button key={val} onClick={() => setCountry(on ? "" : val)} style={{
                  padding:"8px 14px", borderRadius:4, cursor:"pointer",
                  border:`1px solid ${on ? P.accent : P.border}`,
                  background: on ? "rgba(201,162,39,0.14)" : "transparent",
                  color: on ? P.accent : P.dim,
                  fontFamily:"Inter,sans-serif", fontSize:13,
                }}>{c}</button>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{ fontSize:13, color:"#E05252", padding:"10px 12px",
                        background:"rgba(224,82,82,0.1)", borderRadius:4 }}>
            {error}
          </div>
        )}

        <button onClick={submit} disabled={!valid || loading} style={{
          background:P.accent, border:"none", color:"#1B1E15",
          padding:"14px 0", borderRadius:4, fontSize:14, fontWeight:700,
          fontFamily:"Inter,sans-serif", letterSpacing:"0.04em",
          cursor: valid && !loading ? "pointer" : "default",
          opacity: valid && !loading ? 1 : 0.4,
        }}>
          {loading ? "…" : (de ? "PLATZ SICHERN" : "SECURE MY SPOT")}
        </button>

        <p style={{ fontSize:11, color:P.dim, lineHeight:1.6, margin:0 }}>
          {de
            ? "Deine Adresse wird ausschließlich für die Benachrichtigung zum Start verwendet."
            : "Your address is used solely to notify you at launch."}
        </p>
      </div>
    </div>
  );
}
