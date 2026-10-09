import { scoreLead } from "./score";
import { STATUSES, type SavedLead, type Status } from "./types";
import type { SearchRec } from "./db";

const TZ = "Asia/Kolkata";
const weekday = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d);

export type Insights = {
  totals: { searches: number; leads: number; noWebsite: number; withPhone: number; saved: number; hotSaved: number; won: number; winRate: number };
  rating: { label: string; n: number }[];
  categories: { label: string; n: number }[];
  niches: { label: string; n: number }[];
  cities: { label: string; n: number }[];
  weekdays: { label: string; n: number }[];
  funnel: { status: Status; n: number; pct: number }[];
  actions: { title: string; body: string; href: string; cta: string }[];
};

const top = (m: Map<string, number>, n = 6) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, n]) => ({ label, n }));
const bump = (m: Map<string, number>, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by);

export function buildInsights(searches: SearchRec[], saved: SavedLead[]): Insights {
  const leads = searches.reduce((n, s) => n + s.total, 0);
  const noWebsite = searches.reduce((n, s) => n + s.noWebsite, 0);
  const withPhone = searches.reduce((n, s) => n + s.withPhone, 0);

  const buckets = [["Under 3", 0], ["3 to 3.5", 0], ["3.5 to 4", 0], ["4 to 4.5", 0], ["4.5 and up", 0]] as [string, number][];
  const cats = new Map<string, number>();
  let hotSaved = 0;
  for (const s of saved) {
    const r = s.lead.rating;
    if (r != null) buckets[r < 3 ? 0 : r < 3.5 ? 1 : r < 4 ? 2 : r < 4.5 ? 3 : 4][1]++;
    if (s.lead.category) bump(cats, s.lead.category);
    if (scoreLead(s.lead).tier === "hot") hotSaved++;
  }

  const niches = new Map<string, number>();
  const cities = new Map<string, number>();
  const days = new Map<string, number>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => [d, 0]));
  for (const s of searches) {
    bump(niches, s.q.trim().toLowerCase(), s.total);
    bump(cities, s.city.trim().toLowerCase(), s.total);
    bump(days, weekday(new Date(s.at)));
  }

  const counts = Object.fromEntries(STATUSES.map((st) => [st, saved.filter((x) => x.status === st).length])) as Record<Status, number>;
  const reached = counts.contacted + counts.interested + counts.won + counts.lost;
  const funnelBase = [counts.new + reached, reached - counts.lost, counts.interested + counts.won, counts.won];
  const funnel = (["new", "contacted", "interested", "won"] as const).map((status, i) => ({ status, n: Math.max(0, funnelBase[i]), pct: funnelBase[0] ? Math.round((Math.max(0, funnelBase[i]) / funnelBase[0]) * 100) : 0 }));
  const winRate = reached ? Math.round((counts.won / reached) * 100) : 0;

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  const overdue = saved.filter((s) => s.followUp && s.followUp < today && s.status !== "won" && s.status !== "lost").length;
  const untouched = counts.new;

  const actions: Insights["actions"] = [];
  if (overdue) actions.push({ title: `${overdue} follow-up${overdue > 1 ? "s are" : " is"} overdue`, body: "Leads go cold fast. Message them today.", href: "/dashboard/saved?due=1", cta: "Open follow-ups" });
  if (untouched >= 3) actions.push({ title: `${untouched} saved leads are untouched`, body: "Pick the hot ones and send your first message.", href: "/dashboard/saved", cta: "Open saved leads" });
  if (leads > 0 && noWebsite / leads >= 0.25) actions.push({ title: `${Math.round((noWebsite / leads) * 100)}% of your leads have no website`, body: "That is a ready-made web design pitch. Use the website template.", href: "/dashboard/templates", cta: "Open templates" });
  if (!saved.length && searches.length) actions.push({ title: "Save your best leads", body: "Tap the bookmark on a lead to track it from New to Won.", href: "/dashboard/search", cta: "Search leads" });
  if (!searches.length) actions.push({ title: "Run your first search", body: "Try a business type in your city.", href: "/dashboard/search", cta: "Search leads" });

  return {
    totals: { searches: searches.length, leads, noWebsite, withPhone, saved: saved.length, hotSaved, won: counts.won, winRate },
    rating: buckets.map(([label, n]) => ({ label, n })),
    categories: top(cats),
    niches: top(niches),
    cities: top(cities),
    weekdays: [...days.entries()].map(([label, n]) => ({ label, n })),
    funnel,
    actions: actions.slice(0, 3),
  };
}
