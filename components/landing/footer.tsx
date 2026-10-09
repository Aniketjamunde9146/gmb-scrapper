import { ArrowUpRight } from "lucide-react";
import { GlowButton, Logo } from "./ui";
import { site } from "./site";

const cols = [
  ["Product", [["Features", "/#features"], ["How it works", "/#how-it-works"], ["Who it's for", "/#use-cases"], ["Pricing", "/#pricing"], ["FAQ", "/#faq"]]],
  ["Account", [["Log in", "/login"], ["Create account", "/signup"], ["Dashboard", "/dashboard"]]],
  ["Company", [["Contact", `mailto:${site.email}`], ["Privacy Policy", "/privacy"], ["Terms of Use", "/terms"]]],
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black text-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-48 w-[60rem] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,122,0,.14),transparent_70%)]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-10 pt-12 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div>
          <a href="/" aria-label={`${site.name} home`}><Logo /></a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">Find local businesses on Google Maps, spot the ones that need you, and export clean leads.</p>
          <div className="mt-5"><GlowButton href="/signup">Start free <ArrowUpRight className="size-4" aria-hidden /></GlowButton></div>
          <p className="mt-3 text-xs text-white/40">3 free searches. No card needed.</p>
        </div>
        {cols.map(([h, links]) => (
          <nav key={h} aria-label={h}>
            <h3 className="text-sm font-semibold">{h}</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-white/55">
              {links.map(([l, href]) => <li key={l}><a className="transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none" href={href}>{l}</a></li>)}
            </ul>
          </nav>
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 border-t border-white/10 px-4 py-5 text-xs text-white/40 sm:flex-row">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Use scraped data responsibly and follow local outreach laws.</p>
      </div>

      <div aria-hidden className="pointer-events-none select-none px-4">
        <div className="footer-wordmark mx-auto max-w-6xl text-center font-bold tracking-[-0.05em]">GMBSCRAPER</div>
      </div>
    </footer>
  );
}