import { ArrowRight } from "lucide-react";
import { BloomField } from "./bloom-field";
import { Btn, GlowButton, Section } from "./ui";
import { Reveal } from "./motion";

export function Cta() {
  return (
    <Section className="pb-12 pt-4">
      <Reveal dir="scale">
        <div data-reveal className="lm-dark relative overflow-hidden rounded-[2rem] text-white border border-white/15 px-6 py-14 text-center shadow-[0_0_120px_-40px_rgba(255,140,0,.6)] sm:py-20">
          <BloomField className="absolute inset-0" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl" style={{ textShadow: "0 2px 30px rgba(0,0,0,.45)" }}>Your next customer is already on the map.</h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/90" style={{ textShadow: "0 1px 20px rgba(0,0,0,.5)" }}>Create a free account and run your first search in under a minute.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <GlowButton href="/signup">Get started <ArrowRight className="size-4" aria-hidden /></GlowButton>
              <Btn variant="dark" href="/login">Log in</Btn>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}