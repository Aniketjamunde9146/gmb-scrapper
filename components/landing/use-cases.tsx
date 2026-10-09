"use client";
import * as React from "react";
import { ArrowRight, BarChart3, Code2, Megaphone, Phone } from "lucide-react";
import { Card, Section, SectionHead, cx } from "./ui";

const P = [
  {
    id: "web", label: "Web freelancers", Icon: Code2,
    title: "Pitch websites to businesses that have none",
    lead: "Every listing without a website is a ready-made project.",
    how: ["Search a business type in your city", "Turn on the “No website” filter", "Export and send your pitch"],
    get: [["No-website", "leads sorted first"], ["Phone", "ready to call"], ["1 day", "to a first pitch"]],
  },
  {
    id: "agency", label: "Marketing agencies", Icon: Megaphone,
    title: "Find local clients who need reviews and SEO",
    lead: "Rating and review counts show which businesses are losing customers online.",
    how: ["Search a niche across a city", "Filter low ratings or weak reviews", "Group by area and pitch a package"],
    get: [["Weak listings", "ranked by rating"], ["Review counts", "to size each pitch"], ["Area split", "for local campaigns"]],
  },
  {
    id: "sales", label: "Sales teams", Icon: Phone,
    title: "Build calling lists in minutes",
    lead: "Skip the research and give reps a clean list to dial.",
    how: ["Search a category and area", "Keep only listings with a phone", "Export CSV and load your dialer"],
    get: [["Call-ready", "list in minutes"], ["Clean", "no duplicate rows"], ["Repeat", "any search from History"]],
  },
  {
    id: "research", label: "Market researchers", Icon: BarChart3,
    title: "Map a local market at a glance",
    lead: "Compare competitors by category, rating and neighbourhood.",
    how: ["Search a category in several areas", "Open a rating and area split", "Export for analysis"],
    get: [["Rating spread", "across the market"], ["Category mix", "in one chart"], ["Raw data", "for your own models"]],
  },
] as const;

export function UseCases() {
  const [i, setI] = React.useState(0);
  const a = P[i];
  return (
    <Section id="use-cases">
      <SectionHead title="Built for people who sell to local businesses" sub="Pick your role to see how to use GMB Scraper and what you get." />
      <div role="tablist" aria-label="Roles" className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {P.map(({ id, label, Icon }, idx) => (
          <button key={id} id={`uc-tab-${id}`} role="tab" aria-selected={i === idx} aria-controls="uc-panel" type="button" onClick={() => setI(idx)}
            className={cx("flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-400/70",
              i === idx ? "border-orange-500/30 bg-orange-500/10 text-white" : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white")}>
            <span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-black/30"><Icon className="size-4 text-orange-300" aria-hidden /></span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      <div id="uc-panel" role="tabpanel" aria-labelledby={`uc-tab-${a.id}`} className="mt-4">
        <Card pad="p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{a.lead}</p>
              <ul className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">
                {a.get.map(([l, v]) => (
                  <li key={l} className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5"><span className="font-medium text-white">{l}</span> {v}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white/80">How to use it</p>
              <ol className="mt-3 space-y-2.5">
                {a.how.map((s, n) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-white/65">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-orange-500/15 text-[10px] font-semibold text-orange-200">{n + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <a href="#pricing" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-200 outline-none hover:text-white focus-visible:text-white">See pricing <ArrowRight className="size-4" aria-hidden /></a>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}