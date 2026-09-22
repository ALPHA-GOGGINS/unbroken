import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227" };

export default function PageAdmin({ session, profile, lang }) {
  const navigate = useNavigate();
  const de = lang === "de";

  useEffect(() => {
    if (!session || !profile?.is_admin) {
      navigate("/");
      return;
    }
    // Admin wird automatisch zu /plan redirectet, wo das Admin-Panel oben ist
    navigate("/plan");
  }, [session, profile, navigate]);

  return (
    <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
      <div style={{
        fontFamily: "Oswald, sans-serif", fontSize: 18, color: P.text, marginBottom: 12,
      }}>
        {de ? "Weiterleiten…" : "Redirecting…"}
      </div>
      <div style={{ fontSize: 14, color: P.dim }}>
        {de ? "Du wirst zu ‹Mein Bereich› weitergeleitet, wo das Admin-Panel oben verfügbar ist." : "Redirecting you to 'My Area' where the admin panel is available at the top."}
      </div>
    </div>
  );
}
