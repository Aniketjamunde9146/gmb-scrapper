"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Flame, LayoutGrid, MapPin, Rows3, Search, Store, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { LeadCardSkeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import { LeadCard, ScoreRing } from "./lead-card";
import { OutreachSheet } from "./outreach-sheet";
import { ShowMore, usePaged } from "./show-more";
import { ExportMenu } from "./export-menu";
import { EmptyState } from "./empty-state";
import { exportLeads, type Format } from "./export";
import { IlFilter, IlScore, IlSearch } from "../landing/illustrations";
import { cn } from "../../lib/utils";
import { loadPrefs, savePrefs } from "../../lib/prefs";
import { scoreLead } from "../../lib/score";
import { niches } from "../../lib/site";
import type { Lead, SavedLead, Status } from "../../lib/types";

type Result = { leads: Lead[]; area: string; source: "google" | "osm"; balance?: { freeLeft: number; credits: number } };
type State = { status: "idle" | "loading" | "done" | "error"; data?: Result; error?: string };
type Filter = "all" | "hot" | "phone" | "nosite" | "email" | "lowrating";
type Sort = "score" | "rating" | "reviews" | "name";
type View = "cards" | "table";

async function loadLeads(q: string, city: string, signal?: AbortSignal): Promise<Result> {
  const res = await fetch(`/api/leads?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}`, { signal });
  if (res.status === 401) {
    window.location.href = `/login?next=${encodeURIComponent(`/dashboard/search?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}`)}`;
    throw new Error("Redirecting to login…");
  }
  const json = await res.json();
  if (res.status === 402) {
    window.location.href = "/dashboard/billing?need=1";
    throw new Error("Out of searches. Opening credit packs…");
  }
  if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  if (json.balance) window.dispatchEvent(new CustomEvent("gmb:balance", { detail: json.balance }));
  return json as Result;
}

const STEPS = ["Finding businesses on the map", "Checking websites and phone numbers", "Scoring every lead"];

/** Shows what is happening during the wait, so a 20 second search never looks stuck. */
function SearchProgress({ q, city }: { q: string; city: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col gap-5" aria-live="polite">
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-semibold"><Spinner /> Searching {q} in {city}</p>
          <p className="mt-1 text-sm text-muted-foreground">This can take up to 20 seconds.</p>
        </div>
        <ol className="grid gap-1.5 text-sm">
          {STEPS.map((s, n) => (
            <li key={s} className={cn("flex items-center gap-2", n > i && "text-muted-foreground/60")}>
              {n < i ? <Check className="size-4 text-emerald-500" aria-hidden /> : n === i ? <Spinner className="size-3.5" /> : <span className="size-4 rounded-full border" aria-hidden />}
              {s}
            </li>
          ))}
        </ol>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 6 }).map((_, n) => <LeadCardSkeleton key={n} />)}</div>
    </div>
  );
}

const chip = (on: boolean) => cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors", on ? "border-primary bg-primary/10 font-semibold text-primary" : "bg-card/60 text-muted-foreground hover:bg-accent");

