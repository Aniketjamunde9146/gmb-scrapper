"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, ChevronDown, Gauge, Minus, Plus, RotateCcw } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { inr } from "../../lib/billing";
import { cn } from "../../lib/utils";
import type { AdminUser } from "../../lib/admin-db";

const day = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "2-digit" }).format(new Date(iso));
const ago = (iso: string | null) => {
  if (!iso) return "never";
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
};
const input = "h-9 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background/50 p-3">
      <div><p className="text-sm font-medium">{title}</p>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>
      {children}
    </div>
  );
}

function UserRow({ u, defaultLimit, onDone }: { u: AdminUser; defaultLimit: number | null; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [amount, setAmount] = useState("10");
  const [limit, setLimit] = useState(u.daily_limit === null ? "" : String(u.daily_limit));
  const [reason, setReason] = useState("");
  const isAdmin = u.role === "admin";
  const cap = u.daily_limit ?? defaultLimit;
  const freeLeft = Math.max(3 - u.free_used, 0);

  async function call(key: string, body: Record<string, unknown>, done: string) {
    if (busy) return;
    setBusy(key);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: u.id, ...body }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Failed.");
      setMsg({ ok: true, text: done });
      onDone();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed." });
    } finally {
      setBusy("");
    }
  }

  const n = Number(amount);
  const validAmount = Number.isInteger(n) && n > 0 && n <= 10000;

  return (
    <li className={cn("flex flex-col gap-3 p-4 text-sm", u.blocked && "bg-destructive/5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grain-saffron grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold">{(u.name || u.email || "?").charAt(0).toUpperCase()}</span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-medium">
              <span className="truncate">{u.name || u.email.split("@")[0]}</span>
              {isAdmin && <Badge variant="outline">Admin</Badge>}
              {u.blocked && <Badge variant="danger">Blocked</Badge>}
              {u.paid_inr > 0 && <Badge variant="success">Paid {inr(u.paid_inr)}</Badge>}
            </p>
            <p className="truncate text-muted-foreground">{u.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {u.credits} credits · {freeLeft} free left · {u.searches_today}{cap !== null ? ` / ${cap}` : ""} today · {u.searches_total} total · last search {ago(u.last_search_at)} · joined {day(u.created_at)}
            </p>
            {u.blocked && u.blocked_reason && <p className="mt-1 text-xs text-destructive">Reason: {u.blocked_reason}</p>}
          </div>
        </div>
        <Button size="sm" variant="outline" aria-expanded={open} onClick={() => setOpen((v) => !v)}>Manage <ChevronDown className={cn("transition-transform", open && "rotate-180")} /></Button>
      </div>

      {open && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Block title="Credits" hint={`Balance now: ${u.credits}. It never goes below 0.`}>
            <div className="flex flex-wrap gap-2">
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" aria-label="Number of credits" className={cn(input, "w-24")} />
              <Button size="sm" loading={busy === "add"} disabled={!validAmount || !!busy} onClick={() => call("add", { action: "credits", delta: n }, `Added ${n} credits.`)}><Plus /> Add</Button>
              <Button size="sm" variant="outline" loading={busy === "sub"} disabled={!validAmount || !!busy} onClick={() => call("sub", { action: "credits", delta: -n }, `Removed ${n} credits.`)}><Minus /> Remove</Button>
            </div>
          </Block>

          <Block title="Daily search limit" hint={defaultLimit !== null ? `Empty = global default (${defaultLimit} a day). 0 = no searches.` : "Empty = no limit. 0 = no searches."}>
            <div className="flex flex-wrap gap-2">
              <input value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Default" aria-label="Daily limit" className={cn(input, "w-24")} />
              <Button size="sm" loading={busy === "limit"} disabled={!!busy || limit === (u.daily_limit === null ? "" : String(u.daily_limit))} onClick={() => call("limit", { action: "limit", limit: limit === "" ? null : Number(limit) }, limit === "" ? "Now follows the default limit." : `Limit set to ${limit} a day.`)}><Gauge /> Save</Button>
            </div>
          </Block>

          <Block title="Free searches" hint={`${u.free_used} of 3 free searches used.`}>
            <div><Button size="sm" variant="outline" loading={busy === "reset"} disabled={!!busy || u.free_used === 0} onClick={() => call("reset", { action: "reset_free" }, "Free searches reset to 3.")}><RotateCcw /> Reset free searches</Button></div>
          </Block>

          <Block title={u.blocked ? "Account is blocked" : "Block account"} hint={isAdmin ? "Admin accounts cannot be blocked." : u.blocked ? "They see a suspended screen and cannot search." : "They can still log in but cannot search. You can undo this any time."}>
            {isAdmin ? null : u.blocked ? (
              <div><Button size="sm" loading={busy === "unblock"} disabled={!!busy} onClick={() => call("unblock", { action: "unblock" }, "Account unblocked.")}><CheckCircle2 /> Unblock</Button></div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="Reason (the user sees it)" aria-label="Block reason" className={cn(input, "flex-1")} />
                <Button size="sm" variant="destructive" loading={busy === "block"} disabled={!!busy} onClick={() => call("block", { action: "block", reason }, "Account blocked.")}><Ban /> Block</Button>
              </div>
            )}
          </Block>
        </div>
      )}
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("text-xs", msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>{msg.text}</p>}
    </li>
  );
}

export function AdminUsers({ users, defaultLimit }: { users: AdminUser[]; defaultLimit: number | null }) {
  const router = useRouter();
  if (users.length === 0) return <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">No users match this search.</p>;
  return <ul className="divide-y rounded-xl border bg-card">{users.map((u) => <UserRow key={u.id} u={u} defaultLimit={defaultLimit} onDone={() => router.refresh()} />)}</ul>;
}
