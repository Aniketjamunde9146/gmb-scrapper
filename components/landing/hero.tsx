"use client";
import * as React from "react";
import { ArrowUpRight, BarChart3, FileText, History, LayoutDashboard, MapPin, Play, Plus, Search, ShieldCheck, Table2, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Btn } from "./ui";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
.lm-root, .lm-root * { font-family:'Inter',ui-sans-serif,system-ui,sans-serif; }
@keyframes lm-in { from{opacity:0;transform:translateY(14px);filter:blur(10px)} to{opacity:1;transform:none;filter:blur(0)} }
@keyframes lm-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes lm-draw { from{stroke-dashoffset:1} to{stroke-dashoffset:0} }
.lm-in{animation:lm-in .8s cubic-bezier(.23,1,.32,1) both}.lm-in2{animation:lm-in .8s .12s cubic-bezier(.23,1,.32,1) both}
.lm-in3{animation:lm-in .8s .24s cubic-bezier(.23,1,.32,1) both}.lm-in4{animation:lm-in 1s .38s cubic-bezier(.23,1,.32,1) both}
.lm-dot{animation:lm-pulse 1.4s ease-in-out infinite}
.lm-draw{stroke-dasharray:1;stroke-dashoffset:0;animation:lm-draw 2s .7s cubic-bezier(.23,1,.32,1) both}
@media (prefers-reduced-motion:reduce){.lm-in,.lm-in2,.lm-in3,.lm-in4,.lm-dot,.lm-draw{animation:none}}
`;

const STATS = [
  { label: "Total leads", value: "1,248", delta: "+12.5%", up: true, note: "Growing every scrape", sub: "Found in the last 30 days" },
  { label: "No website", value: "462", delta: "+37%", up: true, note: "Hot leads to pitch", sub: "Businesses with no site listed" },
  { label: "With phone", value: "1,161", delta: "93%", up: true, note: "Easy to reach", sub: "Phone numbers captured" },
  { label: "Low rating", value: "184", delta: "-8%", up: false, note: "Fewer weak listings", sub: "Rated under 3.5 stars" },
];
const SIDE = [
  [LayoutDashboard, "Dashboard"], [Search, "New scrape"], [Table2, "Results"], [BarChart3, "Analytics"], [History, "History"],
] as const;
const ROWS = [
  ["Smile Craft Dental", "Kothrud", "4.8", "212", "No website"],
  ["Dr. Rao's Clinic", "Baner", "4.2", "96", "No website"],
  ["Pune Tooth Care", "Viman Nagar", "3.1", "41", "Low rating"],
  ["Pearl Dental Studio", "Aundh", "4.6", "158", "Verified"],
];
const BADGE: Record<string, string> = {
  "No website": "border-orange-500/40 bg-orange-500/15 text-orange-300",
  "Low rating": "border-red-400/30 bg-red-500/10 text-red-300",
  Verified: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
};

function chart(w: number, h: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const v = 0.22 + 0.5 * t + 0.14 * Math.sin(i * 0.5) + 0.07 * Math.sin(i * 1.4 + 1);
    pts.push([t * w, h - Math.min(0.94, Math.max(0.08, v)) * h]);
  }
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return { line, area: `${line} L${w} ${h} L0 ${h} Z` };
}

function Dashboard() {
  const { line, area } = React.useMemo(() => chart(800, 130), []);
  return (
    <div className="lm-dark relative mx-auto w-full max-w-5xl text-white">
      <div
        className="rounded-2xl border border-white/10 bg-[#0b0b0c] p-2 shadow-[0_-12px_90px_-20px_rgba(255,140,0,0.5)]"
        style={{ WebkitMaskImage: "linear-gradient(to bottom,#000 72%,transparent 100%)", maskImage: "linear-gradient(to bottom,#000 72%,transparent 100%)" }}
      >
        <div className="grid min-h-[420px] gap-2 text-left md:grid-cols-[170px_1fr]">
          <aside className="hidden rounded-xl bg-[#0f0f10] p-3 md:block">
            <div className="flex items-center gap-2 px-1 text-[11px] font-medium"><MapPin className="size-3.5 text-orange-500" aria-hidden /> GMB Scraper</div>
            <div className="mt-4 flex items-center gap-1.5 rounded-md bg-white px-2 py-1.5 text-[10px] font-medium text-black"><Plus className="size-3" aria-hidden /> Quick scrape</div>
            <ul className="mt-4 space-y-0.5">
              {SIDE.map(([I, l], i) => (
                <li key={l} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${i === 2 ? "bg-white/[0.08] text-white" : "text-white/60"}`}><I className="size-3" aria-hidden /> {l}</li>
              ))}
            </ul>
            <p className="mt-5 px-2 text-[9px] text-white/35">Exports</p>
            <ul className="mt-1 space-y-0.5">
              {["CSV file", "Excel file", "JSON file"].map((l) => (
                <li key={l} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-white/55"><FileText className="size-3" aria-hidden /> {l}</li>
              ))}
            </ul>
            <div className="mt-8 rounded-lg border border-white/10 p-2 text-[9px] text-white/50">
              <div className="flex justify-between"><span>Credits</span><span className="text-white/80">640 / 1,000</span></div>
              <div className="mt-1.5 h-1 rounded-full bg-white/10"><div className="h-full w-[64%] rounded-full bg-orange-500" /></div>
            </div>
          </aside>

          <div className="rounded-xl bg-[#0f0f10] p-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 text-[11px]">
              <span className="font-medium text-white/80">Results</span>
              <span className="flex items-center gap-2 truncate pl-3 text-white/50"><span className="lm-dot size-1.5 rounded-full bg-emerald-400" aria-hidden /> dentist in Pune</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-3">
                  <div className="flex items-center justify-between text-[9px] text-white/50">
                    {s.label}
                    <span className="flex items-center gap-0.5 rounded-full border border-white/10 px-1.5 py-0.5 text-white/70">
                      {s.up ? <TrendingUp className="size-2.5" aria-hidden /> : <TrendingDown className="size-2.5" aria-hidden />}{s.delta}
                    </span>
                  </div>
                  <p className="mt-1.5 text-lg font-semibold">{s.value}</p>
                  <p className="mt-2 flex items-center gap-1 text-[9px] font-medium text-white/80">{s.note} <ArrowUpRight className="size-2.5" aria-hidden /></p>
                  <p className="mt-0.5 text-[9px] text-white/40">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-2.5 rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-3">
              <div className="flex items-start justify-between">
                <div><p className="text-[11px] font-medium">Leads found</p><p className="text-[9px] text-white/40">New businesses scraped over time</p></div>
                <div className="flex overflow-hidden rounded-md border border-white/10 text-[9px] text-white/60">
                  <span className="bg-white/10 px-2 py-1 text-white">3 months</span><span className="hidden px-2 py-1 sm:inline">30 days</span><span className="hidden px-2 py-1 sm:inline">7 days</span>
                </div>
              </div>
              <svg viewBox="0 0 800 130" className="mt-3 h-28 w-full" preserveAspectRatio="none" aria-hidden>
                <defs><linearGradient id="lm-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ff8a1f" stopOpacity="0.5" /><stop offset="100%" stopColor="#ff8a1f" stopOpacity="0.02" /></linearGradient></defs>
                <path d={area} fill="url(#lm-fill)" />
                <path d={line} pathLength={1} className="lm-draw" fill="none" stroke="#ffa24a" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>

            <div className="mt-2.5 overflow-hidden rounded-xl border border-white/[0.07] text-[10px]">
              {ROWS.map((r) => (
                <div key={r[0]} className="grid grid-cols-[1.6fr_1fr_.5fr_auto] items-center gap-2 border-b border-white/5 px-3 py-2 last:border-0">
                  <span className="truncate font-medium text-white/85">{r[0]}</span>
                  <span className="truncate text-white/45">{r[1]}</span>
                  <span className="text-white/60">★ {r[2]}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] ${BADGE[r[4]]}`}>{r[4]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <div className="lm-root overflow-hidden bg-black text-white">
      <style>{CSS}</style>
      <section className="relative px-4 pb-0 pt-32 sm:px-5 sm:pt-28">
        <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
          <a href="#pricing" className="lm-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] text-white/60 transition-colors hover:border-orange-400/50">
            3 free searches, no card needed
            <span className="flex items-center gap-1 font-semibold text-white">See plans <ArrowUpRight className="size-3" aria-hidden /></span>
          </a>
          <h1 className="lm-in mt-6 font-semibold leading-[1.08]" style={{ fontSize: "clamp(1.9rem,6.4vw,4.5rem)", letterSpacing: "-0.04em", background: "linear-gradient(to bottom,var(--color-white) 30%,rgb(var(--ink) / .55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            <span className="block sm:whitespace-nowrap">Turn Google Maps businesses</span>
            <span className="block sm:whitespace-nowrap">into your lead list</span>
          </h1>
          <p className="lm-in2 mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-white/60 sm:text-lg">
            Search any business type in any city, spot the ones with no website, and export clean leads to CSV or Excel in minutes.
          </p>
          <div className="lm-in3 mt-7 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Btn variant="light" href="/signup"><Zap className="size-4" aria-hidden /> Start scraping free</Btn>
            <Btn variant="dark" href="#features"><Play className="size-4" aria-hidden /> See sample leads</Btn>
          </div>
          <p className="lm-in3 mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/40"><ShieldCheck className="size-3" aria-hidden /> Official data providers. Export CSV, XLSX or JSON.</p>
        </div>
        <div className="lm-in4 relative mt-12 sm:mt-16">
          <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[1300px] max-w-[220vw] -translate-x-1/2 sm:-top-56 sm:h-[620px]" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 38%,rgba(255,122,0,.5) 0%,rgba(210,120,30,.26) 38%,rgba(0,0,0,0) 72%)" }} />
          <Dashboard />
        </div>
      </section>
    </div>
  );
}
export default Hero;
