"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, KanbanSquare, List, MessageSquareText, NotebookPen, Phone, Search } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { LeadCardSkeleton, Skeleton } from "../ui/skeleton";
import { HoldToDelete } from "../ui/hold-to-delete";
import { LeadCard, ScoreRing } from "./lead-card";
import { OutreachSheet } from "./outreach-sheet";
import { ShowMore, usePaged } from "./show-more";
import { ExportMenu } from "./export-menu";
import { EmptyState } from "./empty-state";
import { exportLeads, type Format } from "./export";
import { IlReminder, IlSaved } from "../landing/illustrations";
import { loadPrefs, savePrefs } from "../../lib/prefs";
import { scoreLead } from "../../lib/score";
import { STATUSES, STATUS_LABEL, type Lead, type SavedLead, type Status } from "../../lib/types";
import { cn } from "../../lib/utils";

type Sort = "recent" | "score" | "rating" | "name";
type View = "list" | "board";
const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const COL_DOT: Record<Status, string> = { new: "bg-slate-400", contacted: "bg-sky-500", interested: "bg-amber-500", won: "bg-emerald-500", lost: "bg-red-400" };

function Note({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(!!value);
  const [v, setV] = useState(value);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><NotebookPen className="size-3.5" aria-hidden /> Add note</button>;
  return <textarea value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onSave(v)} maxLength={1000} rows={2} placeholder="Call notes, price quoted, next step…" aria-label="Note" className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40" />;
}

function FollowUpChip({ date, status }: { date?: string; status: Status }) {
  if (!date || status === "won" || status === "lost") return null;
  const t = todayKey();
  const label = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));
  if (date < t) return <Badge variant="danger"><CalendarClock className="size-3" aria-hidden /> Overdue · {label}</Badge>;
  if (date === t) return <Badge variant="hot"><CalendarClock className="size-3" aria-hidden /> Today</Badge>;
  return <Badge variant="outline"><CalendarClock className="size-3" aria-hidden /> {label}</Badge>;
}

