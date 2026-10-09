"use client";
import * as React from "react";

/* Bloom Field: layered radial-gradient mesh, driven by rAF. Every modulation is 0 at ph = 0. */
const BLOBS = [
  { x: 63.62, y: 46.83, r: 48.1, c: "202,147,65" },
  { x: 28.82, y: 68.21, r: 62.1, c: "255,140,0" },
  { x: 49.75, y: 12.34, r: 69.8, c: "225,194,15" },
  { x: 76.39, y: 82.17, r: 83.1, c: "0,0,0" },
];
const SEED = 664306262;
const phase = (i: number, k: number) => { const s = Math.sin(SEED * 0.001 * (i + 1) * (k + 1.7)) * 10000; return (s - Math.floor(s)) * Math.PI * 2; };
const PH = BLOBS.map((_, i) => [phase(i, 0), phase(i, 1)]);

function paint(el: HTMLElement, t: number) {
  const ph = t * 0.23, amt = 0.19;
  el.style.backgroundImage = BLOBS.map((b, i) => {
    const [p, p2] = PH[i];
    const x = b.x + (Math.sin(ph * 0.55 + p) - Math.sin(p)) * 14 * amt;
    const y = b.y + (Math.sin(ph * 0.43 + p2) - Math.sin(p2)) * 14 * amt;
    const stops = [1, 0.844, 0.5, 0.156, 0].map((a, k) => `rgba(${b.c},${a}) ${((b.r * k) / 4).toFixed(2)}%`).join(",");
    return `radial-gradient(circle at ${x}% ${y}%,${stops})`;
  }).join(",");
}

export function BloomField({ className = "" }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    paint(el, 0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = 0;
    const t0 = performance.now();
    // ~30fps is enough for a slow ambient mesh and halves the repaint cost
    const loop = (now: number) => {
      if (now - last > 33) { last = now; paint(el, (now - t0) / 1000); }
      raf = requestAnimationFrame(loop);
    };
    // only animate while on screen
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} aria-hidden className={className} style={{ backgroundColor: "#000" }} />;
}