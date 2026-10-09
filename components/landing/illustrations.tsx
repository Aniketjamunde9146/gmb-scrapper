import * as React from "react";

const L = { fill: "rgb(var(--ink) / .04)", stroke: "rgb(var(--ink) / .2)" };
const D = { stroke: "rgb(var(--ink) / .12)", fill: "none" };
const G = "url(#og)";
const T = { fill: "rgb(var(--ink) / .75)", fontSize: 10 } as const;
const W = (o: number) => `rgb(var(--ink) / ${o})`;

export function Scene({ children }: { children: React.ReactNode }) {
  return (
    <div className="scene border-b border-white/10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,140,0,.16),transparent_70%)] px-4 py-3">
      <svg viewBox="0 0 240 140" className="mx-auto h-36 w-full" aria-hidden>
        <defs><linearGradient id="og" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ffb347" /><stop offset="1" stopColor="#ff7a00" /></linearGradient></defs>
        {children}
      </svg>
    </div>
  );
}

export const IlSearch = () => (
  <Scene>
    <rect x="30" y="16" width="180" height="108" rx="12" {...L} />
    <path d="M30 76h180M90 16v108M156 16v108" {...D} />
    <rect x="44" y="26" width="112" height="22" rx="11" fill={W(.08)} />
    <circle cx="58" cy="37" r="5" stroke="#ff9a2e" strokeWidth="2" fill="none" /><path d="m62 41 4 4" stroke="#ff9a2e" strokeWidth="2" strokeLinecap="round" />
    <rect x="72" y="35" width="60" height="4" rx="2" fill={W(.3)} />
    <path d="M150 112c-16-16-22-26-22-36a22 22 0 0 1 44 0c0 10-6 20-22 36z" fill={G} /><circle cx="150" cy="76" r="7" fill="#000" />
  </Scene>
);
export const IlLive = () => (
  <Scene>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x="30" y={18 + i * 30} width="180" height="22" rx="7" {...L} />
        <circle cx="44" cy={29 + i * 30} r="4" fill={i === 0 ? "#34d399" : G} />
        <rect x="56" y={26 + i * 30} width={96 - i * 16} height="6" rx="3" fill={W(.3)} />
        <rect x="172" y={25 + i * 30} width="26" height="8" rx="4" fill={G} />
      </g>
    ))}
    <rect x="30" y="116" width="180" height="6" rx="3" fill={W(.1)} /><rect x="30" y="116" width="126" height="6" rx="3" fill={G} />
  </Scene>
);
export const IlExport = () => (
  <Scene>
    <rect x="28" y="20" width="86" height="100" rx="10" {...L} /><rect x="40" y="32" width="62" height="12" rx="4" fill={G} />
    <path d="M40 58h62M40 72h62M40 86h40" {...D} strokeWidth="2" />
    <path d="M124 70h26m-8-8 8 8-8 8" stroke="#ffc46b" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {["CSV", "XLSX", "JSON"].map((t, i) => (
      <g key={t}><rect x="160" y={30 + i * 30} width="54" height="22" rx="7" {...L} /><text x="187" y={45 + i * 30} textAnchor="middle" {...T}>{t}</text></g>
    ))}
  </Scene>
);
export const IlFilter = () => (
  <Scene>
    <path d="M30 22h112L102 70v38l-32 12V70z" fill="rgba(255,140,0,.08)" stroke="#ff9a2e" strokeWidth="1.5" strokeLinejoin="round" />
    {[["No site", 1], ["★ < 3.5", 1], ["Has phone", 0]].map(([t, on], i) => (
      <g key={String(t)}><rect x="156" y={30 + i * 32} width="62" height="22" rx="11" fill={on ? "rgba(255,140,0,.2)" : W(.04)} stroke={on ? "#ff9a2e" : W(.2)} /><text x="187" y={45 + i * 32} textAnchor="middle" {...T}>{t}</text></g>
    ))}
    <circle cx="60" cy="14" r="3" fill={W(.4)} /><circle cx="90" cy="10" r="3" fill="#ff9a2e" /><circle cx="118" cy="14" r="3" fill={W(.4)} />
  </Scene>
);
export const IlFields = () => (
  <Scene>
    {["Name", "Phone", "Website", "Rating"].map((t, i) => (
      <g key={t}>
        <rect x="46" y={16 + i * 28} width="148" height="22" rx="7" {...L} />
        <rect x="56" y={22 + i * 28} width="10" height="10" rx="3" fill={i < 3 ? G : "none"} stroke={i < 3 ? "none" : W(.3)} />
        {i < 3 && <path d="m58 27 2 2 4-4" stroke="#000" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
        <text x="76" y={31 + i * 28} {...T}>{t}</text>
      </g>
    ))}
  </Scene>
);
export const IlContact = () => (
  <Scene>
    <rect x="36" y="22" width="168" height="96" rx="12" {...L} /><circle cx="70" cy="54" r="15" fill={G} />
    <rect x="94" y="44" width="76" height="7" rx="3.5" fill={W(.55)} /><rect x="94" y="58" width="52" height="6" rx="3" fill={W(.2)} />
    <path d="M52 86h110M52 100h74" {...D} strokeWidth="2" /><rect x="156" y="88" width="36" height="20" rx="10" fill={G} /><text x="174" y="102" textAnchor="middle" fontSize="9" fontWeight="600" fill="#000">Call</text>
  </Scene>
);
export const IlChart = () => (
  <Scene>
    <path d="M30 120h180" {...D} />
    {[40, 62, 50, 84, 70, 100].map((h, i) => <rect key={i} x={40 + i * 30} y={120 - h} width="20" height={h} rx="5" fill={G} opacity={0.55 + i * 0.08} />)}
    <path d="M50 76 80 58 110 68 140 36 170 46 200 20" stroke="#fff" strokeOpacity=".7" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Scene>
);
export const IlBrowser = () => (
  <Scene>
    <rect x="28" y="16" width="184" height="108" rx="10" {...L} /><path d="M28 36h184" {...D} />
    {[40, 49, 58].map((x) => <circle key={x} cx={x} cy="26" r="2.5" fill={W(.3)} />)}
    <rect x="44" y="50" width="90" height="10" rx="5" fill={W(.6)} /><rect x="44" y="68" width="70" height="6" rx="3" fill={W(.2)} /><rect x="44" y="92" width="46" height="16" rx="8" fill={G} />
    <rect x="148" y="50" width="52" height="58" rx="8" fill="none" stroke="#ff9a2e" strokeDasharray="4 3" />
  </Scene>
);
export const IlStars = () => (
  <Scene>
    <rect x="46" y="20" width="148" height="100" rx="12" {...L} />
    <text x="120" y="68" textAnchor="middle" fontSize="38" fontWeight="600" fill="#fff">3.1</text>
    <text x="120" y="92" textAnchor="middle" fontSize="16" fill="#ff8c00" letterSpacing="3">★★★☆☆</text>
    <rect x="86" y="100" width="68" height="14" rx="7" fill="rgba(255,140,0,.2)" /><text x="120" y="110" textAnchor="middle" fontSize="8" fill="#ffc46b">Needs reviews</text>
  </Scene>
);
export const IlPhone = () => (
  <Scene>
    <rect x="86" y="12" width="68" height="116" rx="14" {...L} /><rect x="94" y="26" width="52" height="62" rx="8" fill={W(.05)} />
    <rect x="100" y="34" width="40" height="6" rx="3" fill={W(.4)} /><rect x="100" y="46" width="28" height="5" rx="2.5" fill={W(.2)} /><circle cx="120" cy="108" r="11" fill={G} />
    <path d="M168 48c8 6 8 26 0 32M180 38c14 12 14 42 0 54M72 48c-8 6-8 26 0 32M60 38c-14 12-14 42 0 54" stroke="#ffc46b" strokeWidth="2" fill="none" strokeLinecap="round" />
  </Scene>
);
export const IlGlobe = () => (
  <Scene>
    <circle cx="120" cy="70" r="54" {...L} /><ellipse cx="120" cy="70" rx="24" ry="54" {...D} /><path d="M66 70h108M74 44h92M74 96h92" {...D} />
    {[[96, 52], [140, 86], [126, 44]].map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="9" fill="rgba(255,140,0,.2)" /><circle cx={x} cy={y} r="4.5" fill={G} /></g>)}
  </Scene>
);

