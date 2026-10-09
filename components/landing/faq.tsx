"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import { Card, GlowButton, Section, SectionHead, cx } from "./ui";
import { site } from "./site";
import { IlFaq } from "./illustrations";
import { Reveal, gsap, reduced } from "./motion";
import { faqs as shared } from "../../lib/faqs";

const faqs: [string, string][] = shared.map((f) => [f.q, f.a]);

function Item({ q, a, open, toggle }: { q: string; a: string; open: boolean; toggle: () => void }) {
  const el = React.useRef<HTMLDivElement>(null);
  const first = React.useRef(true);
  React.useEffect(() => {
    if (!el.current) return;
    if (first.current || reduced()) { first.current = false; el.current.style.height = open ? "auto" : "0px"; return; }
    gsap.to(el.current, { height: open ? "auto" : 0, duration: 0.4, ease: "power3.out" });
  }, [open]);
  return (
    <Card hot={open} pad="">
      <button type="button" aria-expanded={open} onClick={toggle} className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium outline-none focus-visible:text-orange-300">
        <h3 className="text-base font-medium">{q}</h3>
        <Plus className={cx("size-5 shrink-0 text-orange-400 transition-transform duration-300", open && "rotate-45")} aria-hidden />
      </button>
      <div ref={el} style={{ height: 0 }} className="overflow-hidden"><p className="px-5 pb-5 leading-relaxed text-white/55">{a}</p></div>
    </Card>
  );
}

export function Faq() {
  const [open, setOpen] = React.useState<string | null>(faqs[0][0]);
  return (
    <Section id="faq" glow>
      <Reveal>
      <SectionHead title="Questions and answers" sub="Everything people ask before their first search." />
      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div data-reveal data-dir="left" className="lg:sticky lg:top-24">
          <Card pad="">
            <IlFaq />
            <div className="p-6">
              <h3 className="text-lg font-semibold">Still have questions?</h3>
              <p className="mt-2 text-[15px] text-white/55">Send us a message and we will reply within one working day.</p>
              <div className="mt-5"><GlowButton href={`mailto:${site.email}`}>Contact us</GlowButton></div>
            </div>
          </Card>
        </div>
        <div data-reveal data-dir="right">
          <div className="flex flex-col gap-3">
            {faqs.map(([q, a]) => <Item key={q} q={q} a={a} open={open === q} toggle={() => setOpen(open === q ? null : q)} />)}
          </div>
        </div>
      </div>
      </Reveal>
    </Section>
  );
}