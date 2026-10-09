import * as React from "react";
import { Check } from "lucide-react";
import { Logo } from "../logo";
import { ThemeToggle } from "../theme-toggle";
import { IlLogin, IlSignup } from "../landing/illustrations";

const POINTS = {
  login: ["Your saved leads and notes are waiting", "Pick up where your last search stopped", "Follow-ups due today appear first"],
  signup: ["3 free searches, no card needed", "Spot businesses with no website in one filter", "Export clean CSV, Excel or JSON files"],
};

/** Split layout for log in and sign up: the form on one side, a landing-style illustration on the other. */
export function AuthShell({ mode, children }: { mode: "login" | "signup"; children: React.ReactNode }) {
  const signup = mode === "signup";
  return (
    <div className="lm-root dash-canvas flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5"><Logo /><ThemeToggle /></header>
      <main id="main" className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-4 pb-16 lg:grid-cols-2 lg:gap-14">
        <section className="order-2 hidden lg:order-1 lg:block">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight" style={{ background: "linear-gradient(to bottom, var(--foreground) 40%, color-mix(in oklab, var(--foreground) 55%, transparent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {signup ? "Your next customer is already on the map." : "Welcome back to your lead list."}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{signup ? "Create a free account and run your first search in under a minute." : "Log in to see your leads, notes and follow-ups."}</p>
          <div className="gcard mt-8 overflow-hidden rounded-2xl border bg-card">{signup ? <IlSignup /> : <IlLogin />}</div>
          <ul className="mt-6 grid gap-2.5 text-sm text-muted-foreground">
            {POINTS[mode].map((p) => <li key={p} className="flex items-center gap-2.5"><span className="grid size-5 place-items-center rounded-full bg-primary/15 text-primary"><Check className="size-3" aria-hidden /></span>{p}</li>)}
          </ul>
        </section>
        <section className="order-1 mx-auto w-full max-w-md lg:order-2">
          <div className="compact-scenes mb-4 overflow-hidden rounded-2xl border bg-card lg:hidden">{signup ? <IlSignup /> : <IlLogin />}</div>
          <div className="gcard rounded-3xl border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">{children}</div>
        </section>
      </main>
    </div>
  );
}
