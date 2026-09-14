const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227", panel:"#2A2F22", border:"#3D4530" };

export default function PageConcept({ lang }) {
  const de = lang === "de";
  return (
    <div style={{ maxWidth:600 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:32, fontWeight:700, color:P.text, marginBottom:24 }}>
        {de?"Worum es geht":"What this is"}
      </div>
      <p style={{ fontSize:15, lineHeight:1.8, color:P.text, marginBottom:16 }}>
        {de?"Unbroken kommt nicht von jemandem, der bereits oben steht und erklärt, wie man hochkommt. Hinter diesem Projekt steckt jemand, der selbst noch mittendrin ist.":"Unbroken isn't built by someone at the top explaining how to get there. It's built by someone still in it — progress, setbacks, and everything in between."}
      </p>
      <p style={{ fontSize:15, lineHeight:1.8, color:P.text, marginBottom:16 }}>
        {de?"Das Kernkonzept: Statt eines starren Plans entsteht hier etwas, das sich durch echte Daten von echten Menschen weiterentwickelt.":"The core idea: instead of a fixed plan, this evolves through real data from real people."}
      </p>
      <p style={{ fontSize:15, lineHeight:1.8, color:P.dim, marginBottom:32 }}>
        {de?"Dieses Projekt steht ganz am Anfang. Wer jetzt mitmacht, gestaltet mit, was daraus wird.":"This project is at the very start. Joining now means shaping what this becomes."}
      </p>
      <div style={{ borderTop:`1px solid ${P.border}`, paddingTop:24 }}>
        <div style={{ fontFamily:"Oswald, sans-serif", fontSize:14, color:P.accent, marginBottom:8 }}>{de?"WER STECKT DAHINTER?":"WHO'S BEHIND THIS?"}</div>
        <p style={{ fontSize:14, color:P.dim, lineHeight:1.7, margin:0 }}>
          {de?"Unbroken wird von einer einzelnen Person aufgebaut, die selbst mitten im eigenen Weg steckt.":"Unbroken is built by a single person who is still in the middle of their own journey."}
        </p>
      </div>
    </div>
  );
}
