"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, RotateCcw, Send, Star } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { FeedbackCategory, FeedbackRow, FeedbackStatus } from "../../lib/admin-db";

const when = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const CAT: Record<FeedbackCategory, { label: string; variant: "danger" | "hot" | "success" | "outline" }> = {
  bug: { label: "Bug", variant: "danger" },
  idea: { label: "Idea", variant: "hot" },
  praise: { label: "Praise", variant: "success" },
  other: { label: "Other", variant: "outline" },
};
const STATUS_LABEL: Record<FeedbackStatus, string> = { new: "New", reviewed: "Seen", resolved: "Resolved" };

function Item({ f, onDone }: { f: FeedbackRow; onDone: () => void }) {
  const [busy, setBusy] = useState("");
  const [reply, setReply] = useState(f.admin_reply ?? "");
  const [error, setError] = useState("");

  async function act(key: string, status: FeedbackStatus, withReply = false) {
    if (busy) return;
    setBusy(key);
    setError("");
    try {
      const res = await fetch("/api/admin/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: f.id, status, ...(withReply ? { reply } : {}) }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Failed.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy("");
    }
  }

  const replyChanged = reply.trim() !== (f.admin_reply ?? "");
  return (
    <li className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={CAT[f.category].variant}>{CAT[f.category].label}</Badge>
        {f.rating !== null && (
          <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${f.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("size-3.5", n <= f.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} aria-hidden />)}
          </span>
        )}
        <span className={cn("text-xs font-medium", f.status === "new" ? "text-amber-500" : f.status === "resolved" ? "text-emerald-500" : "text-muted-foreground")}>{STATUS_LABEL[f.status]}</span>
        <span className="ml-auto truncate text-xs text-muted-foreground">{f.email || "no email"} · {when(f.created_at)}</span>
      </div>
      <p className="whitespace-pre-wrap break-words">{f.message}</p>

      <div className="flex flex-wrap gap-2">
        <input value={reply} onChange={(e) => setReply(e.target.value)} maxLength={500} placeholder="Reply the user will see (optional)" aria-label="Reply to the user" className="h-9 min-w-0 flex-1 basis-56 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        <Button size="sm" variant="outline" loading={busy === "reply"} disabled={!!busy || !replyChanged || !reply.trim()} onClick={() => act("reply", f.status === "new" ? "reviewed" : f.status, true)}><Send /> Send reply</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {f.status !== "reviewed" && <Button size="sm" variant="outline" loading={busy === "reviewed"} disabled={!!busy} onClick={() => act("reviewed", "reviewed")}><Eye /> Mark seen</Button>}
        {f.status !== "resolved" && <Button size="sm" loading={busy === "resolved"} disabled={!!busy} onClick={() => act("resolved", "resolved")}><CheckCircle2 /> Resolve</Button>}
        {f.status !== "new" && <Button size="sm" variant="ghost" loading={busy === "new"} disabled={!!busy} onClick={() => act("new", "new")}><RotateCcw /> Reopen</Button>}
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </li>
  );
}

export function AdminFeedback({ items }: { items: FeedbackRow[] }) {
  const router = useRouter();
  if (items.length === 0) return <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">No feedback here yet.</p>;
  return <ul className="divide-y rounded-xl border bg-card">{items.map((f) => <Item key={f.id} f={f} onDone={() => router.refresh()} />)}</ul>;
}