export const IlFree = () => (
  <Scene>
    <path d="M72 126h96l-8-30H80z" {...L} /><path d="M120 96V58" stroke="#ffc46b" strokeWidth="3" strokeLinecap="round" />
    <path d="M120 72c-28 2-40-12-40-30 26-2 40 8 40 30z" fill={G} /><path d="M120 58c26 0 38-14 38-32-26 0-38 12-38 32z" fill={G} opacity=".7" />
    <circle cx="192" cy="42" r="3" fill={W(.4)} /><circle cx="52" cy="62" r="2" fill={W(.3)} />
  </Scene>
);
export const IlPro = () => (
  <Scene>
    <ellipse cx="120" cy="72" rx="82" ry="24" {...D} transform="rotate(-20 120 72)" />
    <path d="M120 12c20 16 26 44 20 70h-40c-6-26 0-54 20-70z" {...L} stroke="#ff9a2e" /><circle cx="120" cy="48" r="8" fill={G} />
    <path d="M100 80l-16 18 18-2zM140 80l16 18-18-2z" fill={G} /><path d="M110 88c4 14 4 22 10 34 6-12 6-20 10-34z" fill="#ffc46b" />
    <circle cx="48" cy="36" r="2" fill={W(.5)} /><circle cx="196" cy="100" r="2.5" fill={W(.4)} /><circle cx="186" cy="30" r="2" fill="#ffc46b" />
  </Scene>
);
export const IlAgency = () => (
  <Scene>
    <path d="M24 122h192" {...D} />
    {[[36, 36, 78], [80, 46, 104], [134, 38, 66], [180, 30, 46]].map(([x, w, h], i) => (
      <g key={i}>
        <rect x={x} y={122 - h} width={w} height={h} rx="5" {...L} stroke={i === 1 ? "#ff9a2e" : L.stroke} />
        {[0, 1, 2].map((r) => <rect key={r} x={x + 8} y={122 - h + 10 + r * 18} width={w - 16} height="6" rx="3" fill={i === 1 ? G : W(.16)} />)}
      </g>
    ))}
  </Scene>
);
export const IlFaq = () => (
  <Scene>
    <rect x="30" y="20" width="110" height="44" rx="14" {...L} /><rect x="44" y="34" width="70" height="6" rx="3" fill={W(.4)} /><rect x="44" y="46" width="48" height="6" rx="3" fill={W(.2)} />
    <rect x="100" y="76" width="110" height="44" rx="14" fill={G} /><rect x="114" y="90" width="72" height="6" rx="3" fill="#000" opacity=".55" /><rect x="114" y="102" width="46" height="6" rx="3" fill="#000" opacity=".3" />
    <text x="186" y="52" fontSize="30" fontWeight="700" fill="#ff9a2e" textAnchor="middle">?</text>
  </Scene>
);

