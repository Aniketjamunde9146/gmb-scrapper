"use client";
import * as React from "react";
import { Card, Section, SectionHead, cx } from "./ui";
import { IlExport, IlLive, IlSearch } from "./illustrations";
import { Reveal, gsap, reduced } from "./motion";

type Mode = "manual" | "tool";
const steps = [
  { Il: IlSearch, t: "Search", manual: ["Scroll Google Maps and open each listing, one business at a time.", "2 hrs"], tool: ["Type “dentist in Pune” once. Add filters like no website or low rating.", "30 sec"] },
  { Il: IlLive, t: "Collect", manual: ["Copy names, phones and links into a sheet by hand, then fix the typos.", "3 hrs"], tool: ["Leads stream into a live table with phone, rating and website filled in.", "2 min"] },
  { Il: IlExport, t: "Export", manual: ["Clean the sheet, remove duplicates and format it for your team.", "1 hr"], tool: ["Download a clean CSV, Excel or JSON file and start calling.", "1 click"] },
];
const total = { manual: ["About 6 hours", "A full working day lost before the first call."], tool: ["About 3 minutes", "A call-ready list before your coffee gets cold."] };

export function HowItWorks() {
  const [mode, setMode] = React.useState<Mode>("tool");
  const root = React.useRef<HTMLDivElement>(null);
  const bar = React.useRef<HTMLDivElement>(null);
  const first = React.useRef(true);

  React.useEffect(() => {
    const w = mode === "manual" ? "100%" : "4%";
    if (first.current || reduced()) { first.current = false; if (bar.current) bar.current.style.width = w; return; }
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-swap]", { opacity: 0, y: 10, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, stagger: 0.05, ease: "power2.out" });
      gsap.to(bar.current, { width: w, duration: 0.9, ease: "power3.inOut" });
    }, root);
    return () => ctx.revert();
  }, [mode]);

  return (
    <Section id="how-it-works">
      <Reveal>
        <SectionHead title="How it works" sub="Switch between the old way and GMB Scraper to see where your time goes." />
        <div data-reveal className="mt-8 flex justify-center">
          <div role="group" aria-label="Compare workflows" className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm">
            {([["manual", "The manual way"], ["tool", "With GMB Scraper"]] as const).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)} className={cx("rounded-full px-4 py-1.5 outline-none transition focus-visible:ring-2 focus-visible:ring-orange-400/70", mode === k ? "bg-white text-black" : "text-white/60 hover:text-white")}>{l}</button>
            ))}
          </div>
        </div>
        <div ref={root}>
          <ol className="relative mt-10 flex flex-col gap-6">
            <div aria-hidden className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-orange-500/50 to-transparent md:block" />
            {steps.map(({ Il, t, ...s }, i) => (
              <li key={t} data-reveal data-dir={i % 2 ? "right" : "left"} className="relative grid items-center gap-6 md:grid-cols-2 md:gap-16">
                <span className="absolute left-1/2 top-1/2 z-10 hidden size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-b from-white to-white/70 text-sm font-semibold text-black shadow-[0_0_30px_rgba(255,140,0,.5)] md:grid">{i + 1}</span>
                <div className={i % 2 ? "md:order-2" : ""}>
                  <Card pad=""><div className={cx("transition duration-500", mode === "manual" && "opacity-50 grayscale")}><Il /></div></Card>
                </div>
                <div className={i % 2 ? "md:order-1 md:text-right" : ""}>
                  <span data-swap className={cx("inline-block rounded-full border px-2.5 py-0.5 text-xs", mode === "tool" ? "border-orange-500/40 bg-orange-500/15 text-orange-200" : "border-white/15 text-white/60")}>Step {i + 1} · {s[mode][1]}</span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">{t}</h3>
                  <p data-swap className="mt-2 max-w-md text-[15px] leading-relaxed text-white/55 md:inline-block">{s[mode][0]}</p>
                </div>
              </li>
            ))}
          </ol>
          <div data-reveal data-dir="scale" className="mt-8">
            <Card>
              <div className="flex items-center justify-between gap-4 text-sm"><span className="text-white/60">Time to a call-ready list</span><span data-swap className="font-semibold">{total[mode][0]}</span></div>
              <div className="mt-3 h-2 rounded-full bg-white/10"><div ref={bar} className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300" style={{ width: "4%" }} /></div>
              <p data-swap className="mt-3 text-sm text-white/55">{total[mode][1]}</p>
            </Card>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}