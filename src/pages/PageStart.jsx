import { useNavigate } from "react-router-dom";

const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

export default function PageStart({ lang }) {
  const navigate = useNavigate();
  const de = lang === "de";

  return (
    <>
      <style>{`
        .ub-hero        { max-width: 640px; }
        .ub-title       { font-family: Oswald, sans-serif; font-weight: 700; color: ${P.text};
                          letter-spacing: 0.04em; line-height: 1; margin-bottom: 20px;
                          font-size: clamp(44px, 9vw, 88px); }
        .ub-lead        { color: ${P.text}; line-height: 1.6; margin-bottom: 16px;
                          font-size: clamp(15px, 2.2vw, 20px); }
        .ub-body        { color: ${P.dim}; line-height: 1.8; margin-bottom: 36px;
                          font-size: clamp(13px, 1.6vw, 15px); }
        .ub-rule        { width: 48px; height: 3px; background: ${P.accent}; margin-bottom: 36px; }
        .ub-cta         { text-align: left; padding: 20px 24px; border-radius: 6px; cursor: pointer;
                          border: 1px solid ${P.accent}; background: ${P.accent};
                          width: 100%; max-width: 340px; }
        .ub-cta-title   { font-family: Oswald, sans-serif; color: #1B1E15; margin-bottom: 4px;
                          letter-spacing: 0.03em; font-size: clamp(16px, 2vw, 20px); }
        .ub-cta-sub     { font-size: 13px; color: rgba(27,30,21,0.7); }
        .ub-tag         { margin-top: 48px; font-size: 11px; color: ${P.dim};
                          letter-spacing: 0.08em; font-family: Oswald, sans-serif; }
      `}</style>

      <div className="ub-hero">
        <div className="ub-title">UNBROKEN</div>

        <div className="ub-lead">
          {de
            ? "Gebaut für Leute, die es leid sind, auf Motivation zu warten."
            : "Built for people done waiting on motivation."}
        </div>

        <div className="ub-body">
          {de
            ? "Disziplin ist kein Talent. Sie ist eine Entscheidung, die du jeden Tag neu triffst. Unbroken gibt dir die Struktur dafür – kein Hype, keine leeren Versprechen."
            : "Discipline isn't a talent. It's a decision you make again every single day. Unbroken gives you the structure for it — no hype, no empty promises."}
        </div>

        <div className="ub-rule" />

        <button className="ub-cta" onClick={() => navigate("/plan")}>
          <div className="ub-cta-title">{de ? "JETZT STARTEN" : "START NOW"}</div>
          <div className="ub-cta-sub">{de ? "Dein persönlicher Trainingsplan" : "Your personal training plan"}</div>
        </button>

        <div className="ub-tag">
          {de ? "DISZIPLIN. KEIN PUDER." : "DISCIPLINE. NO SUGARCOAT."}
        </div>
      </div>
    </>
  );
}
