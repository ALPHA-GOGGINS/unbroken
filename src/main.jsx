import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";
import App from "./App";

function Root() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Kurzes Laden bis Auth-Status bekannt
  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "#20241C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#C9A227", fontFamily: "Oswald, sans-serif", fontSize: 20, letterSpacing: "0.1em" }}>UNBROKEN</div>
      </div>
    );
  }

  // Immer App rendern, session wird durchgegeben
  return <App session={session} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode><Root /></StrictMode>
);
