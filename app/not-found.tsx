import type { Metadata } from "next";
import { IlSearch } from "../components/landing/illustrations";
import Link from "next/link";
import { ArrowRight, Home, LayoutDashboard } from "lucide-react";
import { Logo } from "../components/logo";
import { ThemeToggle } from "../components/theme-toggle";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <div className="hero-bg flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="main" className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <div className="lm-root w-64 overflow-hidden rounded-2xl border sm:w-80"><IlSearch /></div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">This page is not on the map.</h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">The link may be old or mistyped. Head back home or jump straight into a lead search.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            <Home /> Back to home
          </Link>
          <Link href="/dashboard/search" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            <LayoutDashboard /> Search leads <ArrowRight />
          </Link>
        </div>
      </main>
    </div>
  );
}
