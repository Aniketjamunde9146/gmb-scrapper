import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Globe2, MapPin, Percent, Search, Store, Trophy } from "lucide-react";
import { EmptyState } from "../../../components/dashboard/empty-state";
import { PageHeader, PanelTitle, ScenePanel } from "../../../components/dashboard/page-header";
import { IlFunnel, IlInsights, IlScore } from "../../../components/landing/illustrations";
import { buttonVariants } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { requireSession } from "../../../lib/auth";
import { listSaved, listSearches } from "../../../lib/db";
import { buildInsights } from "../../../lib/insights";
import { STATUS_LABEL } from "../../../lib/types";
import { cn } from "../../../lib/utils";

export const metadata: Metadata = { title: "Insights" };
export const dynamic = "force-dynamic";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

function Bars({ rows, empty }: { rows: { label: string; n: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.some((r) => r.n > 0)) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="truncate capitalize text-muted-foreground">{r.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300" style={{ width: `${(r.n / max) * 100}%` }} /></span>
          <span className="text-right font-medium tabular-nums">{fmt(r.n)}</span>
        </li>
      ))}
    </ul>
  );
}

function Donut({ pct, label }: { pct: number; label: string }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-32 shrink-0 place-items-center" role="img" aria-label={`${pct}% ${label}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="11" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ff8c00" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <div className="text-center"><p className="text-2xl font-semibold tabular-nums">{pct}%</p></div>
    </div>
  );
}

export default async function InsightsPage() {
  const session = await requireSession("/dashboard/insights");
  const [searches, saved] = await Promise.all([listSearches(session.uid, 2000).catch(() => []), listSaved(session.uid).catch(() => [])]);
  const i = buildInsights(searches, saved);
  const t = i.totals;
  const noSitePct = t.leads ? Math.round((t.noWebsite / t.leads) * 100) : 0;
  const phonePct = t.leads ? Math.round((t.withPhone / t.leads) * 100) : 0;

  if (!t.searches) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Insights" sub="See which cities, niches and lead types are working for you." art={<IlInsights />} />
        <EmptyState art={<IlInsights />} title="Insights appear after your first search" body="Run a few searches and save some leads. This page then shows where your best leads are and how your pipeline converts." action={<Link href="/dashboard/search" className={buttonVariants()}>Search leads</Link>} />
      </div>
    );
  }

  const kpis = [
    { l: "Searches", v: fmt(t.searches), icon: Search },
    { l: "Leads found", v: fmt(t.leads), icon: Store },
    { l: "Hot leads saved", v: fmt(t.hotSaved), icon: BarChart3 },
    { l: "Win rate", v: `${t.winRate}%`, icon: Trophy },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Insights" sub="Where your best leads are, how good they are, and how many turn into clients." art={<IlInsights />} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(({ l, v, icon: Icon }) => (
          <Card key={l} className="p-4"><div className="flex items-center justify-between text-sm text-muted-foreground">{l}<span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" aria-hidden /></span></div><p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{v}</p></Card>
        ))}
      </div>

      {i.actions.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          {i.actions.map((a) => (
            <Card key={a.title} hot className="flex flex-col p-5"><p className="font-semibold">{a.title}</p><p className="mt-1.5 flex-1 text-sm text-muted-foreground">{a.body}</p><Link href={a.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">{a.cta} <ArrowRight className="size-3.5" aria-hidden /></Link></Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><ScenePanel art={<IlScore />} title="Lead quality across your searches" body="How many of the businesses you found are easy to pitch and easy to reach.">
          <div className="mt-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4"><Donut pct={noSitePct} label="have no website" /><p className="max-w-[9rem] text-sm text-muted-foreground"><Globe2 className="mb-1 size-4 text-primary" aria-hidden />have no website</p></div>
            <div className="flex items-center gap-4"><Donut pct={phonePct} label="have a phone number" /><p className="max-w-[9rem] text-sm text-muted-foreground"><Percent className="mb-1 size-4 text-primary" aria-hidden />have a phone number</p></div>
          </div>
        </ScenePanel></Card>

        <Card><ScenePanel art={<IlFunnel />} title="Your pipeline" body="Of the leads you saved, how many moved forward.">
          <ul className="mt-5 flex flex-col gap-2.5">
            {i.funnel.map((f) => (
              <li key={f.status} className="grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-3 text-sm">
                <span className="text-muted-foreground">{f.status === "new" ? "Saved" : STATUS_LABEL[f.status]}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full", f.status === "won" ? "bg-emerald-500" : "bg-gradient-to-r from-orange-500 to-amber-300")} style={{ width: `${f.pct}%` }} /></span>
                <span className="text-right font-medium tabular-nums">{f.n} · {f.pct}%</span>
              </li>
            ))}
          </ul>
        </ScenePanel></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5"><PanelTitle icon={MapPin} title="Cities with the most leads" hint="Leads found per city" /><Bars rows={i.cities} empty="Search a few cities to compare them." /></Card>
        <Card className="p-5"><PanelTitle icon={Store} title="Business types you search most" hint="Leads found per type" /><Bars rows={i.niches} empty="Search a few business types to compare them." /></Card>
        <Card className="p-5"><PanelTitle icon={BarChart3} title="Ratings of your saved leads" hint="Lower ratings mean more room for a reputation pitch" /><Bars rows={i.rating} empty="Save some leads to see their ratings." /></Card>
        <Card className="p-5"><PanelTitle icon={Search} title="When you search" hint="Searches by day of the week" /><Bars rows={i.weekdays} empty="Your search days appear here." /></Card>
      </div>
      {i.categories.length > 0 && <Card className="p-5"><PanelTitle icon={Store} title="Categories in your saved leads" hint="What kind of businesses you keep" /><Bars rows={i.categories} empty="" /></Card>}
    </div>
  );
}
