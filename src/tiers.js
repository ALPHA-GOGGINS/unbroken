// Zentrale Tier-Definition für UNBROKEN.
// Jedes Feature hat ein tierLevel (1, 2 oder 3) — die Mindeststufe, ab der
// es freigeschaltet ist. Tier 3 enthaelt automatisch alles aus Tier 1+2,
// Tier 2 alles aus Tier 1 usw. (siehe featuresUpToTier).
//
// Diese Datei ist die einzige Quelle fuer Tier-Inhalte: die Pricing-Seite,
// der Admin-Toggle und spaeter jede Freischalt-Pruefung in der App lesen
// von hier, statt Tier-Texte an mehreren Stellen zu duplizieren.

export const TIER_NONE     = 0; // kein aktives Abo (Warteliste / kostenlos)
export const TIER_RECRUIT  = 1;
export const TIER_OPERATOR = 2;
export const TIER_UNBROKEN = 3;

export const FEATURES = [
  // ─── Tier 1: Recruit ───────────────────────────────────────────────
  {
    id: "training_plan",
    tierLevel: TIER_RECRUIT,
    de: "Individueller Trainingsplan (Anfänger, Fortgeschritten, Hardcore, 40-Tage-Challenge)",
    en: "Personalized training plan (Beginner, Advanced, Hardcore, 40-Day Challenge)",
  },
  {
    id: "day_unlock",
    tierLevel: TIER_RECRUIT,
    de: "Tag-für-Tag-Freischaltung",
    en: "Day-by-day unlock",
  },
  {
    id: "basic_streak",
    tierLevel: TIER_RECRUIT,
    de: "Basis-Streak-Tracking + Progress-Graph",
    en: "Basic streak tracking + progress graph",
  },

  // ─── Tier 2: Operator ──────────────────────────────────────────────
  {
    id: "mental_module",
    tierLevel: TIER_OPERATOR,
    de: "Mental Module (Disziplin-Mindset-Texte)",
    en: "Mental module (discipline mindset content)",
  },
  {
    id: "extended_tracking",
    tierLevel: TIER_OPERATOR,
    de: "Erweitertes Tracking (Mood, Sleep, Energy)",
    en: "Extended tracking (mood, sleep, energy)",
  },
  {
    id: "weekly_review",
    tierLevel: TIER_OPERATOR,
    de: "Wöchentlicher Rückblick (automatische Auswertung)",
    en: "Weekly review (automated evaluation)",
  },
  {
    id: "pdf_export",
    tierLevel: TIER_OPERATOR,
    de: "PDF-Export des Plans",
    en: "PDF export of your plan",
  },
  {
    id: "early_access",
    tierLevel: TIER_OPERATOR,
    de: "Early Access zu neuen Features",
    en: "Early access to new features",
  },

  // ─── Tier 3: Unbroken ──────────────────────────────────────────────
  {
    id: "auto_adjust",
    tierLevel: TIER_UNBROKEN,
    de: "Automatisierte Plan-Anpassung (regelbasiert, reagiert auf deine Streak/Ausfälle)",
    en: "Automated plan adjustment (rule-based, reacts to your streak/misses)",
  },
  {
    id: "personal_eval",
    tierLevel: TIER_UNBROKEN,
    de: "Persönliche Auswertungen (automatisiert generiert)",
    en: "Personal evaluations (auto-generated)",
  },
  {
    id: "exclusive_challenges",
    tierLevel: TIER_UNBROKEN,
    de: "Exclusive Challenges",
    en: "Exclusive challenges",
  },
  {
    id: "founding_badge",
    tierLevel: TIER_UNBROKEN,
    de: "Founding-Member-Badge, nur 50 Plätze",
    en: "Founding member badge, only 50 spots",
  },
];

export const TIERS = [
  {
    level: TIER_RECRUIT,
    key: "recruit",
    name: "Recruit",
    price: "4,99€",
    priceEn: "€4.99",
    period: { de: "/ Monat", en: "/ month" },
  },
  {
    level: TIER_OPERATOR,
    key: "operator",
    name: "Operator",
    price: "9,99€",
    priceEn: "€9.99",
    period: { de: "/ Monat", en: "/ month" },
  },
  {
    level: TIER_UNBROKEN,
    key: "unbroken",
    name: "Unbroken",
    price: "14,99€",
    priceEn: "€14.99",
    period: { de: "/ Monat", en: "/ month" },
  },
];

// Nur die Features, die genau auf dieser Stufe neu dazukommen.
export function featuresForTier(level) {
  return FEATURES.filter((f) => f.tierLevel === level);
}

// Alle Features, die ab dieser Stufe verfügbar sind (inkl. niedrigerer Stufen).
export function featuresUpToTier(level) {
  return FEATURES.filter((f) => f.tierLevel <= level);
}

export function tierName(level) {
  return TIERS.find((t) => t.level === level)?.name || null;
}

// Zentrale Freischalt-Prüfung für spätere Feature-Gates in der App.
// profile.tier wird sowohl von echten Stripe-Zahlungen als auch vom
// Admin-Toggle "Ansicht als Tier X" gesetzt — für die App ist das ununterscheidbar.
export function hasAccess(profile, requiredTierLevel) {
  if (!requiredTierLevel) return true;
  return (profile?.tier || TIER_NONE) >= requiredTierLevel;
}