export function LeadsView({ initialQ, initialCity }: { initialQ: string; initialCity: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [city, setCity] = useState(initialCity);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("score");
  const [view, setView] = useState<View>("cards");
  const [saved, setSaved] = useState<Map<string, Status>>(new Map());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [composeFor, setComposeFor] = useState<Lead | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [recent, setRecent] = useState<{ q: string; city: string }[]>([]);
  const [state, setState] = useState<State>({ status: initialQ && initialCity ? "loading" : "idle" });

  // Restore the view and sort you used last, and prefill your default city.
  useEffect(() => {
    const p = loadPrefs();
    if (p.view) setView(p.view);
    if (p.sort) setSort(p.sort as Sort);
    if (!initialCity && p.city) setCity(p.city);
    if (!initialQ && p.niche) setQ(p.niche);
  }, [initialCity, initialQ]);

  useEffect(() => {
    if (!initialQ || !initialCity) return;
    const ctrl = new AbortController();
    loadLeads(initialQ, initialCity, ctrl.signal)
      .then((data) => setState({ status: "done", data }))
      .catch((e: Error) => { if (e.name !== "AbortError") setState({ status: "error", error: e.message }); });
    return () => ctrl.abort();
  }, [initialQ, initialCity]);

  useEffect(() => {
    fetch("/api/saved").then((r) => (r.ok ? r.json() : { saved: [] })).then((j: { saved: SavedLead[] }) => setSaved(new Map(j.saved.map((s) => [s.lead.id, s.status])))).catch(() => {});
    fetch("/api/history").then((r) => (r.ok ? r.json() : { searches: [] })).then((j: { searches?: { q: string; city: string }[] }) => {
      const seen = new Set<string>();
      setRecent((j.searches ?? []).filter((s) => { const k = `${s.q}|${s.city}`.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5));
    }).catch(() => {});
  }, []);

  function go(nq: string, ncity: string) {
    if (!nq.trim() || !ncity.trim()) return;
    savePrefs({ city: ncity.trim() });
    router.replace(`/dashboard/search?q=${encodeURIComponent(nq.trim())}&city=${encodeURIComponent(ncity.trim())}`);
  }
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); go(q, city); };

  const post = (lead: Lead) => fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead }) });
  const setStatus = (id: string, status: Status) => fetch("/api/saved", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });

  async function toggleSave(lead: Lead) {
    const was = saved.has(lead.id);
    setSaved((prev) => { const n = new Map(prev); if (was) n.delete(lead.id); else n.set(lead.id, "new"); return n; });
    try {
      const res = was ? await fetch(`/api/saved?id=${encodeURIComponent(lead.id)}`, { method: "DELETE" }) : await post(lead);
      if (!res.ok) throw new Error();
    } catch {
      setSaved((prev) => { const n = new Map(prev); if (was) n.set(lead.id, "new"); else n.delete(lead.id); return n; });
    }
  }

  /** After you send a message, keep the lead and move it to Contacted so your pipeline stays honest. */
  const markContacted = useCallback(async (lead: Lead) => {
    const current = saved.get(lead.id);
    if (current && current !== "new") return;
    setSaved((prev) => new Map(prev).set(lead.id, "contacted"));
    try {
      if (!current) await post(lead);
      await setStatus(lead.id, "contacted");
    } catch {}
  }, [saved]);

  async function saveMany(list: Lead[]) {
    const todo = list.filter((l) => !saved.has(l.id));
    if (!todo.length) return;
    setSavingAll(true);
    setSaved((prev) => { const n = new Map(prev); todo.forEach((l) => n.set(l.id, "new")); return n; });
    for (let i = 0; i < todo.length; i += 5) await Promise.all(todo.slice(i, i + 5).map((l) => post(l).catch(() => null)));
    setSavingAll(false);
    setPicked(new Set());
  }

  const all = state.data?.leads ?? [];
  const scores = useMemo(() => new Map(all.map((l) => [l.id, scoreLead(l)])), [all]);
  const hotCount = all.filter((l) => scores.get(l.id)?.tier === "hot").length;

  const leads = useMemo(() => {
    let list = all;
    if (filter === "hot") list = all.filter((l) => scores.get(l.id)?.tier === "hot");
    else if (filter === "phone") list = all.filter((l) => l.phone);
    else if (filter === "nosite") list = all.filter((l) => !l.website);
    else if (filter === "email") list = all.filter((l) => l.email);
    else if (filter === "lowrating") list = all.filter((l) => l.rating != null && l.rating < 3.5);
    const by = [...list];
    if (sort === "score") by.sort((a, b) => (scores.get(b.id)?.value ?? 0) - (scores.get(a.id)?.value ?? 0));
    if (sort === "rating") by.sort((a, b) => (a.rating ?? 9) - (b.rating ?? 9));
    if (sort === "reviews") by.sort((a, b) => (a.ratingCount ?? 1e9) - (b.ratingCount ?? 1e9));
    if (sort === "name") by.sort((a, b) => a.name.localeCompare(b.name));
    return by;
  }, [all, filter, sort, scores]);

  const page = usePaged(leads, view === "table" ? 50 : 20);
  const chosen = leads.filter((l) => picked.has(l.id));
  const pick = (id: string, on: boolean) => setPicked((p) => { const n = new Set(p); if (on) n.add(id); else n.delete(id); return n; });
  const exportExtra = { headers: ["Score", "Best angle"], values: (l: Lead) => { const s = scoreLead(l); return [String(s.value), s.pitch]; } };
  const doExport = (list: Lead[]) => (f: Format) => exportLeads(f, `leads-${initialQ}-${initialCity}`, list, exportExtra);

  const filters: { id: Filter; label: string; n: number }[] = [
    { id: "all", label: "All", n: all.length },
    { id: "hot", label: "Hot leads", n: hotCount },
    { id: "phone", label: "Has phone", n: all.filter((l) => l.phone).length },
    { id: "nosite", label: "No website", n: all.filter((l) => !l.website).length },
    { id: "email", label: "Has email", n: all.filter((l) => l.email).length },
    { id: "lowrating", label: "Low rating", n: all.filter((l) => l.rating != null && l.rating < 3.5).length },
  ];

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSearch} className="gcard flex flex-col gap-2 rounded-2xl border bg-card p-2 sm:flex-row">
        <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5">
          <Store className="size-4 text-primary" aria-hidden /><span className="sr-only">Business type</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} list="niches-s" placeholder="Business type, e.g. dentist" required maxLength={60} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5">
          <MapPin className="size-4 text-primary" aria-hidden /><span className="sr-only">City</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, e.g. Pune" required maxLength={80} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        <datalist id="niches-s">{niches.map((n) => <option key={n} value={n} />)}</datalist>
        <Button type="submit" loading={state.status === "loading"}><Search /> Search</Button>
      </form>

      {state.status === "loading" && <SearchProgress q={initialQ} city={initialCity} />}

      {state.status === "error" && <EmptyState art={<IlFilter />} title={state.error ?? "Something went wrong."} body="Adjust your search above and try again." />}

      {state.status === "idle" && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <EmptyState className="max-w-none" art={<IlSearch />} title="Search to see your leads" body="Enter a business type and a city above. Every lead gets a score so the best ones come first." />
          <Card className="flex flex-col gap-5 p-5">
            <div>
              <h2 className="font-semibold">Try a popular search</h2>
              <div className="mt-3 flex flex-wrap gap-2">{niches.slice(0, 6).map((n) => <button key={n} type="button" onClick={() => { setQ(n); if (city.trim()) go(n, city); }} className={chip(q === n)}>{n}</button>)}</div>
              <p className="mt-2 text-xs text-muted-foreground">{city.trim() ? `Tap a type to search in ${city.trim()}.` : "Enter a city first, then tap a type."}</p>
            </div>
            {recent.length > 0 && (
              <div>
                <h2 className="font-semibold">Run a recent search again</h2>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {recent.map((s) => <li key={`${s.q}|${s.city}`}><button type="button" onClick={() => go(s.q, s.city)} className="flex w-full items-center justify-between rounded-lg border bg-card/60 px-3 py-2 text-left text-sm capitalize hover:bg-accent">{s.q} in {s.city}<Search className="size-3.5 text-muted-foreground" aria-hidden /></button></li>)}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}

      {state.status === "done" && state.data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { l: "Businesses found", v: all.length, icon: Store },
              { l: "Hot leads", v: hotCount, icon: Flame },
              { l: "No website", v: all.filter((x) => !x.website).length, icon: Search },
              { l: "With a phone", v: all.filter((x) => x.phone).length, icon: Bookmark },
            ].map(({ l, v, icon: Icon }) => (
              <Card key={l} className="p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">{l}<span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" aria-hidden /></span></div>
                <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{v}</p>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div role="tablist" aria-label="Filter leads" className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              {filters.map((f) => (
                <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={chip(filter === f.id)}>
                  {f.label} <span className="opacity-70">{f.n}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={sort} onChange={(e) => { setSort(e.target.value as Sort); savePrefs({ sort: e.target.value }); }} aria-label="Sort leads" className="h-8 rounded-lg border bg-card px-2.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="score">Best score first</option><option value="rating">Lowest rating first</option><option value="reviews">Fewest reviews first</option><option value="name">A to Z</option>
              </select>
              <div role="group" aria-label="Layout" className="inline-flex rounded-lg border bg-card/60 p-0.5">
                {([["cards", LayoutGrid, "Cards"], ["table", Rows3, "Table"]] as const).map(([v, Icon, label]) => (
                  <button key={v} type="button" aria-pressed={view === v} aria-label={`${label} view`} onClick={() => { setView(v); savePrefs({ view: v }); }} className={cn("grid size-7 place-items-center rounded-md", view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}><Icon className="size-4" aria-hidden /></button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPicked(chosen.length === leads.length ? new Set() : new Set(leads.map((l) => l.id)))} disabled={!leads.length}><Check /> {chosen.length === leads.length && leads.length ? "Clear selection" : "Select all"}</Button>
              <Button variant="outline" size="sm" loading={savingAll} onClick={() => saveMany(leads.filter((l) => scores.get(l.id)?.tier === "hot"))} disabled={!hotCount}><Flame /> Save hot leads</Button>
              <div className="ml-auto"><ExportMenu count={leads.length} disabled={!leads.length} onExport={doExport(leads)} /></div>
            </div>
          </div>

          {leads.length === 0 ? (
            <EmptyState art={<IlFilter />} title="No businesses match" body="Try another filter, a nearby larger city, or a different business type." action={<Button variant="outline" size="sm" onClick={() => setFilter("all")}>Show all</Button>} />
          ) : view === "cards" ? (
            <ul className="grid gap-4 md:grid-cols-2">
              {page.shown.map((l) => (
                <li key={l.id}>
                  <LeadCard lead={l} saved={saved.has(l.id)} contacted={!!saved.get(l.id) && saved.get(l.id) !== "new"} onToggleSave={() => toggleSave(l)} onMessage={() => setComposeFor(l)} selected={picked.has(l.id)} onSelect={(v) => pick(l.id, v)} />
                </li>
              ))}
            </ul>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b text-xs text-muted-foreground">
                  <tr><th className="w-10 p-3"><span className="sr-only">Select</span></th><th className="p-3 font-medium">Business</th><th className="p-3 font-medium">Phone</th><th className="p-3 font-medium">Rating</th><th className="p-3 font-medium">Website</th><th className="p-3 font-medium">Score</th><th className="p-3"><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody className="divide-y">
                  {page.shown.map((l) => (
                    <tr key={l.id} className={cn("hover:bg-accent/40", picked.has(l.id) && "bg-primary/5")}>
                      <td className="p-3"><input type="checkbox" checked={picked.has(l.id)} onChange={(e) => pick(l.id, e.target.checked)} aria-label={`Select ${l.name}`} className="size-4 cursor-pointer accent-[var(--primary)]" /></td>
                      <td className="max-w-[240px] p-3"><p className="truncate font-medium">{l.name}</p><p className="truncate text-xs text-muted-foreground">{l.category}</p></td>
                      <td className="p-3">{l.phone ? <a href={`tel:${l.phone}`} className="text-primary hover:underline">{l.phone}</a> : <span className="text-muted-foreground">None</span>}</td>
                      <td className="p-3 tabular-nums">{l.rating != null ? `★ ${l.rating.toFixed(1)}${l.ratingCount != null ? ` (${l.ratingCount})` : ""}` : <span className="text-muted-foreground">None</span>}</td>
                      <td className="p-3">{l.website ? <a href={l.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">Visit</a> : <Badge variant="hot">No website</Badge>}</td>
                      <td className="p-3"><ScoreRing lead={l} className="size-9 [&_span]:text-[11px]" /></td>
                      <td className="p-3"><div className="flex justify-end gap-1.5"><Button size="sm" variant="outline" onClick={() => setComposeFor(l)}>Message</Button><Button size="sm" variant={saved.has(l.id) ? "secondary" : "outline"} onClick={() => toggleSave(l)} aria-pressed={saved.has(l.id)} aria-label={saved.has(l.id) ? `Remove ${l.name} from saved` : `Save ${l.name}`}><Bookmark className={saved.has(l.id) ? "fill-primary text-primary" : ""} /></Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {page.hasMore && <ShowMore remaining={page.remaining} onClick={page.more} />}
          <p className="text-xs text-muted-foreground">
            {state.data.source === "google" ? "Business data from Google Maps." : "Data © OpenStreetMap contributors."} Details are as listed publicly and may be out of date. Scores are a guide based on what is listed.
          </p>
        </>
      )}

      {chosen.length > 0 && (
        <div role="region" aria-label="Selected leads" className="pop-in fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-2 rounded-2xl border bg-popover p-3 shadow-2xl shadow-black/50 lg:bottom-6">
          <p className="pl-1 text-sm font-medium">{chosen.length} selected</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" loading={savingAll} onClick={() => saveMany(chosen)}><Bookmark /> Save</Button>
            <ExportMenu count={chosen.length} onExport={doExport(chosen)} />
            <Button size="sm" variant="ghost" onClick={() => setPicked(new Set())} aria-label="Clear selection"><X /></Button>
          </div>
        </div>
      )}

      <OutreachSheet lead={composeFor} city={initialCity} open={!!composeFor} onOpenChange={(v) => !v && setComposeFor(null)} onSent={markContacted} />
    </div>
  );
}
