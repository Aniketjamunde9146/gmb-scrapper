"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RotateCw, Search } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { RowSkeleton, Skeleton } from "../ui/skeleton";
import { HoldToDelete } from "../ui/hold-to-delete";
import { EmptyState } from "./empty-state";
import { IlHistory } from "../landing/illustrations";
import type { SearchRec } from "../../lib/db";
import { cn } from "../../lib/utils";

const when = (iso: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));

export function HistoryView() {
  const [items, setItems] = useState<SearchRec[] | null>(null);
  const [term, setTerm] = useState("");

  useEffect(() => {
    fetch("/api/history").then((r) => r.json()).then((j: { searches?: SearchRec[] }) => setItems(j.searches ?? [])).catch(() => setItems([]));
  }, []);

  const shown = useMemo(() => (items ?? []).filter((s) => `${s.q} ${s.city}`.toLowerCase().includes(term.trim().toLowerCase())), [items, term]);

  async function remove(id: string) {
    setItems((p) => p?.filter((s) => s.id !== id) ?? p);
    await fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }
  async function clearAll() {
    setItems([]);
    await fetch("/api/history?all=1", { method: "DELETE" });
  }

  if (!items) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="flex justify-between gap-3"><Skeleton className="h-11 w-full max-w-sm rounded-xl" /><Skeleton className="h-10 w-36 rounded-lg" /></div>
        <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}</div>
      </div>
    );
  }
  if (!items.length) return <EmptyState art={<IlHistory />} title="No searches yet" body="Every search you run shows up here so you can repeat it later." action={<Link href="/dashboard/search" className={buttonVariants()}>Start a search</Link>} />;

  const totalLeads = items.reduce((n, s) => n + s.total, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {[["Searches", items.length], ["Leads found", totalLeads], ["No website", items.reduce((n, s) => n + s.noWebsite, 0)]].map(([l, v]) => (
          <Card key={l as string} className="p-4"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{new Intl.NumberFormat("en-IN").format(v as number)}</p></Card>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border bg-card/60 px-3 sm:max-w-sm">
          <Search className="size-4 text-muted-foreground" aria-hidden /><span className="sr-only">Filter history</span>
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Filter by business or city" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        <HoldToDelete size="md" label="Hold to clear all" holdMs={1500} onConfirm={clearAll} className="self-start sm:self-auto" />
      </div>
      {shown.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No searches match “{term}”.</p>}
      <ul className="grid gap-3">
        {shown.map((s) => {
          const share = s.total ? Math.round((s.noWebsite / s.total) * 100) : 0;
          return (
            <li key={s.id}>
              <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold capitalize">{s.q} in {s.city}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{when(s.at)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5"><Badge variant="outline">{s.total} leads</Badge><Badge variant="outline">{s.withPhone} with phone</Badge><Badge variant={share >= 30 ? "hot" : "outline"}>{s.noWebsite} no website ({share}%)</Badge></div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/dashboard/search?q=${encodeURIComponent(s.q)}&city=${encodeURIComponent(s.city)}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}><RotateCw /> Re-run</Link>
                  <HoldToDelete onConfirm={() => remove(s.id)} ariaLabel={`Hold to delete search ${s.q} in ${s.city}`} />
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
