"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { inr, shortRef, type PaymentRow } from "../../lib/billing";
import { cn } from "../../lib/utils";

const when = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

function Row({ r, onDone }: { r: PaymentRow; onDone: () => void }) {
  const [busy, setBusy] = useState<"" | "approve" | "reject">("");
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function act(action: "approve" | "reject") {
    if (busy) return;
    setBusy(action);
    setError("");
    try {
      const res = await fetch("/api/admin/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, action, note }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Failed.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
      setBusy("");
    }
  }

  return (
    <li className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{inr(r.amount_inr)} · {r.credits} searches <span className="text-muted-foreground">({r.pack})</span></p>
          <p className="truncate text-muted-foreground">{r.email || "no email"} · {when(r.created_at)}</p>
          <p className="mt-1 font-mono text-xs">UTR <span className="select-all text-foreground">{r.utr}</span> · Ref <span className="select-all">{shortRef(r.id)}</span></p>
        </div>
        {r.status === "pending" ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" loading={busy === "approve"} disabled={!!busy} onClick={() => act("approve")}><CheckCircle2 /> Approve</Button>
            <Button size="sm" variant="destructive" disabled={!!busy} onClick={() => setRejecting((v) => !v)}><XCircle /> Reject</Button>
          </div>
        ) : (
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", r.status === "approved" ? "text-emerald-500" : "text-destructive")}>
            {r.status === "approved" ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4" aria-hidden />} {r.status === "approved" ? "Approved" : "Rejected"}{r.reviewed_at ? ` · ${when(r.reviewed_at)}` : ""}
          </span>
        )}
      </div>
      {rejecting && r.status === "pending" && (
        <div className="flex flex-wrap gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Reason the user will see (optional)" aria-label="Rejection reason" className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          <Button size="sm" variant="destructive" loading={busy === "reject"} disabled={!!busy} onClick={() => act("reject")}>Confirm reject</Button>
        </div>
      )}
      {r.status === "rejected" && r.admin_note && <p className="text-xs text-muted-foreground">Note: {r.admin_note}</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </li>
  );
}

export function AdminPayments({ pending, done }: { pending: PaymentRow[]; done: PaymentRow[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  return (
    <div className="mt-6 flex flex-col gap-8">
      <section aria-labelledby="pend-h">
        <h2 id="pend-h" className="mb-3 flex items-center gap-2 text-lg font-semibold"><Clock className="size-5 text-amber-500" aria-hidden /> Waiting for approval ({pending.length})</h2>
        {pending.length === 0 ? <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Nothing waiting. New payments show up here.</p> : <ul className="divide-y rounded-xl border bg-card">{pending.map((r) => <Row key={r.id} r={r} onDone={refresh} />)}</ul>}
      </section>
      {done.length > 0 && (
        <section aria-labelledby="done-h">
          <h2 id="done-h" className="mb-3 text-lg font-semibold">Recently reviewed</h2>
          <ul className="divide-y rounded-xl border bg-card">{done.map((r) => <Row key={r.id} r={r} onDone={refresh} />)}</ul>
        </section>
      )}
    </div>
  );
}