/* ---------- Dashboard scenes (same 240x140 grid, outline + saffron accent as the landing set) ---------- */

export const IlWelcome = () => (
  <Scene>
    <rect x="24" y="14" width="192" height="112" rx="12" {...L} />
    <path d="M24 70h192M96 14v112M164 14v112" {...D} />
    <path d="M40 104 70 88 100 94 130 62 160 70 196 38" stroke="#ffc46b" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {[[70, 88], [130, 62], [196, 38]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill="#000" stroke="#ff9a2e" strokeWidth="2" />)}
    <path d="M62 52c-9-9-12-15-12-21a12 12 0 0 1 24 0c0 6-3 12-12 21z" fill={G} /><circle cx="62" cy="31" r="4" fill="#000" />
    <rect x="108" y="24" width="64" height="10" rx="5" fill={W(.12)} /><rect x="108" y="40" width="40" height="6" rx="3" fill={W(.2)} />
  </Scene>
);

export const IlSaved = () => (
  <Scene>
    {[0, 1, 2].map((c) => (
      <g key={c}>
        <rect x={20 + c * 72} y="14" width="64" height="112" rx="10" {...L} stroke={c === 1 ? "#ff9a2e" : L.stroke} />
        <rect x={28 + c * 72} y="22" width="26" height="6" rx="3" fill={c === 2 ? "#34d399" : G} />
        {[0, 1, c === 0 ? 2 : -1].filter((i) => i >= 0).map((r) => (
          <g key={r}><rect x={28 + c * 72} y={36 + r * 28} width="48" height="22" rx="6" fill={W(.07)} stroke={W(.15)} /><rect x={33 + c * 72} y={42 + r * 28} width="30" height="4" rx="2" fill={W(.4)} /><rect x={33 + c * 72} y={50 + r * 28} width="18" height="3" rx="1.5" fill={W(.2)} /></g>
        ))}
      </g>
    ))}
    <path d="M78 64c12-10 22-10 34 0" stroke="#ffc46b" strokeWidth="2" strokeDasharray="4 3" fill="none" strokeLinecap="round" /><path d="m108 56 6 8-10 1z" fill="#ffc46b" />
  </Scene>
);

