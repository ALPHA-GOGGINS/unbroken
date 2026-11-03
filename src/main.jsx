import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "./supabase";
import AppRouter from "./AppRouter";
import Onboarding from "./Onboarding";

const SHOW_INTRO = !sessionStorage.getItem("introSeen");

function Root() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [introGone, setIntroGone] = useState(!SHOW_INTRO);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null) { setProfile(null); return; }
    if (!session) return;

    // Wichtig: erst auf "unbekannt" zuruecksetzen. Sonst steht hier beim
    // Login noch das alte null aus dem abgemeldeten Zustand, und die
    // Bedingung weiter unten zeigt bestehenden Nutzern kurz das
    // Onboarding – wer schnell klickt, ueberschreibt sein eigenes Profil.
    setProfile(undefined);

    let abgebrochen = false;
    supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle()
      .then(({ data, error }) => {
        if (abgebrochen) return;
        // Netzfehler darf NICHT als "kein Profil" gelten – sonst landet
        // ein bestehender Nutzer im Onboarding. Dann lieber Fehlerzustand.
        if (error) { setProfile({ __error: true }); return; }
        setProfile(data ?? null);
      })
      .catch(() => { if (!abgebrochen) setProfile({ __error: true }); });
    return () => { abgebrochen = true; };
  }, [session]);

  if (session === undefined || (session && profile === undefined)) {
    return (
      <div style={{ minHeight:"100vh", background:"#20241C", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#C9A227", fontFamily:"Oswald, sans-serif", fontSize:24, letterSpacing:"0.1em" }}>UNBROKEN</div>
      </div>
    );
  }

  if (session && profile?.__error) {
    return (
      <div style={{ minHeight:"100vh", background:"#20241C", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ maxWidth:420, textAlign:"center", color:"#EEEAE0", fontFamily:"Inter, sans-serif" }}>
          <div style={{ fontFamily:"Oswald, sans-serif", fontSize:22, letterSpacing:"0.06em", color:"#C9A227", marginBottom:12 }}>
            VERBINDUNG FEHLGESCHLAGEN
          </div>
          <p style={{ fontSize:14, lineHeight:1.7, color:"#A9AD9C", marginBottom:24 }}>
            Dein Profil konnte gerade nicht geladen werden. Bitte lade die Seite neu.
          </p>
          <button onClick={() => window.location.reload()} style={{ background:"#C9A227", border:"none", color:"#1B1E15", padding:"13px 26px", borderRadius:4, fontWeight:700, cursor:"pointer" }}>
            NEU LADEN
          </button>
        </div>
      </div>
    );
  }

  if (session && (!profile || !profile.training_level)) {
    return (
      <Onboarding
        user={session.user}
        onDone={() => supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => setProfile(data))}
      />
    );
  }

  return (
    <BrowserRouter>
      <AppRouter
        session={session}
        profile={profile}
        showIntro={SHOW_INTRO && !introGone}
        onIntroDone={() => { sessionStorage.setItem("introSeen","1"); setIntroGone(true); }}
      />
    </BrowserRouter>
  );
}

// Service Worker registrieren (nur in Produktion sinnvoll)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(<StrictMode><Root /></StrictMode>);
