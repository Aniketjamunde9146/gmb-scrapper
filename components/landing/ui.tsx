import * as React from "react";
import { MapPin } from "lucide-react";
import { site } from "./site";
import "./landing.css";

export const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");

/** Card with the hover-border-gradient edge: a saffron light travels around the border. */
export function Card({ children, className, hot, pad = "p-6" }: { children: React.ReactNode; className?: string; hot?: boolean; pad?: string }) {
  return (
    <div className={cx("gb", hot && "gb-hot", className)}>
      <div className={cx("gb-in", pad)}>{children}</div>
    </div>
  );
}

/** Pill button with the same animated border. `full` stretches it to the container width. */
export function GlowButton({ href = "#", children, className, full }: { href?: string; children: React.ReactNode; className?: string; full?: boolean }) {
  return (
    <a href={href} className={cx("gbtn outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70", full && "gbtn-full", className)}>
      <span className="gbtn-in">{children}</span>
    </a>
  );
}

export function Section({ id, children, className, glow }: { id?: string; children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <section id={id} className={cx("relative isolate mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-10 sm:py-14", className)}>
      {glow && <div aria-hidden className="amb" />}
      {children}
    </section>
  );
}

export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div data-reveal data-dir="down" className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-[1.1]" style={{ background: "linear-gradient(to bottom,var(--color-white) 40%,rgb(var(--ink) / .6))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {title}
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/55 sm:text-[17px]">{sub}</p>}
    </div>
  );
}

export function Btn({ variant = "light", href = "#", children, className }: { variant?: "light" | "dark"; href?: string; children: React.ReactNode; className?: string }) {
  const v = variant === "light" ? "bg-gradient-to-b from-white to-white/70 text-black hover:brightness-95" : "border border-white/10 bg-white/[0.07] text-white hover:bg-white/[0.12]";
  return (
    <a href={href} className={cx("inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm font-medium outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-400/70", v, className)}>
      {children}
    </a>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("flex items-center gap-2 font-semibold", className)}>
      <span className="grid size-6 place-items-center rounded-md bg-gradient-to-b from-orange-400 to-orange-600 text-black"><MapPin className="size-3.5" aria-hidden /></span>
      {site.name}
    </span>
  );
}