export const IlHistory = () => (
  <Scene>
    <circle cx="70" cy="70" r="40" {...L} /><circle cx="70" cy="70" r="40" stroke="#ff9a2e" strokeWidth="2" fill="none" strokeDasharray="190 62" strokeLinecap="round" transform="rotate(-90 70 70)" />
    <path d="M70 46v26l16 10" stroke="#ffc46b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {[0, 1, 2].map((i) => (
      <g key={i}><rect x="126" y={30 + i * 28} width="94" height="20" rx="7" {...L} /><circle cx="137" cy={40 + i * 28} r="3.5" fill={i === 0 ? "#34d399" : G} /><rect x="146" y={37 + i * 28} width={52 - i * 8} height="5" rx="2.5" fill={W(.35)} /></g>
    ))}
    <path d="M118 58c-4 0-8 2-8 6" stroke={W(.3)} strokeWidth="1.5" fill="none" />
  </Scene>
);

export const IlSettings = () => (
  <Scene>
    {[[34, 150], [64, 96], [94, 170]].map(([y, x], i) => (
      <g key={i}><rect x="30" y={y} width="150" height="6" rx="3" fill={W(.12)} /><rect x="30" y={y} width={x - 30} height="6" rx="3" fill={G} /><circle cx={x} cy={y + 3} r="8" fill="#000" stroke="#ff9a2e" strokeWidth="2" /></g>
    ))}
    <path d="M196 22l22 8v20c0 14-9 24-22 30-13-6-22-16-22-30V30z" {...L} stroke="#ff9a2e" />
    <path d="m187 52 6 6 11-12" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="30" y="112" width="70" height="12" rx="6" fill={W(.08)} /><rect x="108" y="112" width="40" height="12" rx="6" fill={G} />
  </Scene>
);

export const IlLogin = () => (
  <Scene>
    <rect x="52" y="18" width="136" height="104" rx="14" {...L} />
    <circle cx="120" cy="48" r="16" fill="rgba(255,140,0,.15)" stroke="#ff9a2e" strokeWidth="1.5" />
    <rect x="111" y="46" width="18" height="14" rx="4" fill={G} /><path d="M115 46v-4a5 5 0 0 1 10 0v4" stroke="#ffc46b" strokeWidth="2" fill="none" />
    <rect x="72" y="74" width="96" height="12" rx="6" fill={W(.08)} stroke={W(.15)} /><rect x="72" y="92" width="96" height="12" rx="6" fill={W(.08)} stroke={W(.15)} />
    <circle cx="82" cy="98" r="1.8" fill={W(.5)} /><circle cx="90" cy="98" r="1.8" fill={W(.5)} /><circle cx="98" cy="98" r="1.8" fill={W(.5)} />
    <rect x="72" y="80" width="40" height="3" rx="1.5" fill={W(.35)} />
    <path d="M200 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffc46b" /><circle cx="36" cy="100" r="2.5" fill={W(.3)} />
  </Scene>
);

export const IlSignup = () => (
  <Scene>
    <rect x="40" y="20" width="108" height="100" rx="14" {...L} />
    <circle cx="74" cy="52" r="14" fill={G} /><path d="M54 92c2-14 10-20 20-20s18 6 20 20z" fill="rgba(255,140,0,.25)" stroke="#ff9a2e" />
    <rect x="98" y="44" width="38" height="6" rx="3" fill={W(.5)} /><rect x="98" y="56" width="26" height="5" rx="2.5" fill={W(.2)} />
    <rect x="54" y="100" width="80" height="10" rx="5" fill={W(.08)} />
    <rect x="132" y="68" width="76" height="40" rx="12" fill={G} /><text x="170" y="86" textAnchor="middle" fontSize="13" fontWeight="700" fill="#000">3 searches</text><text x="170" y="100" textAnchor="middle" fontSize="9" fill="#000" opacity=".7">free to start</text>
    <path d="M196 26l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#ffc46b" />
  </Scene>
);

export const IlTemplates = () => (
  <Scene>
    <rect x="24" y="18" width="130" height="44" rx="14" {...L} /><rect x="38" y="31" width="86" height="6" rx="3" fill={W(.4)} /><rect x="38" y="44" width="58" height="6" rx="3" fill={W(.2)} />
    <rect x="86" y="72" width="130" height="46" rx="14" fill={G} /><rect x="100" y="85" width="92" height="6" rx="3" fill="#000" opacity=".55" /><rect x="100" y="98" width="62" height="6" rx="3" fill="#000" opacity=".3" />
    <circle cx="198" cy="106" r="9" fill="#000" /><path d="m194 106 8-4-3 9-2-4z" fill="#ffc46b" />
    <path d="M30 80c0 8 4 14 10 16l-2 8 10-8" stroke="#ffc46b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Scene>
);

