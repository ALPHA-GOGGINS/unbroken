const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

export default function PageConcept({ lang }) {
  const de = lang === "de";

  return (
    <>
      <style>{`
        .kz-grid    { display:grid; grid-template-columns:1fr; gap:32px; width:100%; }
        .kz-col     { min-width:0; }
        .kz-h1      { font-family:Oswald,sans-serif; font-weight:700; color:${P.text};
                      font-size:clamp(28px,5vw,36px); margin-bottom:24px; }
        .kz-p       { font-size:15px; line-height:1.8; color:${P.text}; margin:0 0 16px; }
        .kz-p-dim   { font-size:15px; line-height:1.8; color:${P.dim}; margin:0 0 16px; }
        .kz-block   { border-top:1px solid ${P.border}; padding-top:24px; margin-top:8px; }
        .kz-label   { font-family:Oswald,sans-serif; font-size:14px; color:${P.accent};
                      letter-spacing:0.06em; margin-bottom:6px; }
        .kz-credit  { font-size:13px; color:${P.dim}; font-style:italic; margin:0 0 14px; }

        @media (min-width: 900px) {
          .kz-grid  { grid-template-columns: 1fr 1fr; gap:56px; align-items:start; }
          .kz-block { margin-top:0; }
          .kz-40    { border-top:none; padding-top:0;
                      border-left:1px solid ${P.border}; padding-left:40px; }
        }
      `}</style>

      <div className="kz-grid">

        {/* Linke Spalte */}
        <div className="kz-col">
          <div className="kz-h1">{de ? "Worum es geht" : "What this is"}</div>

          <p className="kz-p">
            {de
              ? "Unbroken kommt nicht von jemandem, der bereits oben steht und erklärt, wie man hochkommt. Hinter diesem Projekt steckt jemand, der selbst noch mittendrin ist."
              : "Unbroken isn't built by someone at the top explaining how to get there. It's built by someone still in it — progress, setbacks, and everything in between."}
          </p>

          <p className="kz-p">
            {de
              ? "Das Kernkonzept: Statt eines starren Plans entsteht hier etwas, das sich durch echte Daten von echten Menschen weiterentwickelt."
              : "The core idea: instead of a fixed plan, this evolves through real data from real people."}
          </p>

          <p className="kz-p-dim" style={{ marginBottom:32 }}>
            {de
              ? "Dieses Projekt steht ganz am Anfang. Wer jetzt mitmacht, gestaltet mit, was daraus wird."
              : "This project is at the very start. Joining now means shaping what this becomes."}
          </p>

          <div className="kz-block">
            <div className="kz-label">{de ? "WER STECKT DAHINTER?" : "WHO'S BEHIND THIS?"}</div>
            <p style={{ fontSize:14, color:P.dim, lineHeight:1.7, margin:0 }}>
              {de
                ? "Unbroken wird von einer einzelnen Person aufgebaut, die selbst mitten im eigenen Weg steckt."
                : "Unbroken is built by a single person who is still in the middle of their own journey."}
            </p>
          </div>
        </div>

        {/* Rechte Spalte – Warum 40 */}
        <div className="kz-col kz-block kz-40">
          <div className="kz-label">{de ? "WARUM 40?" : "WHY 40?"}</div>
          <p className="kz-credit">
            {de ? "Inspiriert von David Goggins." : "Inspired by David Goggins."}
          </p>

          <p className="kz-p">
            {de
              ? "Der Name kommt von der 40-Prozent-Regel: Wenn dein Kopf sagt, dass du am Ende bist, hast du in Wahrheit erst etwa 40 Prozent von dem abgerufen, was in dir steckt. Der Rest liegt hinter einer Wand, die dein Verstand baut, lange bevor dein Körper wirklich aufgibt."
              : "The name comes from the 40 percent rule: when your mind tells you you're done, you've actually only tapped about 40 percent of what you've got. The rest sits behind a wall your head builds long before your body gives out."}
          </p>

          <p className="kz-p">
            {de
              ? "Das ist keine Ausrede, härter zu trainieren, bis etwas reißt. Es ist eine Erinnerung daran, dass die Stimme, die aufhören will, nicht die Wahrheit sagt. Sie meldet sich viel zu früh."
              : "This isn't an excuse to push until something tears. It's a reminder that the voice telling you to quit isn't telling the truth. It shows up way too early."}
          </p>

          <p className="kz-p-dim" style={{ margin:0 }}>
            {de
              ? "Die Domain trägt die 40, weil genau da die Arbeit anfängt: an dem Punkt, an dem du normalerweise aufhörst."
              : "The domain carries the 40 because that's where the work starts: at the point where you'd normally stop."}
          </p>
        </div>

      </div>
    </>
  );
}
