import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";
import UnbrokenApp from "./App";
import Onboarding from "./Onboarding";

// Intro sofort beim ersten JS-Load prüfen - kein State, kein Re-render
const SHOW_INTRO = !sessionStorage.getItem("introSeen");

function Root() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [authEvent, setAuthEvent] = useState(null);
  const [introGone, setIntroGone] = useState(!SHOW_INTRO);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setAuthEvent(event);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const handleIntroDone = () => {
    sessionStorage.setItem("introSeen", "1");
    setIntroGone(true);
  };

  // Loading screen
  if (session === undefined || (session && profile === undefined)) {
    return (
      <div style={{ minHeight:"100vh", background:"#20241C", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#C9A227", fontFamily:"Oswald, sans-serif", fontSize:20, letterSpacing:"0.1em" }}>UNBROKEN</div>
      </div>
    );
  }

  // Onboarding
  if (session && (!profile || !profile.training_level)) {
    return (
      <Onboarding
        user={session.user}
        onDone={() => {
          supabase.from("profiles").select("*").eq("id", session.user.id).single()
            .then(({ data }) => setProfile(data));
        }}
      />
    );
  }

  return (
    <UnbrokenApp
      session={session}
      profile={profile}
      justConfirmed={authEvent === "SIGNED_IN"}
      showIntro={SHOW_INTRO && !introGone}
      onIntroDone={handleIntroDone}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode><Root /></StrictMode>
);