export function SavedView() {
  const [items, setItems] = useState<SavedLead[] | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [dueOnly, setDueOnly] = useState(false);
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [view, setView] = useState<View>("list");
  const [composeFor, setComposeFor] = useState<Lead | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const p = loadPrefs();
    if (p.savedView) setView(p.savedView);
    if (new URLSearchParams(location.search).get("due") === "1") setDueOnly(true);
    fetch("/api/saved").then((r) => r.json()).then((j: { saved?: SavedLead[] }) => setItems(j.saved ?? [])).catch(() => setItems([]));
  }, []);

  const today = todayKey();
  const isDue = (s: SavedLead) => !!s.followUp && s.followUp <= today && s.status !== "won" && s.status !== "lost";

  const shown = useMemo(() => {
    const t = term.trim().toLowerCase();
    let list = (items ?? []).filter((s) => (filter === "all" || s.status === filter) && (!dueOnly || isDue(s)) && (!t || `${s.lead.name} ${s.lead.category} ${s.lead.address ?? ""} ${s.note ?? ""}`.toLowerCase().includes(t)));
    if (sort === "score") list = [...list].sort((a, b) => scoreLead(b.lead).value - scoreLead(a.lead).value);
    if (sort === "rating") list = [...list].sort((a, b) => (b.lead.rating ?? 0) - (a.lead.rating ?? 0));
    if (sort === "name") list = [...list].sort((a, b) => a.lead.name.localeCompare(b.lead.name));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filter, term, sort, dueOnly, today]);
  const page = usePaged(shown);

  const patch = async (id: string, body: object) => {
    const res = await fetch("/api/saved", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
    if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setError(j.error ?? "Could not save that change."); } else setError("");
    return res.ok;
  };
  async function changeStatus(id: string, status: Status) {
    setItems((p) => p?.map((s) => (s.lead.id === id ? { ...s, status } : s)) ?? p);
    await patch(id, { status });
  }
  async function saveNote(id: string, note: string) {
    setItems((p) => p?.map((s) => (s.lead.id === id ? { ...s, note } : s)) ?? p);
    await patch(id, { note });
  }
  async function setFollowUp(id: string, followUp: string) {
    setItems((p) => p?.map((s) => (s.lead.id === id ? { ...s, followUp: followUp || undefined } : s)) ?? p);
    await patch(id, { followUp });
  }
  async function remove(id: string) {
    setItems((p) => p?.filter((s) => s.lead.id !== id) ?? p);
    await fetch(`/api/saved?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }
  async function removeAll() {
    setItems([]);
    await fetch("/api/saved?all=1", { method: "DELETE" });
  }
  function doExport(f: Format) {
    const byId = new Map((items ?? []).map((s) => [s.lead.id, s]));
    exportLeads(f, "saved-leads", shown.map((s) => s.lead), { headers: ["Status", "Follow-up", "Score", "Note"], values: (l) => [STATUS_LABEL[byId.get(l.id)!.status], byId.get(l.id)!.followUp ?? "", String(scoreLead(l).value), byId.get(l.id)!.note ?? ""] });
  }
  const markSent = (lead: Lead) => { const s = items?.find((x) => x.lead.id === lead.id); if (s && s.status === "new") changeStatus(lead.id, "contacted"); };

  if (!items) {
    return (
      <div className="flex flex-col gap-5" aria-busy="true">
        <div className="flex gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)}</div>
        <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <LeadCardSkeleton key={i} />)}</div>
      </div>
    );
  }
  if (items.length === 0) {
    return <EmptyState art={<IlSaved />} title="No saved leads yet" body="Tap the bookmark on any lead in your search results to keep it here and track it from New to Won." action={<Link href="/dashboard/search" className={buttonVariants()}>Search leads</Link>} />;
  }

  const count = (st: Status) => items.filter((s) => s.status === st).length;
  const dueCount = items.filter(isDue).length;
  const reached = count("contacted") + count("interested") + count("won") + count("lost");
  const winRate = reached ? Math.round((count("won") / reached) * 100) : 0;

  const footerFor = (s: SavedLead) => (
    <div className="flex flex-col gap-3 border-t pt-3">
      <Note value={s.note ?? ""} onSave={(v) => saveNote(s.lead.id, v)} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Status</span>
          <select value={s.status} onChange={(e) => changeStatus(s.lead.id, e.target.value as Status)} className="h-8 rounded-lg border bg-card px-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Follow up</span>
          <input type="date" value={s.followUp ?? ""} onChange={(e) => setFollowUp(s.lead.id, e.target.value)} className="h-8 rounded-lg border bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark]" />
        </label>
      </div>
      <div className="flex items-center justify-between gap-2">
        <FollowUpChip date={s.followUp} status={s.status} />
        <HoldToDelete label="Hold to remove" onConfirm={() => remove(s.lead.id)} ariaLabel={`Hold to remove ${s.lead.name}`} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[{ l: "Saved leads", v: items.length }, { l: "Follow-ups due", v: dueCount, hot: dueCount > 0 }, { l: "Interested", v: count("interested") }, { l: "Win rate", v: `${winRate}%` }].map((x) => (
          <Card key={x.l} hot={x.hot} className="p-4"><p className="text-sm text-muted-foreground">{x.l}</p><p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{x.v}</p></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          {([["all", "All"], ...STATUSES.map((st) => [st, STATUS_LABEL[st]])] as [Status | "all", string][]).map(([st, label]) => (
            <button key={st} onClick={() => setFilter(st)} aria-pressed={filter === st} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors", filter === st ? "border-primary bg-primary/10 font-semibold text-primary" : "bg-card/60 text-muted-foreground hover:bg-accent")}>
              {label} <span className="opacity-70">{st === "all" ? items.length : count(st)}</span>
            </button>
          ))}
          <button onClick={() => setDueOnly(!dueOnly)} aria-pressed={dueOnly} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors", dueOnly ? "border-primary bg-primary/10 font-semibold text-primary" : "bg-card/60 text-muted-foreground hover:bg-accent")}>
            <CalendarClock className="size-3.5" aria-hidden /> Due <span className="opacity-70">{dueCount}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border bg-card/60 px-3 sm:w-52 sm:flex-none">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden /><span className="sr-only">Search saved leads</span>
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search saved" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort leads" className="h-9 rounded-lg border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="recent">Newest</option><option value="score">Best score</option><option value="rating">Top rated</option><option value="name">A to Z</option>
          </select>
          <div role="group" aria-label="Layout" className="inline-flex rounded-lg border bg-card/60 p-0.5">
            {([["list", List, "List"], ["board", KanbanSquare, "Board"]] as const).map(([v, Icon, label]) => (
              <button key={v} type="button" aria-pressed={view === v} aria-label={`${label} view`} onClick={() => { setView(v); savePrefs({ savedView: v }); }} className={cn("grid size-8 place-items-center rounded-md", view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}><Icon className="size-4" aria-hidden /></button>
            ))}
          </div>
          <ExportMenu onExport={doExport} count={shown.length} disabled={!shown.length} />
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      {shown.length === 0 ? (
        dueOnly
          ? <EmptyState art={<IlReminder />} title="Nothing due" body="No follow-ups are due. Set a follow-up date on a lead and it will show up here." action={<Button variant="outline" size="sm" onClick={() => setDueOnly(false)}>Show all leads</Button>} />
          : <p className="py-10 text-center text-sm text-muted-foreground">No saved leads match this filter.</p>
      ) : view === "list" ? (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {page.shown.map((s) => (
              <li key={s.lead.id}>
                <LeadCard lead={s.lead} contacted={s.status !== "new"} onMessage={() => setComposeFor(s.lead)} footer={footerFor(s)} />
              </li>
            ))}
          </ul>
          {page.hasMore && <ShowMore remaining={page.remaining} onClick={page.more} />}
        </>
      ) : (
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 lg:mx-0 lg:px-0" aria-label="Pipeline board">
          {STATUSES.map((st) => {
            const col = shown.filter((s) => s.status === st);
            return (
              <section
                key={st}
                aria-label={`${STATUS_LABEL[st]} column`}
                onDragOver={(e) => { e.preventDefault(); setOverCol(st); }}
                onDragLeave={() => setOverCol((c) => (c === st ? null : c))}
                onDrop={() => { if (dragId) changeStatus(dragId, st); setDragId(null); setOverCol(null); }}
                className={cn("flex w-[17rem] shrink-0 snap-start flex-col gap-2.5 rounded-2xl border bg-card/50 p-2.5 transition-colors", overCol === st && "border-primary/60 bg-primary/5")}
              >
                <h3 className="flex items-center justify-between px-1.5 pt-1 text-sm font-semibold"><span className="flex items-center gap-2"><span className={cn("size-2.5 rounded-full", COL_DOT[st])} />{STATUS_LABEL[st]}</span><span className="text-muted-foreground tabular-nums">{col.length}</span></h3>
                {col.length === 0 && <p className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">Drop a lead here</p>}
                {col.map((s) => (
                  <article key={s.lead.id} draggable onDragStart={() => setDragId(s.lead.id)} onDragEnd={() => { setDragId(null); setOverCol(null); }} className={cn("cursor-grab rounded-xl border bg-card p-3 active:cursor-grabbing", dragId === s.lead.id && "opacity-40")}>
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{s.lead.name}</p><p className="truncate text-xs text-muted-foreground">{s.lead.category}</p></div>
                      <ScoreRing lead={s.lead} className="size-8 [&_span]:text-[10px]" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5"><FollowUpChip date={s.followUp} status={s.status} /></div>
                    {s.note && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{s.note}</p>}
                    <div className="mt-2.5 flex items-center gap-1.5">
                      {s.lead.phone && <a href={`tel:${s.lead.phone}`} aria-label={`Call ${s.lead.name}`} className="grid size-7 place-items-center rounded-md border hover:bg-accent"><Phone className="size-3.5" aria-hidden /></a>}
                      <button type="button" onClick={() => setComposeFor(s.lead)} aria-label={`Write message to ${s.lead.name}`} className="grid size-7 place-items-center rounded-md border text-primary hover:bg-primary/10"><MessageSquareText className="size-3.5" aria-hidden /></button>
                      <select value={s.status} onChange={(e) => changeStatus(s.lead.id, e.target.value as Status)} aria-label={`Move ${s.lead.name}`} className="ml-auto h-7 rounded-md border bg-card px-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {STATUSES.map((x) => <option key={x} value={x}>{STATUS_LABEL[x]}</option>)}
                      </select>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      )}

      <div className="flex justify-center pt-2"><HoldToDelete size="md" label="Hold to remove all saved leads" holdMs={2200} onConfirm={removeAll} /></div>
      <OutreachSheet lead={composeFor} open={!!composeFor} onOpenChange={(v) => !v && setComposeFor(null)} onSent={markSent} />
    </div>
  );
}
