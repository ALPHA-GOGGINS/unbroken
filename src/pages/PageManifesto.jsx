const P = { text:"#EEEAE0", dim:"#A9AD9C", accent:"#C9A227" };

const ITEMS_DE = [
  "Wir verkaufen keine Motivation. Motivation kommt und geht – Disziplin bleibt.",
  "Wer selbst durch etwas gegangen ist, versteht es besser als jeder Außenstehende.",
  "Kein starrer Plan schlägt einen, der auf echten Daten echter Menschen basiert.",
  "Rückschläge gehören zum Weg. Sie sind keine Niederlage, sondern Datenpunkte.",
  "Dieses Projekt steht ganz am Anfang – und das sagen wir offen.",
];
const ITEMS_EN = [
  "We don't sell motivation. Motivation comes and goes — discipline stays.",
  "Whoever has lived through something understands it better than any outside expert.",
  "No fixed plan beats one that grows from real data of real people.",
  "Setbacks are part of the path, not a defeat — they're data points.",
  "This project is at the very start — and we say so openly.",
];

export default function PageManifesto({ lang }) {
  const items = lang === "de" ? ITEMS_DE : ITEMS_EN;
  return (
    <div style={{ maxWidth:600 }}>
      <div style={{ fontFamily:"Oswald, sans-serif", fontSize:32, fontWeight:700, color:"#EEEAE0", marginBottom:32 }}>
        {lang==="de"?"MANIFEST":"MANIFESTO"}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
        {items.map((line, i) => (
          <div key={i} style={{ display:"flex", gap:16 }}>
            <span style={{ fontFamily:"Oswald, sans-serif", fontSize:13, color:P.accent, letterSpacing:"0.08em", flexShrink:0, paddingTop:2 }}>
              {String(i+1).padStart(2,"0")}
            </span>
            <span style={{ fontSize:16, lineHeight:1.7, color:P.text }}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

