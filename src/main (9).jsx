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
      .then(({ data }) => { if (!abgebrochen) setProfile(data ?? null); })
      .catch(() => { if (!abgebrochen) setProfile(null); });
    return () => { abgebrochen = true; };
  }, [session]);

  if (session === undefined || (session && profile === undefined)) {
    return (
      <div style={{ minHeight:"100vh", background:"#20241C", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#C9A227", fontFamily:"Oswald, sans-serif", fontSize:24, letterSpacing:"0.1em" }}>UNBROKEN</div>
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
