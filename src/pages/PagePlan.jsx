import { useState } from "react";
import { supabase } from "../supabase";
import { TIERS } from "../tiers";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

// Admin-Panel oben
function AdminToggle({ profile, viewTier, setViewTier, lang }) {
  const de = lang === "de";
  if (!profile?.is_admin) return null;

  const isPreview = viewTier !== (profile.tier || 0);

  return (
    <div style={{
      background: isPreview ? "rgba(201,162,39,0.12)" : "transparent",
      border: `1px solid ${isPreview ? P.accent : P.border}`,
      borderRadius: 6, padding: 16, marginBottom: 24,
    }}>
      <div style={{
        fontFamily: "Oswald, sans-serif", fontSize: 11, letterSpacing: "0.12em",
        color: isPreview ? P.accent : P.dim, marginBottom: 12,
      }}>
        {de ? "ADMIN-MODUS" : "ADMIN MODE"}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setViewTier(profile.tier || 0)} style={{
          padding: "8px 14px", borderRadius: 4, fontSize: 12, fontWeight: 600,
          fontFamily: "Inter, sans-serif", cursor: "pointer",
          background: !isPreview ? P.accent : "transparent",
          color: !isPreview ? "#1B1E15" : P.dim,
          border: `1px solid ${!isPreview ? P.accent : P.border}`,
        }}>
          {de ? "Aktueller Stand" : "Current Status"}
        </button>
        <span style={{ color: P.dim, fontSize: 12 }}>|</span>
        <button onClick={() => setViewTier(-1)} style={{
          padding: "8px 14px", borderRadius: 4, fontSize: 12, fontWeight: 600,
          fontFamily: "Inter, sans-serif", cursor: "pointer",
          background: isPreview ? P.accent : "transparent",
          color: isPreview ? "#1B1E15" : P.dim,
          border: `1px solid ${isPreview ? P.accent : P.border}`,
        }}>
          {de ? "Admin-Vorschau" : "Admin Preview"}
        </button>

        {isPreview && (
          <>
            <span style={{ color: P.dim, fontSize: 12 }}>→</span>
            <div style={{ display: "flex", gap: 6 }}>
              {TIERS.map((t) => (
                <button key={t.level} onClick={() => setViewTier(t.level)} style={{
                  padding: "6px 10px", borderRadius: 3, fontSize: 11, fontWeight: 600,
                  fontFamily: "Inter, sans-serif", cursor: "pointer",
                  background: viewTier === t.level ? P.accent : "transparent",
                  color: viewTier === t.level ? "#1B1E15" : P.dim,
                  border: `1px solid ${viewTier === t.level ? P.accent : P.border}`,
                }}>
                  T{t.level}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Klickbare Content-Cards
function ContentCard({ icon, label, locked, onClick }) {
  return (
    <button onClick={onClick} disabled={locked} style={{
      flex: "1 1 calc(50% - 8px)", minWidth: 140, maxWidth: 200,
      padding: 20, borderRadius: 8,
      background: locked ? "rgba(0,0,0,0.2)" : P.panel,
      border: `1px solid ${locked ? "rgba(169,173,156,0.3)" : P.border}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 8, cursor: locked ? "not-allowed" : "pointer",
      opacity: locked ? 0.5 : 1,
      transition: "all 0.2s",
    }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{
        fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: "0.04em",
        color: P.text, textAlign: "center",
      }}>
        {label}
      </div>
      {locked && (
        <div style={{
          fontSize: 10, color: P.dim, marginTop: 4,
        }}>
          Tier 2+
        </div>
      )}
    </button>
  );
}

export default function PagePlan({ lang, session, profile }) {
  const de = lang === "de";
  const [viewTier, setViewTier] = useState(profile?.tier || 0);

  // Entweder "Aktueller Stand" (viewTier = profile.tier) oder Admin-Vorschau (viewTier = 1/2/3)
  const displayTier = viewTier === -1 ? 1 : viewTier; // -1 = Preview aktiv, default Tier 1 zeigen
  const isAdmin = profile?.is_admin;

  // Nicht eingeloggt oder kein aktives Tier -> Coming Soon
  if (!session || (displayTier === 0 && !isAdmin)) {
    return (
      <div style={{ maxWidth: 600, width: "100%" }}>
        <div style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700, letterSpacing: "0.06em",
          fontSize: "clamp(40px, 8vw, 64px)", lineHeight: 1, color: P.accent,
        }}>COMING</div>
        <div style={{
          fontFamily: "Oswald, sans-serif", fontWeight: 700, letterSpacing: "0.06em",
          fontSize: "clamp(40px, 8vw, 64px)", lineHeight: 1, color: P.text, marginBottom: 24,
        }}>SOON.</div>
        <div style={{ width: 56, height: 3, background: P.accent, marginBottom: 28 }}/>
        <div style={{ fontSize: 15, color: P.dim, lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
          {de
            ? "Der Trainingsplan wird gerade fertiggestellt. Sobald das Startdatum feststeht, läuft hier der Countdown bis zum Launch."
            : "The training plan is being finalised. Once the launch date is set, the countdown will run right here."}
        </div>
      </div>
    );
  }

  // Eingeloggt + Tier > 0 (oder Admin mit Preview) -> echte Nutzer-Ansicht
  return (
    <div style={{ width: "100%" }}>
      {isAdmin && <AdminToggle profile={profile} viewTier={viewTier} setViewTier={setViewTier} lang={lang} />}

      <div style={{
        fontFamily: "Oswald, sans-serif", fontWeight: 700, letterSpacing: "0.05em",
        fontSize: "clamp(28px,5vw,40px)", color: P.text, marginBottom: 8,
      }}>
        {de ? "MEIN BEREICH" : "MY AREA"}
      </div>
      <div style={{
        fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: "0.1em",
        color: P.accent, marginBottom: 28,
      }}>
        {de ? `TIER ${displayTier}` : `TIER ${displayTier}`}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
        <ContentCard icon="📋" label={de ? "Trainingsplan" : "Training Plan"} onClick={() => {}} />
        <ContentCard icon="🧠" label={de ? "Mental Module" : "Mental Modules"} locked={displayTier < 2} onClick={() => {}} />
        <ContentCard icon="📊" label={de ? "Mein Rückblick" : "My Review"} locked={displayTier < 2} onClick={() => {}} />
        <ContentCard icon="📥" label={de ? "PDF-Export" : "PDF Export"} locked={displayTier < 2} onClick={() => {}} />
        <ContentCard icon="⚙️" label={de ? "Einstellungen" : "Settings"} onClick={() => {}} />
      </div>

      <div style={{
        background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6,
        padding: 20, marginTop: 32,
      }}>
        <div style={{
          fontFamily: "Oswald, sans-serif", fontSize: 13, color: P.accent, letterSpacing: "0.06em",
          marginBottom: 12,
        }}>
          {de ? "INHALT WIRD GEBAUT" : "CONTENT IN PROGRESS"}
        </div>
        <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.7 }}>
          {de
            ? "Trainingsplan, Mental-Module und alle Inhalte werden gerade fertiggestellt. In Kürze hier verfügbar."
            : "Training plan, mental modules and all content are being finalised. Available here shortly."}
        </div>
      </div>
    </div>
  );
}
