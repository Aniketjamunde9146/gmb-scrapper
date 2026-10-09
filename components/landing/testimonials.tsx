import { Card, Section, SectionHead } from "./ui";
import { Reveal } from "./motion";

type A = { bg: string; skin: string; hair: string; shirt: string; style: "short" | "long" | "bun" | "bald" };
function Avatar({ bg, skin, hair, shirt, style }: A) {
  return (
    <svg viewBox="0 0 48 48" className="size-11 shrink-0 rounded-full" aria-hidden>
      <rect width="48" height="48" fill={bg} />
      {style === "long" && <path d="M12 26c0-13 5-18 12-18s12 5 12 18v14H12z" fill={hair} />}
      <path d="M7 48c0-10 7-15 17-15s17 5 17 15z" fill={shirt} />
      <rect x="21" y="27" width="6" height="8" fill={skin} />
      <circle cx="24" cy="22" r="9" fill={skin} />
      {style !== "bald" && <path d="M14.5 22c-.5-9 4.5-13 9.5-13s10 4 9.5 13c-3-4-6-5.5-9.5-5.5S17.500 18 14.500 22z" fill={hair} />}
      {style === "bun" && <circle cx="24" cy="8" r="4.5" fill={hair} />}
    </svg>
  );
}

const rows: { q: string; n: string; r: string; a: A }[][] = [
  [
    { q: "I booked three website projects in my first week. All three came from the no-website filter.", n: "Aarav Mehta", r: "Freelance web developer, Pune", a: { bg: "#3b2a14", skin: "#c68b59", hair: "#1a1410", shirt: "#ff8c00", style: "short" } },
    { q: "We used to copy listings by hand. Now a full city list is ready before our morning call.", n: "Neha Kulkarni", r: "Founder, local SEO agency", a: { bg: "#2a2a2a", skin: "#e0a77b", hair: "#2b1a12", shirt: "#e5e5e5", style: "long" } },
    { q: "The rating filter lets my team skip dead ends and call the owners who actually need help.", n: "Rohan Iyer", r: "Sales lead, Bengaluru", a: { bg: "#1f2a3b", skin: "#a9744a", hair: "#0f0f0f", shirt: "#4b5563", style: "short" } },
    { q: "Exports are clean. I open the CSV and start dialing, no formatting needed.", n: "Sara Thomas", r: "Outbound consultant, Kochi", a: { bg: "#3a1f1f", skin: "#d9a074", hair: "#4a2a17", shirt: "#ffb347", style: "bun" } },
    { q: "I use it to map how many clinics in each suburb still have no site. Great for pitching.", n: "Dev Patel", r: "Growth marketer, Ahmedabad", a: { bg: "#23301f", skin: "#b9814f", hair: "#111", shirt: "#fff", style: "bald" } },
  ],
  [
    { q: "Setting up a search took under a minute, and the live progress meant I could keep working.", n: "Priya Nair", r: "Agency owner, Chennai", a: { bg: "#2b2140", skin: "#c98f62", hair: "#171212", shirt: "#ff7a00", style: "long" } },
    { q: "Switched from a manual workflow and saved a full day each week on prospecting.", n: "Kabir Shah", r: "Account executive, Mumbai", a: { bg: "#1c2d2d", skin: "#d6a27a", hair: "#2a1b10", shirt: "#374151", style: "short" } },
    { q: "Choosing only the columns I need keeps the sheet tidy for my team.", n: "Ananya Rao", r: "Ops manager, Hyderabad", a: { bg: "#3a2a1a", skin: "#bf8658", hair: "#1c1410", shirt: "#f5f5f5", style: "bun" } },
    { q: "Handy for competitor research. I compare ratings and review counts across areas in minutes.", n: "Vikram Joshi", r: "Market researcher, Delhi", a: { bg: "#202734", skin: "#a8734a", hair: "#222", shirt: "#ffc46b", style: "short" } },
    { q: "Simple and fast. The free searches were enough to prove it works before I paid.", n: "Meera Desai", r: "Freelance designer, Surat", a: { bg: "#331f2b", skin: "#dba883", hair: "#3b2418", shirt: "#ff8c00", style: "long" } },
  ],
];

function Row({ items, reverse, dir }: { items: (typeof rows)[number]; reverse?: boolean; dir: string }) {
  const list = [...items, ...items];
  return (
    <div data-reveal data-dir={dir} className="mq-wrap">
      <div className={`mq ${reverse ? "mq-rev" : ""}`}>
        {list.map((x, i) => (
          <Card key={i} aria-hidden={i >= items.length || undefined} className="w-[320px] shrink-0 sm:w-[380px]">
            <p className="flex-1 text-[15px] leading-relaxed text-white/80">“{x.q}”</p>
            <div className="mt-5 flex items-center gap-3">
              <Avatar {...x.a} />
              <div><p className="text-sm font-medium">{x.n}</p><p className="text-xs text-white/45">{x.r}</p></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-10 sm:py-14">
      <Reveal>
        <Section className="py-0"><SectionHead title="Loved by people who prospect every day" sub="Freelancers, agencies and sales teams use GMB Scraper to fill their pipeline." /></Section>
        <div className="mt-10 flex flex-col gap-4">
          <Row items={rows[0]} reverse dir="left" />
          <Row items={rows[1]} dir="right" />
        </div>
      </Reveal>
    </section>
  );
}