"use client";
import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };
export const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export type Dir = "up" | "down" | "left" | "right" | "scale";
const FROM: Record<Dir, gsap.TweenVars> = { up: { y: 48 }, down: { y: -40 }, left: { x: -80 }, right: { x: 80 }, scale: { scale: 0.93, y: 30 } };

/**
 * Blur-reveal on scroll. Children marked data-reveal fly in from `dir`
 * (override per child with data-dir="left|right|up|down|scale"). Each one triggers as it enters view.
 */
export function Reveal({ dir = "up", stagger = 0.1, className, children, id }: { dir?: Dir; stagger?: number; className?: string; children: React.ReactNode; id?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || reduced()) return;
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-reveal]"));
      els.forEach((el) => gsap.set(el, { opacity: 0, filter: "blur(14px)", ...FROM[(el.dataset.dir as Dir) || dir] }));
      ScrollTrigger.batch(els, {
        start: "top 92%", once: true,
        onEnter: (batch) => batch.forEach((el, i) => gsap.to(el, { opacity: 1, filter: "blur(0px)", x: 0, y: 0, scale: 1, duration: 1.1, ease: "power3.out", delay: i * stagger, clearProps: "filter,transform" })),
      });
    }, root);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => { window.removeEventListener("load", refresh); ctx.revert(); };
  }, [dir, stagger]);
  return <div ref={ref} id={id} className={className}>{children}</div>;
}