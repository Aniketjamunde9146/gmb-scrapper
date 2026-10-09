import type { Metadata } from "next";
import { BloomField } from "../components/landing/bloom-field";
import { Cta } from "../components/landing/cta";
import { Faq } from "../components/landing/faq";
import { Features } from "../components/landing/features";
import { Footer } from "../components/landing/footer";
import { Hero } from "../components/landing/hero";
import { HowItWorks } from "../components/landing/how-it-works";
import { Pricing } from "../components/landing/pricing";
import { SiteHeader } from "../components/landing/site-header";
import { Stats } from "../components/landing/stats";
import { Testimonials } from "../components/landing/testimonials";
import { UseCases } from "../components/landing/use-cases";
import { JsonLd } from "../components/seo/json-ld";
import { site } from "../lib/site";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="lm-root relative min-h-screen overflow-hidden bg-black text-white">
      <JsonLd />
      <BloomField />
      <SiteHeader />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <UseCases />
      <Testimonials />
      <Pricing />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}
