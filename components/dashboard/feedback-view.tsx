"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bug, CheckCircle2, Lightbulb, MessageCircle, Send, Smile, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PanelTitle } from "./page-header";
import { cn } from "../../lib/utils";
import type { FeedbackCategory, FeedbackRow } from "../../lib/admin-db";

const CATS: { id: FeedbackCategory; label: string; icon: typeof Bug }[] = [
  { id: "bug", label: "Something is broken", icon: Bug },
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "praise", label: "Something I like", icon: Smile },
  { id: "other", label: "Other", icon: MessageCircle },
];
const STATUS = { new: "Received", reviewed: "Seen by us", resolved: "Resolved" } as const;
const when = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export function FeedbackView({ items }: { items: FeedbackRow[] }) {
  const router = useRouter();
  const [cat, setCat] = useState<FeedbackCategory>("idea");
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMsg(null);
    if (text.trim().length < 5) return setMsg({ ok: false, text: "Please write at least 5 characters." });
    setBusy(true);
    try {
      const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: cat, message: text.trim(), rating }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not send your feedback.");
      setText("");
      setRating(null);
      setMsg({ ok: true, text: "Thank you! We read every message." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not send your feedback." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card className="p-4 sm:p-5">
        <PanelTitle icon={MessageCircle} title="Send feedback" hint="Found a bug, want a feature, or just want to say hi? Tell us." />
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div role="radiogroup" aria-label="Type of feedback" className="flex flex-wrap gap-2">
            {CATS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="radio" aria-checked={cat === id} onClick={() => setCat(id)}
                className={cn("inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors", cat === id ? "border-primary bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-accent")}>
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground" id="rate-l">How is GMB Scraper working for you? (optional)</span>
            <span role="radiogroup" aria-labelledby="rate-l" className="inline-flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(rating === n ? null : n)} className="p-0.5">
                  <Star className={cn("size-5 transition-colors", rating !== null && n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50 hover:text-amber-400")} aria-hidden />
                </button>
              ))}
            </span>
          </div>

          <div>
            <label htmlFor="fb" className="sr-only">Your message</label>
            <textarea id="fb" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={5} placeholder="What happened, or what would you like to see?"
              className="w-full resize-y rounded-xl border bg-card px-3.5 py-3 text-[15px] outline-none focus-visible:ring-4 focus-visible:ring-ring/20" />
            <p className="mt-1 text-right text-xs text-muted-foreground">{text.length}/1000</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={busy}><Send /> Send feedback</Button>
            {msg && <p role={msg.ok ? "status" : "alert"} className={cn("text-sm", msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>{msg.text}</p>}
          </div>
        </form>
      </Card>

      {items.length > 0 && (
        <section aria-labelledby="mine-h">
          <h2 id="mine-h" className="mb-3 text-lg font-semibold">Your messages</h2>
          <ul className="divide-y rounded-xl border bg-card">
            {items.map((f) => (
              <li key={f.id} className="flex flex-col gap-2 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{CATS.find((c) => c.id === f.category)?.label} · {when(f.created_at)}</span>
                  <span className={cn("inline-flex items-center gap-1 font-medium", f.status === "resolved" ? "text-emerald-500" : f.status === "reviewed" ? "text-foreground" : "text-amber-500")}>
                    {f.status === "resolved" && <CheckCircle2 className="size-3.5" aria-hidden />} {STATUS[f.status]}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words">{f.message}</p>
                {f.admin_reply && <p className="rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2"><span className="block text-xs font-medium text-primary">Reply from the team</span>{f.admin_reply}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
