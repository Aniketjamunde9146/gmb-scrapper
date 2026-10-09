"use client";
import { Check } from "lucide-react";
import { Btn, Card, GlowButton, Section, SectionHead } from "./ui";
import { Reveal } from "./motion";
import { PACKS, FREE_SEARCHES, inr, perSearch } from "../../lib/billing";

const plans = PACKS.map((k) => ({
  n: k.name,
  p: inr(k.price),
  per: "one time",
  d: `${perSearch(k)} per search`,
  cta: "Start free",
  hot: k.hot,
  pts: [`${k.credits} searches`, "CSV, XLSX and JSON export", "Lead score and best angle", "Credits never expire"],
}));

export function Pricing() {
  return (
    <Section id="pricing" glow>
      <Reveal>
        <SectionHead title="Simple pricing that scales with your outreach" sub={`Start with ${FREE_SEARCHES} free searches. Then pay once for a pack. No subscription, no card to sign up.`} />
        <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.n} data-reveal data-dir="up" className="h-full">
              <Card hot={p.hot} pad="" className="h-full">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white/70">{p.n}</h3>
                    {p.hot && <span className="rounded-full border border-orange-500/40 bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-medium text-orange-200">Best value</span>}
                  </div>
                  <p className="mt-4 text-4xl font-semibold tracking-tight">{p.p}<span className="ml-1 text-sm font-normal text-white/40">{p.per}</span></p>
                  <p className="mt-2 text-sm text-white/50">{p.d}</p>
                </div>
                <ul className="flex-1 space-y-2.5 border-t border-white/10 p-6 text-sm text-white/75">
                  {p.pts.map((x) => <li key={x} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-400" aria-hidden />{x}</li>)}
                </ul>
                <div className="border-t border-white/10 bg-white/[0.02] p-4">
                  {p.hot ? <GlowButton full href="/signup">{p.cta}</GlowButton> : <Btn variant="dark" href="/signup" className="w-full">{p.cta}</Btn>}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}