export const IlInsights = () => (
  <Scene>
    <circle cx="68" cy="70" r="36" fill="none" stroke={W(.12)} strokeWidth="14" />
    <circle cx="68" cy="70" r="36" fill="none" stroke="url(#og)" strokeWidth="14" strokeDasharray="140 226" transform="rotate(-90 68 70)" />
    <circle cx="68" cy="70" r="36" fill="none" stroke="#34d399" strokeWidth="14" strokeDasharray="38 226" strokeDashoffset="-142" transform="rotate(-90 68 70)" />
    <text x="68" y="75" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">62%</text>
    {[34, 56, 44, 78, 64].map((h, i) => <rect key={i} x={126 + i * 18} y={116 - h} width="12" height={h} rx="4" fill={G} opacity={0.5 + i * 0.12} />)}
    <path d="M122 116h96" {...D} />
  </Scene>
);

export const IlScore = () => (
  <Scene>
    <path d="M48 102a72 72 0 0 1 144 0" fill="none" stroke={W(.12)} strokeWidth="14" strokeLinecap="round" />
    <path d="M48 102a72 72 0 0 1 112-60" fill="none" stroke="url(#og)" strokeWidth="14" strokeLinecap="round" />
    <path d="M120 102 152 62" stroke="#fff" strokeWidth="3" strokeLinecap="round" /><circle cx="120" cy="102" r="7" fill="#000" stroke="#ff9a2e" strokeWidth="2.5" />
    <rect x="92" y="114" width="56" height="16" rx="8" fill="rgba(255,140,0,.2)" stroke="#ff9a2e" /><text x="120" y="126" textAnchor="middle" fontSize="9" fontWeight="600" fill="#ffc46b">Hot lead</text>
    <text x="40" y="118" fontSize="8" fill={W(.4)}>0</text><text x="190" y="118" fontSize="8" fill={W(.4)}>100</text>
  </Scene>
);

export const IlReminder = () => (
  <Scene>
    <rect x="46" y="22" width="130" height="100" rx="12" {...L} /><path d="M46 48h130" {...D} /><rect x="46" y="22" width="130" height="26" rx="12" fill="rgba(255,140,0,.14)" />
    <path d="M72 14v14M150 14v14" stroke="#ffc46b" strokeWidth="3" strokeLinecap="round" />
    {[0, 1, 2, 3, 4].map((c) => [0, 1].map((r) => <rect key={`${c}${r}`} x={60 + c * 22} y={60 + r * 24} width="14" height="14" rx="4" fill={c === 2 && r === 0 ? "url(#og)" : W(.08)} />))}
    <g transform="translate(176 86)"><path d="M0 -26c-14 0-22 10-22 24v14l-6 8h56l-6-8v-14c0-14-8-24-22-24z" fill="#000" stroke="#ff9a2e" strokeWidth="2" /><circle cy="30" r="5" fill={G} /></g>
  </Scene>
);

export const IlFunnel = () => (
  <Scene>
    {[[30, 180, 0.9], [50, 150, 0.7], [70, 112, 0.55], [90, 74, 0.4]].map(([y, w, o], i) => (
      <rect key={i} x={120 - w / 2} y={y - 12} width={w} height="20" rx="8" fill={i === 3 ? "#34d399" : G} opacity={o} />
    ))}
    {["New", "Contacted", "Interested", "Won"].map((t, i) => <text key={t} x="120" y={[30, 50, 70, 90][i] + 2} textAnchor="middle" fontSize="9" fontWeight="600" fill="#000">{t}</text>)}
    <path d="M120 112v14m-6-6 6 6 6-6" stroke="#ffc46b" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Scene>
);

export const IlCheck = () => (
  <Scene>
    <circle cx="120" cy="70" r="40" fill="rgba(255,140,0,.12)" stroke="#ff9a2e" strokeWidth="2" /><circle cx="120" cy="70" r="54" {...D} strokeDasharray="3 6" />
    <path d="m100 70 14 14 28-30" stroke="url(#og)" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffc46b" /><circle cx="190" cy="40" r="3" fill="#ffc46b" /><circle cx="196" cy="108" r="2.5" fill={W(.4)} />
  </Scene>
);
