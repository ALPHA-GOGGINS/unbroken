import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { supabase } from "./supabase";
import UnbrokenApp from "./App";
import Onboarding from "./Onboarding";

function Root() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [authEvent, setAuthEvent] = useState(null);

  useEffect(() => {
    // Prüfe ob URL einen Auth-Token enthält (nach Email-Bestätigung)
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

  // Laden
  if (session === undefined || (session && profile === undefined)) {
    return (
      <div style={{ minHeight: "100vh", background: "#20241C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#C9A227", fontFamily: "Oswald, sans-serif", fontSize: 20, letterSpacing: "0.1em" }}>UNBROKEN</div>
      </div>
    );
  }

  // Eingeloggt aber kein Profil → Onboarding
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

  // Alles okay → App, mit Flag ob gerade von Email-Bestätigung kommend
  return <UnbrokenApp session={session} profile={profile} justConfirmed={authEvent === "SIGNED_IN"} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
    <Analytics />
  </StrictMode>
);
