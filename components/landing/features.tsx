import { Card, Section, SectionHead } from "./ui";
import { IlChart, IlContact, IlExport, IlFields, IlFilter, IlLive } from "./illustrations";
import { Reveal } from "./motion";

const items = [
  { Il: IlFilter, t: "Find hot leads first", d: "Filter by missing website, low rating, review count or open hours, so you only pitch businesses that need you.", w: "s4", wide: true, dir: "left" },
  { Il: IlLive, t: "Watch results arrive", d: "Rows stream into a live table. Pause, resume or stop whenever you like.", w: "s2", dir: "right" },
  { Il: IlFields, t: "Pick your columns", d: "Choose only the fields you need: name, phone, website, rating and more.", w: "s2", dir: "up" },
  { Il: IlExport, t: "Export in one click", d: "Download CSV, Excel or JSON. Files are named by keyword, city and date.", w: "s4", wide: true, dir: "right" },
  { Il: IlContact, t: "Call-ready contacts", d: "Open any business to see its phone, address and Maps link, with one-click copy.", w: "s3", wide: true, dir: "left" },
  { Il: IlChart, t: "See the market", d: "Charts show rating spread, categories and which areas have the most leads.", w: "s3", wide: true, dir: "up" },
] as const;

export function Features() {
  return (
    <Section id="features" glow className="pt-12 sm:pt-14">
      <Reveal>
        <SectionHead title="Everything you need to win local clients" sub="From the first search to the last follow-up, in one calm dashboard." />
        <div className="bento mt-10">
          {items.map(({ Il, t, d, w, dir, ...x }) => (
            <div key={t} data-reveal data-dir={dir} className={w}>
              <Card pad="" className="h-full">
                <div className={`feat ${"wide" in x ? "feat-wide" : ""}`}>
                  <Il />
                  <div className="feat-body p-6"><h3 className="text-lg font-semibold">{t}</h3><p className="mt-2 text-[15px] leading-relaxed text-white/55">{d}</p></div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}