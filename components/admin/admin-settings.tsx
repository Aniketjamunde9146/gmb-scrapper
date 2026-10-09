"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, PauseCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";
import type { AppSettings } from "../../lib/admin-db";

const field = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function AdminSettings({ initial }: { initial: AppSettings }) {
  const router = useRouter();
  const [limit, setLimit] = useState(initial.default_daily_limit === null ? "" : String(initial.default_daily_limit));
  const [paused, setPaused] = useState(initial.searches_paused);
  const [note, setNote] = useState(initial.announcement);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ default_daily_limit: limit === "" ? null : Number(limit), searches_paused: paused, announcement: note }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not save.");
      setMsg({ ok: true, text: "Saved." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex max-w-2xl flex-col gap-5">
      <Card className="flex flex-col gap-2 p-5">
        <label htmlFor="dl" className="font-medium">Default daily search limit</label>
        <p className="text-sm text-muted-foreground">Applies to every user who has no personal limit. Counts searches since midnight IST. Leave empty for no limit. Admins are never limited.</p>
        <input id="dl" value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="No limit" className={cn(field, "max-w-40")} />
      </Card>

      <Card className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="flex items-center gap-2 font-medium"><PauseCircle className="size-4 text-primary" aria-hidden /> Pause all searching</p>
          <p className="mt-1 text-sm text-muted-foreground">Emergency switch, for example if the map API quota runs out. Users see a notice and nobody is charged. Admins can still search.</p>
        </div>
        <button type="button" role="switch" aria-checked={paused} aria-label="Pause all searching" onClick={() => setPaused((v) => !v)}
          className={cn("relative mt-1 h-6 w-11 shrink-0 rounded-full border transition-colors", paused ? "border-primary bg-primary" : "bg-muted")}>
          <span className={cn("absolute top-0.5 size-5 rounded-full bg-background shadow transition-all", paused ? "left-[1.35rem]" : "left-0.5")} />
        </button>
      </Card>

      <Card className="flex flex-col gap-2 p-5">
        <label htmlFor="an" className="flex items-center gap-2 font-medium"><Megaphone className="size-4 text-primary" aria-hidden /> Announcement banner</label>
        <p className="text-sm text-muted-foreground">Shown at the top of every user dashboard. Clear it to hide the banner.</p>
        <textarea id="an" value={note} onChange={(e) => setNote(e.target.value)} maxLength={240} rows={3} placeholder="e.g. New: export leads to Excel from the Saved page." className={cn(field, "h-auto resize-y py-2")} />
        <p className="text-right text-xs text-muted-foreground">{note.length}/240</p>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={busy}>Save settings</Button>
        {msg && <p role="status" className={cn("text-sm", msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>{msg.text}</p>}
      </div>
    </form>
  );
}
