import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";
import Auth from "./Auth";
import Onboarding from "./Onboarding";
import App from "./App";

function Root() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    setLoadingProfile(true);
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => { setProfile(data); setLoadingProfile(false); });
  }, [session]);

  // Loading
  if (session === undefined || loadingProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#20241C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#C9A227", fontFamily: "Oswald, sans-serif", fontSize: 20, letterSpacing: "0.1em" }}>UNBROKEN</div>
      </div>
    );
  }

  // Not logged in
  if (!session) return <Auth />;

  // Logged in but no profile yet → Onboarding
  if (!profile || !profile.training_level) {
    return <Onboarding user={session.user} onDone={() => {
      supabase.from("profiles").select("*").eq("id", session.user.id).single()
        .then(({ data }) => setProfile(data));
    }} />;
  }

  // Logged in + profile exists → Main App
  return <App session={session} profile={profile} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode><Root /></StrictMode>
);
