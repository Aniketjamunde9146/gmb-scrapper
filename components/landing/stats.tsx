"use client";
import * as React from "react";
import { Section } from "./ui";
import { Reveal, ScrollTrigger, gsap, reduced } from "./motion";

const S: [number, string, string, number][] = [[2.4, "M", "businesses indexed", 1], [38, "%", "of local listings have no website", 0], [3, " min", "from signup to first export", 0], [190, "+", "countries supported", 0]];

export function Stats() {
  const root = React.useRef<HTMLDListElement>(null);
  React.useEffect(() => {
    if (reduced() || !root.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: "top 92%", once: true, onEnter: () => {
        root.current!.querySelectorAll<HTMLElement>("[data-n]").forEach((el) => {
          const to = Number(el.dataset.n), d = Number(el.dataset.d), o = { v: 0 };
          gsap.to(o, { v: to, duration: 1.8, ease: "power2.out", onUpdate: () => (el.textContent = o.v.toFixed(d)) });
        });
      } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <Section className="relative z-10 -mt-24 py-0 sm:-mt-28">
      <Reveal dir="up">
        <dl ref={root} data-reveal className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur lg:grid-cols-4">
          {S.map(([n, u, l, d], i) => (
            <div key={l} className={`px-4 py-8 text-center ${i > 0 ? "lg:border-l lg:border-white/10" : ""} ${i % 2 ? "border-l border-white/10 lg:border-l" : ""} ${i > 1 ? "border-t border-white/10 lg:border-t-0" : ""}`}>
              <dd className="text-4xl font-semibold tracking-tight text-orange-300 sm:text-5xl" style={{ textShadow: "0 0 40px rgba(255,140,0,.45)" }}><span data-n={n} data-d={d}>{n.toFixed(d)}</span>{u}</dd>
              <dt className="mt-2 text-sm text-white/50">{l}</dt>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
