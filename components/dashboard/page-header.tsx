import * as React from "react";
import { cn } from "../../lib/utils";

const gradientText: React.CSSProperties = {
  background: "linear-gradient(to bottom, var(--foreground) 40%, color-mix(in oklab, var(--foreground) 55%, transparent))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

/** Page title in the landing's gradient heading style, with an illustration that explains the page. */
export function PageHeader({ title, sub, art, actions }: { title: string; sub: string; art?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="lm-root grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-[2.2rem]" style={gradientText}>{title}</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">{sub}</p>
        {actions && <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {art && <div className="compact-scenes hidden w-64 overflow-hidden rounded-2xl border bg-card md:block">{art}</div>}
    </div>
  );
}

/** Heading inside a panel: icon chip, title, optional hint and action. */
export function PanelTitle({ icon: Icon, title, hint, action, className }: { icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; title: string; hint?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="flex items-start gap-3">
        {Icon && <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" aria-hidden /></span>}
        <div><h2 className="text-base font-semibold leading-tight sm:text-lg">{title}</h2>{hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}</div>
      </div>
      {action}
    </div>
  );
}

/** Panel with a small illustration on top (the landing's "feature card" pattern). */
export function ScenePanel({ art, title, body, children, className }: { art: React.ReactNode; title: string; body?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("lm-root", className)}>
      <div className="compact-scenes overflow-hidden rounded-t-2xl">{art}</div>
      <div className="p-5">
        <h3 className="text-base font-semibold">{title}</h3>
        {body && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>}
        {children}
      </div>
    </div>
  );
}
