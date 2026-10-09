"use client";
import * as React from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Btn, GlowButton, Logo, cx } from "./ui";

const links = [["Features", "features"], ["How it works", "how-it-works"], ["Who it's for", "use-cases"], ["Pricing", "pricing"], ["FAQ", "faq"]] as const;

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [active, setActive] = React.useState("");

  // scrolled state + clear the active link near the top
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      if (y < 200) setActive("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // highlight the section currently in the middle of the screen
  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    links.forEach(([, id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  // close the mobile menu on Escape or when the screen grows to desktop
  React.useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const grow = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", key);
    mq.addEventListener("change", grow);
    return () => { window.removeEventListener("keydown", key); mq.removeEventListener("change", grow); };
  }, [open]);

  return (
    <header className="lm-root pointer-events-none fixed inset-x-0 top-3 z-50 px-3 text-white sm:top-4 sm:px-5">
      <div className={cx(
        "pointer-events-auto relative mx-auto w-full max-w-5xl rounded-2xl border backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300",
        scrolled ? "border-white/15 bg-black/85 shadow-[0_10px_40px_-10px_rgba(255,122,0,0.3)]" : "border-white/10 bg-black/60 shadow-[0_8px_40px_-12px_rgba(255,122,0,0.18)]",
      )}>
        <nav aria-label="Main" className="flex items-center justify-between px-4 py-2.5">
          <a href="/" aria-label="GMB Scraper home" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"><Logo /></a>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map(([l, id]) => (
              <a key={id} href={`/#${id}`} aria-current={active === id ? "true" : undefined}
                className={cx("relative rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-400/70", active === id ? "text-white" : "text-white/60 hover:text-white")}>
                {l}
                {active === id && <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex"><ThemeToggle /><Btn variant="dark" href="/login">Log in</Btn><GlowButton href="/signup">Sign up</GlowButton></div>

          <div className="flex items-center gap-1 lg:hidden"><ThemeToggle /><button type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu"
            className="grid size-9 place-items-center rounded-lg text-white/80 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-orange-400/70">
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button></div>
        </nav>

        {open && (
          <div id="mobile-menu" className="border-t border-white/10 px-4 pb-4 pt-2 lg:hidden">
            <ul>
              {links.map(([l, id]) => (
                <li key={id} className="border-b border-white/5 last:border-0">
                  <a href={`/#${id}`} onClick={() => setOpen(false)} className={cx("flex items-center justify-between py-3 text-[15px]", active === id ? "text-orange-200" : "text-white/75")}>{l}</a>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2"><Btn variant="dark" href="/login" className="w-full">Log in</Btn><GlowButton full href="/signup">Sign up</GlowButton></div>
          </div>
        )}
      </div>
    </header>
  );
}